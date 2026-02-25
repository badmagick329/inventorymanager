import { NEXT_ORDERS, NEXT_ORDER_DETAIL } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isOrderResponse } from '@/predicates';
import { OrderPost } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useCreateOrder() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createOrder,
    retry: false,
    onSettled: () => {},
    onSuccess: (data, mutationVars) => {
      const { locationId } = mutationVars;
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
      if (!isOrderResponse(data)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.ordersRoot });
        return;
      }
      queryClient.setQueryData(queryKeys.orders(locationId), (current: unknown) => {
        if (!Array.isArray(current)) {
          return current;
        }
        return [...current, data];
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders(locationId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error(`error during update/create order. ${error}`);
    },
  });
  return mutation;
}

async function createOrder({
  locationId,
  orderId,
  order,
}: {
  locationId: string;
  orderId?: string;
  order: OrderPost;
}) {
  if (orderId) {
    const { data } = await axios.patch(`${NEXT_ORDER_DETAIL}/${orderId}`, {
      ...order,
    });
    return data;
  }
  const { data } = await axios.post(`${NEXT_ORDERS}/${locationId}`, {
    ...order,
  });
  return data;
}
