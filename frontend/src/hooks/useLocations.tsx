import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { LOCATIONS } from '@/consts/urls';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useLocations() {
  const query = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(LOCATIONS),
    retry: false,
    placeholderData: keepPreviousData,
  });
  return query;
}
