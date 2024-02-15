import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import { SHORT_STALE_TIME } from '@/consts';
import axios from 'axios';

export default function useOrderDetail(locationId: string, orderId?: string) {
  const query = useQuery({
    queryKey: ['orders', locationId, orderId],
    queryFn: () => axios.get(`${NEXT_ORDER_DETAIL}/${orderId}`),
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
