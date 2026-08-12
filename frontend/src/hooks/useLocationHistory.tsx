import { SHORT_STALE_TIME } from '@/consts';
import { queryKeys } from '@/consts/queryKeys';
import { NEXT_LOCATION_HISTORY } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useLocationHistory(locationId: string, page: number, searchQuery: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (searchQuery) params.set('q', searchQuery);
  const historyQuery = useQuery({
    queryKey: queryKeys.history(locationId, page, searchQuery),
    queryFn: async () => {
      const { data } = await axios.get(
        `${NEXT_LOCATION_HISTORY}/${locationId}?${params}`
      );
      return data;
    },
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return historyQuery;
}
