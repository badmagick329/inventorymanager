import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_VENDORS } from '@/consts/urls';
import axios from 'axios';
import { SHORT_STALE_TIME } from '@/consts';

export default function useVendors(locationId: string) {
  const query = useQuery({
    queryKey: ['vendors', locationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${NEXT_VENDORS}?location_id=${locationId}`
      );
      return data;
    },
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: SHORT_STALE_TIME,
  });
  return query;
}
