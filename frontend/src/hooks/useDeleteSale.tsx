import { NEXT_SALE_DETAIL } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isSaleResponseArray } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useDeleteSale() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteSale,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { locationId, orderId } = mutationVars;
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors(locationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orderVendors(orderId),
      });
      const previousData = queryClient.getQueryData(queryKeys.sales(orderId));
      if (!isSaleResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.sales(orderId) });
      } else {
        queryClient.setQueryData(
          queryKeys.sales(orderId),
          previousData.filter((sale) => sale.id !== mutationVars.saleId)
        );
        queryClient.invalidateQueries({
          queryKey: queryKeys.sales(orderId),
          exact: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(locationId),
      });
    },
    onError: (error, mutationVars) => {
      console.error(`error during delete sale. ${error}`);
      const { locationId, orderId } = mutationVars;
      queryClient.invalidateQueries({ queryKey: queryKeys.sales(orderId) });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(locationId),
      });
    },
  });
  return mutation;
}

async function deleteSale({
  saleId,
  locationId,
  orderId,
}: {
  saleId: number;
  locationId: string;
  orderId: string;
}) {
  return await axios.delete(`${NEXT_SALE_DETAIL}/${saleId}`);
}
