import { NEXT_ORDER_DETAIL } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useDeleteOrder() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteOrder,
    retry: false,
    onSettled: () => {
      console.log('settled delete order');
    },
    onSuccess: () => {
      console.log('successfully deleted order');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.log(`error during delete order. ${error}`);
    },
  });
  return mutation;
}

async function deleteOrder(orderId: number) {
  return await axios.delete(`${NEXT_ORDER_DETAIL}/${orderId}`);
}
