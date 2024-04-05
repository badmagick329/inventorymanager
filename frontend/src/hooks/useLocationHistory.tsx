import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_LOCATION_HISTORY } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useLocationHistory(locationId: string) {
  const query = useQuery({
    queryKey: ['history', locationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${NEXT_LOCATION_HISTORY}/${locationId}`
      );
      return data;
    },
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
