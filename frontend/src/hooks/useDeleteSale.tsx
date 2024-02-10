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
    onSuccess: () => {
      console.log('successfully deleted sale');
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (error) => {
      console.log(`error during delete sale. ${error}`);
    },
  });
  return mutation;
}

async function deleteSale(saleId: number) {
  return await axios.delete(`${NEXT_SALE_DETAIL}/${saleId}`);
}
