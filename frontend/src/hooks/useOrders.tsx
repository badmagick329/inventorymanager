import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { NEXT_ORDERS } from '@/consts/urls';
import { SHORT_STALE_TIME } from '@/consts';
import axios from 'axios';

export default function useOrders(locationId: string) {
  async function getOrders() {
    const { data } = await axios.get(`${NEXT_ORDERS}/${locationId}`);
    return data;
  }

  const query = useQuery({
    queryKey: ['orders', locationId],
    queryFn: getOrders,
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
