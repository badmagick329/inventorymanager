import { NEXT_SALES } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { SalePost } from '@/types';

export default function useUpdateLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createSale,
    retry: false,
    onSettled: () => {
      console.log('settled create sale');
    },
    onSuccess: (_, data) => {
      console.log('successfully created sale');
      const { locationId, orderId } = data;
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({
        queryKey: ['orders', locationId, orderId],
      });
    },
    onError: (error) => {
      console.log(`error during create sale. ${error}`);
    },
  });
  return mutation;
}

async function createSale({
  locationId,
  orderId,
  sale,
}: {
  locationId: string;
  orderId: string;
  sale: SalePost;
}) {
  return await axios.post(`${NEXT_SALES}/${orderId}`, {
    ...sale,
  });
}
