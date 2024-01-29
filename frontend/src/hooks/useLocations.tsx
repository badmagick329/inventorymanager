import { useQuery } from '@tanstack/react-query';
import { LOCATIONS } from '@/consts/urls';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useLocations() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(LOCATIONS),
    retry: false,
  });
  queryClient.setQueryData(['showAdmin'], query.data?.data?.showAdmin);
  return query;
}
