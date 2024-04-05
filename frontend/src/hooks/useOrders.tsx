import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_ORDERS } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useOrders(locationId: string) {
  const query = useQuery({
    queryKey: ['orders', locationId],
    queryFn: async () => {
      const { data } = await axios.get(`${NEXT_ORDERS}/${locationId}`);
      return data;
    },
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
