import { type Driver } from '@prisma/client';
import { prisma } from '../../prisma/client';
import { AppError } from '../../middlewares/errorHandler';
import { BusinessService } from '../business/businessService';

export interface DriverInput {
  name?: string;
  phone?: string | null;
  vehicleType?: string | null;
  isActive?: boolean;
}

export class DriversService {
  static async listDrivers(userId: string): Promise<Driver[]> {
    const business = await BusinessService.getBusinessOrThrow(userId);
    return prisma.driver.findMany({ where: { businessId: business.id } });
  }

  static async createDriver(userId: string, data: DriverInput): Promise<Driver> {
    if (!data.name) {
      throw new AppError('Driver name is required', 400);
    }

    const business = await BusinessService.getBusinessOrThrow(userId);

    return prisma.driver.create({
      data: {
        name: data.name,
        phone: data.phone,
        vehicleType: data.vehicleType,
        isActive: data.isActive ?? true,
        businessId: business.id,
      },
    });
  }

  static async updateDriver(userId: string, driverId: string, data: DriverInput): Promise<Driver> {
    const business = await BusinessService.getBusinessOrThrow(userId);
    const driver = await prisma.driver.findFirst({ where: { id: driverId, businessId: business.id } });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    return prisma.driver.update({
      where: { id: driverId },
      data: {
        name: data.name,
        phone: data.phone,
        vehicleType: data.vehicleType,
        isActive: data.isActive,
      },
    });
  }

  static async deleteDriver(userId: string, driverId: string): Promise<void> {
    const business = await BusinessService.getBusinessOrThrow(userId);
    const driver = await prisma.driver.findFirst({ where: { id: driverId, businessId: business.id } });

    if (!driver) {
      throw new AppError('Driver not found', 404);
    }

    await prisma.driver.delete({ where: { id: driverId } });
  }
}
