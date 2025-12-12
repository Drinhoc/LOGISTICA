import { type DistanceMatrixResult, type LatLng } from './mapsService';

type Priority = 'HIGH' | 'MEDIUM' | 'LOW' | 'NORMAL' | string;

export interface StopInput {
  id: string;
  address: string;
  clientName: string;
  priority?: Priority;
  location: LatLng;
}

export interface DriverInput {
  id: string;
  name: string;
}

export interface OptimizedDriverRoute {
  driverId: string;
  orderedStops: StopInput[];
  distanceKm: number;
  durationMinutes: number;
}

const HIGH_PRIORITY = 'HIGH';

const distanceBetween = (matrix: DistanceMatrixResult[][], fromIndex: number, toIndex: number) =>
  matrix[fromIndex]?.[toIndex] ?? { distanceMeters: Infinity, durationSeconds: Infinity };

const routeTotals = (matrix: DistanceMatrixResult[][], orderedStopIndexes: number[]) => {
  if (!orderedStopIndexes.length) {
    return { distanceMeters: 0, durationSeconds: 0 };
  }

  let distanceMeters = 0;
  let durationSeconds = 0;

  // Start -> first stop
  const firstStopMatrixIndex = orderedStopIndexes[0] + 1;
  const firstLeg = distanceBetween(matrix, 0, firstStopMatrixIndex);
  distanceMeters += firstLeg.distanceMeters;
  durationSeconds += firstLeg.durationSeconds;

  // Between stops
  for (let i = 0; i < orderedStopIndexes.length - 1; i += 1) {
    const currentMatrixIndex = orderedStopIndexes[i] + 1;
    const nextMatrixIndex = orderedStopIndexes[i + 1] + 1;
    const leg = distanceBetween(matrix, currentMatrixIndex, nextMatrixIndex);
    distanceMeters += leg.distanceMeters;
    durationSeconds += leg.durationSeconds;
  }

  return { distanceMeters, durationSeconds };
};

const twoOpt = (order: number[], matrix: DistanceMatrixResult[][]): number[] => {
  if (order.length < 4) return order;

  const newOrder = [...order];
  let improved = true;

  while (improved) {
    improved = false;

    for (let i = 1; i < newOrder.length - 2; i += 1) {
      for (let k = i + 1; k < newOrder.length - 1; k += 1) {
        const a = newOrder[i - 1];
        const b = newOrder[i];
        const c = newOrder[k];
        const d = newOrder[k + 1];

        const currentDistance =
          distanceBetween(matrix, (a ?? -1) + 1, (b ?? -1) + 1).distanceMeters +
          distanceBetween(matrix, (c ?? -1) + 1, (d ?? -1) + 1).distanceMeters;

        const newDistance =
          distanceBetween(matrix, (a ?? -1) + 1, (c ?? -1) + 1).distanceMeters +
          distanceBetween(matrix, (b ?? -1) + 1, (d ?? -1) + 1).distanceMeters;

        if (newDistance < currentDistance) {
          const reversed = newOrder.slice(i, k + 1).reverse();
          newOrder.splice(i, reversed.length, ...reversed);
          improved = true;
        }
      }
    }
  }

  return newOrder;
};

const nearestNeighbourRoute = (
  stops: StopInput[],
  distanceMatrix: DistanceMatrixResult[][],
): number[] => {
  const remaining = stops.map((_, index) => index);
  const route: number[] = [];
  let currentMatrixIndex = 0; // start position

  while (remaining.length) {
    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const stopIndex = remaining[i];
      const matrixIndex = stopIndex + 1;
      const leg = distanceBetween(distanceMatrix, currentMatrixIndex, matrixIndex);

      const priorityMultiplier = stops[stopIndex].priority === HIGH_PRIORITY ? 0.8 : 1;
      const score = leg.distanceMeters * priorityMultiplier;

      if (score < bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const [nextStop] = remaining.splice(bestIndex, 1);
    route.push(nextStop);
    currentMatrixIndex = nextStop + 1;
  }

  return route;
};

const sliceMatrixForStops = (
  fullMatrix: DistanceMatrixResult[][],
  stopIndexes: number[],
): DistanceMatrixResult[][] => {
  const matrixIndexes = [0, ...stopIndexes.map((index) => index + 1)];
  return matrixIndexes.map((row) => matrixIndexes.map((col) => fullMatrix[row][col]));
};

const euclidean = (a: LatLng, b: LatLng) => {
  const dLat = a.lat - b.lat;
  const dLng = a.lng - b.lng;
  return Math.sqrt(dLat * dLat + dLng * dLng);
};

const kMeansAssign = (stops: StopInput[], k: number): number[][] => {
  if (!stops.length || k <= 0) return [];

  // Initialize centroids with first k stops for determinism
  let centroids = stops.slice(0, k).map((stop) => stop.location);
  let assignments: number[][] = Array.from({ length: k }, () => []);

  for (let iteration = 0; iteration < 8; iteration += 1) {
    assignments = Array.from({ length: k }, () => []);

    stops.forEach((stop, index) => {
      let bestCluster = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      centroids.forEach((centroid, clusterIndex) => {
        const distance = euclidean(stop.location, centroid);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestCluster = clusterIndex;
        }
      });

      assignments[bestCluster].push(index);
    });

    const newCentroids = centroids.map((centroid, clusterIndex) => {
      const clusterStops = assignments[clusterIndex];
      if (!clusterStops.length) return centroid;

      const sum = clusterStops.reduce(
        (acc, stopIndex) => {
          acc.lat += stops[stopIndex].location.lat;
          acc.lng += stops[stopIndex].location.lng;
          return acc;
        },
        { lat: 0, lng: 0 },
      );

      return {
        lat: sum.lat / clusterStops.length,
        lng: sum.lng / clusterStops.length,
      };
    });

    // If centroids didn't move, we can break early
    const stable = newCentroids.every(
      (centroid, index) => centroid.lat === centroids[index].lat && centroid.lng === centroids[index].lng,
    );

    centroids = newCentroids;
    if (stable) break;
  }

  return assignments;
};

export const optimizeSingleDriverRoute = (
  start: LatLng,
  stops: StopInput[],
  distanceMatrix: DistanceMatrixResult[][],
  _costSettings?: unknown,
): OptimizedDriverRoute => {
  if (!stops.length) {
    return {
      driverId: '',
      orderedStops: [],
      distanceKm: 0,
      durationMinutes: 0,
    };
  }

  // Initial heuristic with nearest neighbour favouring high-priority deliveries first when close enough
  let order = nearestNeighbourRoute(stops, distanceMatrix);

  // Optional 2-opt improvement to reduce total travel distance
  order = twoOpt(order, distanceMatrix);

  const { distanceMeters, durationSeconds } = routeTotals(distanceMatrix, order);

  return {
    driverId: '',
    orderedStops: order.map((index) => stops[index]),
    distanceKm: distanceMeters / 1000,
    durationMinutes: durationSeconds / 60,
  };
};

export const optimizeMultiDriverRoute = (
  start: LatLng,
  stops: StopInput[],
  drivers: DriverInput[],
  distanceMatrix: DistanceMatrixResult[][],
  costSettings?: unknown,
): OptimizedDriverRoute[] => {
  if (!drivers.length) return [];
  if (!stops.length) {
    return drivers.map((driver) => ({ driverId: driver.id, orderedStops: [], distanceKm: 0, durationMinutes: 0 }));
  }

  const k = Math.min(drivers.length, stops.length);
  const clusters = kMeansAssign(stops, k);

  const results: OptimizedDriverRoute[] = drivers.map((driver) => ({
    driverId: driver.id,
    orderedStops: [],
    distanceKm: 0,
    durationMinutes: 0,
  }));

  clusters.forEach((clusterStopIndexes, clusterIndex) => {
    const clusterStops = clusterStopIndexes.map((index) => stops[index]);
    const subMatrix = sliceMatrixForStops(distanceMatrix, clusterStopIndexes);

    const optimized = optimizeSingleDriverRoute(start, clusterStops, subMatrix, costSettings);

    // Attach to the driver for this cluster index (remaining drivers stay empty if more drivers than clusters)
    const driver = results[clusterIndex];
    if (driver) {
      driver.orderedStops = optimized.orderedStops;
      driver.distanceKm = optimized.distanceKm;
      driver.durationMinutes = optimized.durationMinutes;
    }
  });

  return results;
};
