import { NEXT_ORDER_DETAIL } from '@/consts/urls';
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
      const { orderId } = mutationVars;
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      const previousData = queryClient.getQueryData(['orders']);
      if (!isOrderResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        return;
      }
      queryClient.setQueryData(
        ['orders'],
        previousData.filter((order) => order.id !== orderId)
      );
      queryClient.invalidateQueries({ queryKey: ['orders'], exact: true });
    },
    onError: (error) => {
      console.error(`error during delete order. ${error}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
  return mutation;
}

async function deleteOrder({ orderId }: { orderId: number }) {
  return await axios.delete(`${NEXT_ORDER_DETAIL}/${orderId}`);
}
