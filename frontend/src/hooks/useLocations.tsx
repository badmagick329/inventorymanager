import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_LOCATIONS } from '@/consts/urls';
import axios from 'axios';
import { SHORT_STALE_TIME } from '@/consts';

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
