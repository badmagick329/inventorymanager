import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isOrderResponseArray } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useDeleteOrder() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteOrder,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { orderId, locationId } = mutationVars;
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      if (!locationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
        return;
      }
      const previousData = queryClient.getQueryData(
        queryKeys.orders(locationId)
      );
      if (!isOrderResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
        return;
      }
      queryClient.setQueryData(
        queryKeys.orders(locationId),
        previousData.filter((order) => order.id !== orderId)
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(locationId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error(`error during delete order. ${error}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
    },
  });
  return mutation;
}

async function deleteOrder({
  orderId,
  locationId,
}: {
  orderId: number;
  locationId?: string;
}) {
  return await axios.delete(`${NEXT_ORDER_DETAIL}/${orderId}`);
}
