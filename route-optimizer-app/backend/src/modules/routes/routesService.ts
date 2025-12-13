import { Prisma, RouteStatus } from '@prisma/client';
import {
  buildGoogleMapsRouteUrl,
  geocodeAddress,
  getDistanceMatrix,
  type LatLng,
} from './mapsService';
import {
  optimizeMultiDriverRoute,
  optimizeSingleDriverRoute,
  type DriverInput,
  type StopInput,
} from './routeOptimizationService';
import { AppError } from '../../middlewares/errorHandler';
import { prisma } from '../../prisma/client';
import { BusinessService } from '../business/businessService';
import { CostSettingsService } from '../costSettings/costSettingsService';

export type OptimizeMode = 'SINGLE_DRIVER' | 'AUTO_DISTRIBUTION';

export interface OptimizeRouteStopInput {
  client_name: string;
  address: string;
  priority?: string;
}

export interface OptimizeRoutePayload {
  name: string;
  date?: string;
  start_address: string;
  num_drivers: number;
  driver_ids?: string[];
  mode: OptimizeMode;
  stops: OptimizeRouteStopInput[];
}

const sanitizeDrivers = async (
  businessId: string,
  payload: OptimizeRoutePayload,
): Promise<{ driverInputs: DriverInput[]; driverIds: string[] }> => {
  const activeDrivers = await prisma.driver.findMany({
    where: { businessId, isActive: true },
  });

  if (payload.mode === 'SINGLE_DRIVER') {
    const chosenId = payload.driver_ids?.[0] ?? activeDrivers[0]?.id;
    if (!chosenId) {
      throw new AppError('No available drivers for this business', 400);
    }

    const driver = activeDrivers.find((d) => d.id === chosenId);
    if (!driver) {
      throw new AppError('Selected driver not found for this business', 404);
    }

    return {
      driverInputs: [{ id: driver.id, name: driver.name }],
      driverIds: [driver.id],
    };
  }

  const requestedDrivers = payload.driver_ids?.length
    ? activeDrivers.filter((d) => payload.driver_ids?.includes(d.id))
    : activeDrivers.slice(0, payload.num_drivers);

  if (!requestedDrivers.length) {
    throw new AppError('At least one driver is required for optimization', 400);
  }

  if (requestedDrivers.length < payload.num_drivers) {
    throw new AppError('Not enough active drivers to satisfy request', 400);
  }

  const selected = requestedDrivers.slice(0, Math.min(payload.num_drivers, 5));

  return {
    driverInputs: selected.map((driver) => ({ id: driver.id, name: driver.name })),
    driverIds: selected.map((driver) => driver.id),
  };
};

const buildDistanceMatrix = async (start: LatLng, stops: StopInput[]) => {
  const points = [start, ...stops.map((stop) => stop.location)];
  return getDistanceMatrix(points, points);
};

const calculateCosts = (
  distancesKm: number,
  durationMinutes: number,
  costPerKm: number,
  costPerHour: number,
) => {
  const distanceCost = distancesKm * costPerKm;
  const durationCost = (durationMinutes / 60) * costPerHour;
  return distanceCost + durationCost;
};

export class RoutesService {
  static async optimizeAndCreateRoute(userId: string, payload: OptimizeRoutePayload) {
    if (!payload.name) {
      throw new AppError('Route name is required', 400);
    }

    if (!payload.start_address) {
      throw new AppError('Start address is required', 400);
    }

    if (!Array.isArray(payload.stops) || payload.stops.length === 0) {
      throw new AppError('At least one stop is required', 400);
    }

    const business = await BusinessService.getBusinessOrThrow(userId);
    const costSettings = await CostSettingsService.getCostSettings(userId);
    const { driverInputs, driverIds } = await sanitizeDrivers(business.id, payload);

    const startGeocode = await geocodeAddress(payload.start_address);
    const geocodedStops = await Promise.all(
      payload.stops.map(async (stop, index) => {
        const geocoded = await geocodeAddress(stop.address);
        return {
          id: `stop-${index}`,
          clientName: stop.client_name,
          address: geocoded.address,
          priority: stop.priority ?? 'NORMAL',
          location: geocoded.location,
          originalIndex: index,
        } satisfies StopInput & { originalIndex: number };
      }),
    );

    const distanceMatrix = await buildDistanceMatrix(startGeocode.location, geocodedStops);

    const optimizationResults =
      payload.mode === 'SINGLE_DRIVER'
        ? [
            {
              ...optimizeSingleDriverRoute(startGeocode.location, geocodedStops, distanceMatrix, costSettings),
              driverId: driverInputs[0].id,
            },
          ]
        : optimizeMultiDriverRoute(startGeocode.location, geocodedStops, driverInputs, distanceMatrix, costSettings);

    const costPerKm = Number(costSettings.costPerKm);
    const costPerHour = Number(costSettings.costPerHour);

    const stopIndexById = geocodedStops.reduce<Record<string, number>>((acc, stop, index) => {
      acc[stop.id] = index;
      return acc;
    }, {});

    let overallDistanceKm = 0;
    let overallDurationMinutes = 0;

    const assignmentPayload = optimizationResults.map((result, index) => {
      overallDistanceKm += result.distanceKm;
      overallDurationMinutes += result.durationMinutes;

      return {
        driverId: driverIds[index],
        position: index,
        distanceKm: new Prisma.Decimal(result.distanceKm || 0),
        durationMinutes: Math.round(result.durationMinutes || 0),
        cost: new Prisma.Decimal(calculateCosts(result.distanceKm, result.durationMinutes, costPerKm, costPerHour)),
      };
    });

    const firstDriverRoute = optimizationResults.find((route) => route.orderedStops.length);
    const mapUrl = firstDriverRoute
      ? buildGoogleMapsRouteUrl(
          startGeocode.location,
          firstDriverRoute.orderedStops.map((stop) => stop.location),
        )
      : '';

    const whatsappSections = optimizationResults.map((result, index) => {
      const driverName = driverInputs[index]?.name ?? `Motorista ${index + 1}`;
      const stopsText = result.orderedStops
        .map((stop, idx) => `${idx + 1}. ${stop.clientName} - ${stop.address}`)
        .join('\n');
      return `*${driverName}*\n${stopsText}`;
    });

    const whatsappText = [`Rota: ${payload.name}`, payload.date ? `Data: ${payload.date}` : '', ...whatsappSections]
      .filter(Boolean)
      .join('\n\n');

    let stopOrderCounter = 1;

    const route = await prisma.route.create({
      data: {
        businessId: business.id,
        name: payload.name,
        scheduledDate: payload.date ? new Date(payload.date) : null,
        status: RouteStatus.OPTIMIZED,
        totalDistanceKm: new Prisma.Decimal(overallDistanceKm || 0),
        totalDurationMinutes: Math.round(overallDurationMinutes || 0),
        totalCost: new Prisma.Decimal(
          calculateCosts(overallDistanceKm, overallDurationMinutes, costPerKm, costPerHour),
        ),
        googleMapsLink: mapUrl,
        whatsappMessage: whatsappText,
        assignments: { create: assignmentPayload },
        stops: {
          create: optimizationResults.flatMap((result, driverIndex) => {
            const driverId = driverIds[driverIndex];

            return result.orderedStops.map((stop, idx) => {
              const currentIdx = stopIndexById[stop.id];
              const previous = idx === 0 ? null : result.orderedStops[idx - 1];
              const previousMatrixIndex = previous ? stopIndexById[previous.id] + 1 : 0;
              const currentMatrixIndex = currentIdx + 1;
              const distance = distanceMatrix?.[previousMatrixIndex]?.[currentMatrixIndex];

              const distanceKm = (distance?.distanceMeters ?? 0) / 1000;

              const payloadStop: Prisma.StopCreateWithoutRouteInput = {
                order: stopOrderCounter++,
                title: stop.clientName,
                address: stop.address,
                latitude: new Prisma.Decimal(stop.location.lat),
                longitude: new Prisma.Decimal(stop.location.lng),
                distanceFromPreviousKm: distanceKm ? new Prisma.Decimal(distanceKm) : null,
                assignedDriver: {
                  connect: { id: driverId },
                },
              };

              return payloadStop;
            });
          }),
        },
      },
      include: {
        assignments: true,
        stops: true,
      },
    });

    return route;
  }

  static async listRoutes(userId: string) {
    const business = await BusinessService.getBusinessOrThrow(userId);
    return prisma.route.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: 'desc' },
      include: { assignments: true, stops: true },
    });
  }

  static async getRouteById(userId: string, routeId: string) {
    const business = await BusinessService.getBusinessOrThrow(userId);
    const route = await prisma.route.findFirst({
      where: { id: routeId, businessId: business.id },
      include: { assignments: true, stops: true },
    });

    if (!route) {
      throw new AppError('Route not found', 404);
    }

    return route;
  }

  static async deleteRoute(userId: string, routeId: string) {
    const business = await BusinessService.getBusinessOrThrow(userId);
    const route = await prisma.route.findFirst({ where: { id: routeId, businessId: business.id } });

    if (!route) {
      throw new AppError('Route not found', 404);
    }

    await prisma.route.delete({ where: { id: routeId } });
  }
}
