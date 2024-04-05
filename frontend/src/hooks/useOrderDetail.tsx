import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useOrderDetail(locationId: string, orderId?: string) {
  const query = useQuery({
    queryKey: ['orders', locationId, orderId],
    queryFn: async () => {
      const { data } = await axios.get(`${NEXT_ORDER_DETAIL}/${orderId}`);
      return data;
    },
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
