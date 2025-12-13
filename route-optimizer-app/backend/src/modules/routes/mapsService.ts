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

// OpenRouteService API Types
type OrsGeocodeFeature = {
  properties: {
    label: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
};

type OrsGeocodeResponse = {
  features: OrsGeocodeFeature[];
};

type OrsMatrixResponse = {
  distances?: number[][]; // meters
  durations?: number[][]; // seconds
};

const ORS_GEOCODE_URL = 'https://api.openrouteservice.org/geocode/search';
const ORS_MATRIX_URL = 'https://api.openrouteservice.org/v2/matrix/driving-car';

// Fallback: se não tiver ORS key, usa Nominatim (OpenStreetMap) - totalmente grátis mas mais lento
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const assertApiKey = () => {
  if (!env.OPENROUTE_API_KEY) {
    console.warn('⚠️  OpenRouteService API key not configured, using free Nominatim for geocoding');
  }
};

const formatDistance = (meters: number): string => {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

// Geocoding usando OpenRouteService (se tiver key) ou Nominatim (fallback gratuito)
export const geocodeAddress = async (address: string): Promise<{ address: string; location: LatLng }> => {
  assertApiKey();

  // Tenta OpenRouteService primeiro (se tiver key)
  if (env.OPENROUTE_API_KEY) {
    try {
      const params = new URLSearchParams({
        text: address,
        size: '1',
      });

      const response = await fetch(`${ORS_GEOCODE_URL}?${params.toString()}`, {
        headers: {
          'Authorization': env.OPENROUTE_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`ORS geocoding failed: ${response.status}`);
      }

      const data = (await response.json()) as OrsGeocodeResponse;

      if (!data.features || data.features.length === 0) {
        throw new AppError('Address not found', 400);
      }

      const feature = data.features[0];
      const [lng, lat] = feature.geometry.coordinates;

      return {
        address: feature.properties.label,
        location: { lat, lng },
      };
    } catch (error) {
      console.error('ORS geocoding failed, falling back to Nominatim:', error);
    }
  }

  // Fallback: Nominatim (OpenStreetMap) - TOTALMENTE GRÁTIS
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
  });

  const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    headers: {
      'User-Agent': 'RouteOptimizerApp/1.0', // Nominatim exige User-Agent
    },
  });

  if (!response.ok) {
    throw new AppError('Failed to geocode address', response.status);
  }

  const data = await response.json();

  if (!Array.isArray(data) || data.length === 0) {
    throw new AppError('Address not found', 400);
  }

  const result = data[0];

  return {
    address: result.display_name || address,
    location: {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    },
  };
};

// Distance Matrix usando OpenRouteService
export const getDistanceMatrix = async (
  origins: LatLng[],
  destinations: LatLng[],
): Promise<DistanceMatrixResult[][]> => {
  if (!origins.length || !destinations.length) {
    return [];
  }

  if (!env.OPENROUTE_API_KEY) {
    // Fallback: cálculo euclidiano simples se não tiver key
    console.warn('⚠️  Using Haversine distance (no OpenRouteService key). Results will be less accurate.');
    return calculateHaversineMatrix(origins, destinations);
  }

  // Para ORS Matrix API, precisamos combinar origins e destinations em um único array
  // e especificar os índices de sources e destinations
  const allPoints = [...origins, ...destinations];
  const uniquePoints = deduplicatePoints(allPoints);

  const locations = uniquePoints.map(({ lng, lat }) => [lng, lat]);

  try {
    const response = await fetch(ORS_MATRIX_URL, {
      method: 'POST',
      headers: {
        'Authorization': env.OPENROUTE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locations,
        metrics: ['distance', 'duration'],
        units: 'm', // meters
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ORS Matrix API error:', errorText);
      throw new Error(`OpenRouteService matrix failed: ${response.status}`);
    }

    const data = (await response.json()) as OrsMatrixResponse;

    if (!data.distances || !data.durations) {
      throw new Error('Invalid response from OpenRouteService');
    }

    // Mapear de volta para a estrutura original
    const originIndexMap = origins.map(point =>
      uniquePoints.findIndex(p => p.lat === point.lat && p.lng === point.lng)
    );

    const destIndexMap = destinations.map(point =>
      uniquePoints.findIndex(p => p.lat === point.lat && p.lng === point.lng)
    );

    return originIndexMap.map((originIdx) =>
      destIndexMap.map((destIdx) => {
        const distanceMeters = data.distances![originIdx][destIdx];
        const durationSeconds = data.durations![originIdx][destIdx];

        return {
          status: 'OK',
          distanceMeters,
          durationSeconds,
          distanceText: formatDistance(distanceMeters),
          durationText: formatDuration(durationSeconds),
        };
      }),
    );
  } catch (error) {
    console.error('OpenRouteService failed, using Haversine fallback:', error);
    return calculateHaversineMatrix(origins, destinations);
  }
};

// Fallback: Haversine distance (distância em linha reta, mas melhor que nada)
const haversineDistance = (point1: LatLng, point2: LatLng): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // meters
};

const calculateHaversineMatrix = (
  origins: LatLng[],
  destinations: LatLng[],
): DistanceMatrixResult[][] => {
  return origins.map((origin) =>
    destinations.map((dest) => {
      const distanceMeters = haversineDistance(origin, dest);
      // Estimativa de duração: 40 km/h em área urbana
      const durationSeconds = (distanceMeters / 1000 / 40) * 3600;

      return {
        status: 'OK',
        distanceMeters,
        durationSeconds,
        distanceText: formatDistance(distanceMeters),
        durationText: formatDuration(durationSeconds),
      };
    }),
  );
};

const deduplicatePoints = (points: LatLng[]): LatLng[] => {
  const seen = new Set<string>();
  return points.filter((point) => {
    const key = `${point.lat.toFixed(6)},${point.lng.toFixed(6)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const buildGoogleMapsRouteUrl = (start: LatLng, stops: LatLng[]): string => {
  const waypoints = stops.map(({ lat, lng }) => `${lat},${lng}`).join('/');
  const startPoint = `${start.lat},${start.lng}`;
  const path = [startPoint, waypoints].filter(Boolean).join('/');
  return `https://www.google.com/maps/dir/${path}`;
};
