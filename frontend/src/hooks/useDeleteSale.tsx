import { NEXT_SALE_DETAIL } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useDeleteSale() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteSale,
    retry: false,
    onSettled: () => {
      console.log('settled delete sale');
    },
    onSuccess: (_, data) => {
      console.log('successfully deleted sale');
      const { locationId, orderId } = data;
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({
        queryKey: ['orders', locationId, orderId],
      });
    },
    onError: (error) => {
      console.log(`error during delete sale. ${error}`);
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
