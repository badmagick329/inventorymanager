import { NEXT_ORDERS, NEXT_ORDER_DETAIL } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { OrderPost } from '@/types';

export default function useUpdateLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createOrder,
    retry: false,
    onSettled: () => {
      console.log('settled update/create order');
    },
    onSuccess: () => {
      console.log('successfully updated/created order');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.log(`error during update/create order. ${error}`);
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
    return await axios.patch(`${NEXT_ORDER_DETAIL}/${orderId}`, {
      ...order,
    });
  }
  return await axios.post(`${NEXT_ORDERS}/${locationId}`, {
    ...order,
  });
}
