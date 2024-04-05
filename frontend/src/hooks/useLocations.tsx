import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_LOCATIONS } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useLocations() {
  const query = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await axios.get(NEXT_LOCATIONS);
      return data;
    },
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: SHORT_STALE_TIME,
  });
  return query;
}
