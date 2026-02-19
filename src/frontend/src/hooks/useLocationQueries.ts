import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

/**
 * React Query hooks for hierarchical location fetching
 * Supports country → state → district → MP → MLA → mandal → village hierarchy
 */

export function useGetCountries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['countries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return (actor as any).getCountries();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

export function useGetStatesByCountry(countryCode: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['states', countryCode],
    queryFn: async () => {
      if (!actor || !countryCode) return [];
      return (actor as any).getStatesByCountry(countryCode);
    },
    enabled: !!actor && !actorFetching && !!countryCode,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useGetDistrictsByState(state: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['districts', state],
    queryFn: async () => {
      if (!actor || !state) return [];
      return (actor as any).getDistrictsByState(state);
    },
    enabled: !!actor && !actorFetching && !!state,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

// Placeholder hooks for future backend implementation
export function useGetMPConstituenciesByDistrict(district: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['mpConstituencies', district],
    queryFn: async () => {
      if (!actor || !district) return [];
      // Backend function not yet implemented
      if (typeof (actor as any).getMPConstituenciesByDistrict === 'function') {
        return (actor as any).getMPConstituenciesByDistrict(district);
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!district,
    staleTime: 1000 * 60 * 30,
  });
}

export function useGetMLAConstituenciesByMP(mpConstituency: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['mlaConstituencies', mpConstituency],
    queryFn: async () => {
      if (!actor || !mpConstituency) return [];
      // Backend function not yet implemented
      if (typeof (actor as any).getMLAConstituenciesByMP === 'function') {
        return (actor as any).getMLAConstituenciesByMP(mpConstituency);
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!mpConstituency,
    staleTime: 1000 * 60 * 30,
  });
}

export function useGetMandalsByMLA(mlaConstituency: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['mandals', mlaConstituency],
    queryFn: async () => {
      if (!actor || !mlaConstituency) return [];
      // Backend function not yet implemented
      if (typeof (actor as any).getMandalsByMLA === 'function') {
        return (actor as any).getMandalsByMLA(mlaConstituency);
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!mlaConstituency,
    staleTime: 1000 * 60 * 30,
  });
}

export function useGetVillagesByMandal(mandal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['villages', mandal],
    queryFn: async () => {
      if (!actor || !mandal) return [];
      // Backend function not yet implemented
      if (typeof (actor as any).getVillagesByMandal === 'function') {
        return (actor as any).getVillagesByMandal(mandal);
      }
      return [];
    },
    enabled: !!actor && !actorFetching && !!mandal,
    staleTime: 1000 * 60 * 30,
  });
}
