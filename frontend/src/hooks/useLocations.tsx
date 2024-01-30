import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_LOCATIONS } from '@/consts/urls';
import axios from 'axios';

export default function useLocations() {
  const query = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(NEXT_LOCATIONS),
    retry: false,
    placeholderData: keepPreviousData,
  });
  return query;
}
