import axios from 'axios';
import { API_ADMIN } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SHORT_STALE_TIME } from '@/consts';

export default function useIsAdmin() {
  const query = useQuery({
    queryKey: ['isAdmin'],
    queryFn: () => axios.get(API_ADMIN),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: SHORT_STALE_TIME,
  });
  return query.isSuccess;
}
