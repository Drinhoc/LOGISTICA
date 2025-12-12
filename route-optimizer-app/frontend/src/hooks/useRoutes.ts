import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export type RouteAssignment = {
  id: string;
  driverId: string;
  position: number;
  distanceKm: number | string;
  durationMinutes: number;
  cost: number | string;
};

export type RouteStop = {
  id: string;
  order: number;
  title: string;
  address: string;
  latitude: number | string;
  longitude: number | string;
  distanceFromPreviousKm: number | string | null;
  assignedDriverId: string | null;
};

export type RouteItem = {
  id: string;
  name: string;
  scheduledDate: string | null;
  createdAt: string;
  totalDistanceKm: number | string;
  totalDurationMinutes: number;
  totalCost: number | string;
  googleMapsLink: string | null;
  whatsappMessage: string | null;
  assignments: RouteAssignment[];
  stops: RouteStop[];
};

async function fetchRoutes(): Promise<RouteItem[]> {
  const { data } = await apiClient.get<RouteItem[]>('/api/routes');
  return data;
}

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: fetchRoutes,
  });
}
