import { env } from '../../config/env';
import { AppError } from '../../middlewares/errorHandler';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distanceMeters: number;
  durationSeconds: number;
  distanceText: string;
  durationText: string;
  status: string;
}

type GeocodeApiResult = {
  formatted_address: string;
  geometry: {
    location: LatLng;
  };
};

type GeocodeApiResponse = {
  status: string;
  results: GeocodeApiResult[];
  error_message?: string;
};

type DistanceMatrixElement = {
  status: string;
  distance?: {
    value: number;
    text: string;
  };
  duration?: {
    value: number;
    text: string;
  };
};

type DistanceMatrixApiResponse = {
  status: string;
  rows: { elements: DistanceMatrixElement[] }[];
  error_message?: string;
};

const GOOGLE_GEOCODE_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const GOOGLE_DISTANCE_MATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

const assertApiKey = () => {
  if (!env.GOOGLE_MAPS_API_KEY) {
    throw new AppError('Google Maps API key is missing', 500);
  }
};

export const geocodeAddress = async (address: string): Promise<{ address: string; location: LatLng }> => {
  assertApiKey();

  const params = new URLSearchParams({
    address,
    key: env.GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(`${GOOGLE_GEOCODE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new AppError('Failed to call geocoding service', response.status);
  }

  const data = (await response.json()) as GeocodeApiResponse;
  if (data.status !== 'OK' || data.results.length === 0) {
    const message = data.error_message ?? 'Address not found';
    throw new AppError(`Geocoding error: ${message}`, 400);
  }

  const first = data.results[0];
  return {
    address: first.formatted_address,
    location: first.geometry.location,
  };
};

export const getDistanceMatrix = async (
  origins: LatLng[],
  destinations: LatLng[],
): Promise<DistanceMatrixResult[][]> => {
  assertApiKey();

  if (!origins.length || !destinations.length) {
    return [];
  }

  const formatLatLngList = (points: LatLng[]) => points.map(({ lat, lng }) => `${lat},${lng}`).join('|');

  const params = new URLSearchParams({
    origins: formatLatLngList(origins),
    destinations: formatLatLngList(destinations),
    key: env.GOOGLE_MAPS_API_KEY,
  });

  const response = await fetch(`${GOOGLE_DISTANCE_MATRIX_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new AppError('Failed to call distance matrix service', response.status);
  }

  const data = (await response.json()) as DistanceMatrixApiResponse;
  if (data.status !== 'OK') {
    const message = data.error_message ?? 'Unable to calculate distances';
    throw new AppError(`Distance matrix error: ${message}`, 400);
  }

  return data.rows.map((row) =>
    row.elements.map((element) => ({
      status: element.status,
      distanceMeters: element.distance?.value ?? 0,
      durationSeconds: element.duration?.value ?? 0,
      distanceText: element.distance?.text ?? '',
      durationText: element.duration?.text ?? '',
    })),
  );
};

export const buildGoogleMapsRouteUrl = (start: LatLng, stops: LatLng[]): string => {
  const waypoints = stops.map(({ lat, lng }) => `${lat},${lng}`).join('/');
  const startPoint = `${start.lat},${start.lng}`;
  const path = [startPoint, waypoints].filter(Boolean).join('/');
  return `https://www.google.com/maps/dir/${path}`;
};
