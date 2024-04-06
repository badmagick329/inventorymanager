import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_VENDORS } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useOrderVendors(orderId: string) {
  const query = useQuery({
    queryKey: ['order-vendors', orderId],
    queryFn: async () => {
      const { data } = await axios.get(`${NEXT_VENDORS}?order_id=${orderId}`);
      return data;
    },
    retry: false,
    placeholderData: keepPreviousData,
    staleTime: SHORT_STALE_TIME,
  });
  return query;
}
