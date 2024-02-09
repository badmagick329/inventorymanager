import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_LOCATIONS } from '@/consts/urls';
import axios from 'axios';
import { SHORT_STALE_TIME } from '@/consts';

export default function useLocations() {
  const query = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(NEXT_LOCATIONS),
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: SHORT_STALE_TIME,
  });
  return query;
}
