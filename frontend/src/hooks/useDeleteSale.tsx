import { NEXT_SALE_DETAIL } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { isSaleResponseArray } from '@/predicates';

export default function useDeleteSale() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteSale,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { locationId, orderId } = mutationVars;
      const previousData = queryClient.getQueryData(['sales', orderId]);
      if (!isSaleResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: ['sales', orderId] });
      } else {
        queryClient.setQueryData(
          ['sales', orderId],
          previousData.filter((sale) => sale.id !== mutationVars.saleId)
        );
        queryClient.invalidateQueries({
          queryKey: ['sales', orderId],
          exact: true,
        });
      }
      queryClient.invalidateQueries({
        queryKey: ['orders', locationId, orderId],
      });
    },
    onError: (error, mutationVars) => {
      console.log(`error during delete sale. ${error}`);
      const { locationId, orderId } = mutationVars;
      queryClient.invalidateQueries({ queryKey: ['sales', orderId] });
      queryClient.invalidateQueries({
        queryKey: ['orders', locationId, orderId],
      });
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
