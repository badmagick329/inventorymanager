import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_ORDERS } from '@/consts/urls';
import { SHORT_STALE_TIME } from '@/consts';
import axios from 'axios';

export default function useOrders(locationId: string) {
  const query = useQuery({
    queryKey: ['orders', locationId],
    queryFn: () => axios.get(`${NEXT_ORDERS}/${locationId}`),
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
