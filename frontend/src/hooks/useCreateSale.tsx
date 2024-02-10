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
    onSuccess: () => {
      console.log('successfully created sale');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error) => {
      console.log(`error during create sale. ${error}`);
    },
  });
  return mutation;
}

async function createSale({
  orderId,
  sale,
}: {
  orderId: string;
  sale: SalePost;
}) {
  return await axios.post(`${NEXT_SALES}/${orderId}`, {
    ...sale,
  });
}
