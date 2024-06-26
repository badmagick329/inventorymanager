import { SHORT_STALE_TIME } from '@/consts';
import { NEXT_SALES } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function useSales(orderId: string) {
  const query = useQuery({
    queryKey: ['sales', orderId],
    queryFn: async () => {
      const { data } = await axios.get(`${NEXT_SALES}/${orderId}`);
      return data;
    },
    retry: false,
    staleTime: SHORT_STALE_TIME,
    placeholderData: keepPreviousData,
  });
  return query;
}
