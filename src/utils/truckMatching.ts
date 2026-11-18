import { Truck } from '../types';

export interface MatchedTruck extends Truck {
  availableCapacityKg: number;
  occupancyPercent: number;
  distanceKm: number;
  etaMinutes: number;
}

/**
 * Dynamically evaluates trucks from shared AppState for a given pickup weight & location.
 * Follows EcoTrack rules:
 * - Excludes full, offline, maintenance, discharging (at disposal yard)
 * - Excludes trucks where available capacity < estimated weight
 * - Excludes near_capacity trucks if remaining space is insufficient
 * - Sorts by distance ascending, then ETA, then available capacity descending
 */
export function getAvailableTrucks(
  trucks: Truck[],
  estimatedWeightKg: number,
  pickupLocation?: { x?: number; y?: number; address?: string }
): MatchedTruck[] {
  const reqWeight = Math.max(1, Number(estimatedWeightKg) || 10);
  const targetX = pickupLocation?.x ?? 35;
  const targetY = pickupLocation?.y ?? 42;

  const validTrucks = trucks
    .filter((truck) => {
      // Must not be offline, in maintenance, discharging at yard, or full
      if (
        truck.status === 'offline' ||
        truck.status === 'maintenance' ||
        truck.status === 'discharging' ||
        truck.status === 'full'
      ) {
        return false;
      }

      const availableCapacity = truck.capacityKg - truck.currentLoadKg;

      // Must have enough capacity for this specific job
      if (availableCapacity < reqWeight) {
        return false;
      }

      // If truck has reached 90% (near_capacity), it can only take a job if it fits comfortably
      if (truck.currentLoadKg / truck.capacityKg >= 0.9 && availableCapacity < reqWeight) {
        return false;
      }

      return true;
    })
    .map((truck) => {
      const availableCapacityKg = Math.max(0, truck.capacityKg - truck.currentLoadKg);
      const occupancyPercent = Math.round((truck.currentLoadKg / truck.capacityKg) * 100);

      // Compute geometric distance on map (normalized 0-100) or fallback
      const dx = (truck.coordinates.x - targetX) * 0.15;
      const dy = (truck.coordinates.y - targetY) * 0.15;
      const calculatedDistance = Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10;
      const distanceKm = truck.distanceKm || Math.max(0.8, calculatedDistance || 1.4);
      const etaMinutes = truck.etaMinutes || Math.round(distanceKm * 4.5 + 2);

      return {
        ...truck,
        availableCapacityKg,
        occupancyPercent,
        distanceKm,
        etaMinutes,
      };
    });

  // Sort suitable trucks by distance -> ETA -> available capacity
  return validTrucks.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) {
      return a.distanceKm - b.distanceKm;
    }
    if (a.etaMinutes !== b.etaMinutes) {
      return a.etaMinutes - b.etaMinutes;
    }
    return b.availableCapacityKg - a.availableCapacityKg;
  });
}
