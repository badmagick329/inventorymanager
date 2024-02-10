import { NEXT_ORDERS } from '@/consts/urls';
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
      console.log('settled create order');
    },
    onSuccess: () => {
      console.log('successfully created order');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.log(`error during create order. ${error}`);
    },
  });
  return mutation;
}

async function createOrder({
  locationId,
  order,
}: {
  locationId: string;
  order: OrderPost;
}) {
  return await axios.post(`${NEXT_ORDERS}/${locationId}`, {
    ...order,
  });
}
