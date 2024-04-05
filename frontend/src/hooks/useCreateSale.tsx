import { NEXT_SALES, NEXT_SALE_DETAIL } from '@/consts/urls';
import { isSaleResponse } from '@/predicates';
import { SalePost } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useCreateSale() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSale,
    retry: false,
    onSettled: () => {},
    onSuccess: (data, mutationVars) => {
      const { locationId, orderId } = mutationVars;
      // Invalidating vendors in case a new vendor is created during
      // sale creation
      queryClient.invalidateQueries({ queryKey: ['vendors', locationId] });
      if (!isSaleResponse(data)) {
        queryClient.invalidateQueries({ queryKey: ['sales'] });
      } else {
        queryClient.setQueryData(['sales', orderId, data.id], data);
        queryClient.invalidateQueries({
          queryKey: ['sales', orderId],
          exact: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['orders', locationId],
      });
    },
    onError: (error) => {
      console.error(`error during update/create sale. ${error}`);
    },
  });
  return mutation;
}

async function createSale({
  locationId,
  orderId,
  saleId,
  sale,
}: {
  locationId: string;
  orderId: string;
  saleId?: string;
  sale: SalePost;
}) {
  if (saleId) {
    const { data } = await axios.patch(`${NEXT_SALE_DETAIL}/${saleId}`, {
      ...sale,
    });
    return data;
  }
  const { data } = await axios.post(`${NEXT_SALES}/${orderId}`, {
    ...sale,
  });
  return data;
}
