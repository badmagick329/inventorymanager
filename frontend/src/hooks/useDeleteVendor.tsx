import { NEXT_VENDORS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { isVendorResponseArray } from '@/predicates';

export default function useDeleteVendor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteVendor,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { vendorId } = mutationVars;
      const previousData = queryClient.getQueryData(['vendors']);
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      if (!isVendorResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
        return;
      }
      queryClient.setQueryData(
        ['vendors'],
        previousData.filter((vendor) => vendor.id !== vendorId)
      );
      queryClient.invalidateQueries({ queryKey: ['vendors'], exact: true });
    },
    onError: (error) => {
      console.error(`error during delete vendor`, error);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
  return mutation;
}

async function deleteVendor({ vendorId }: { vendorId: number }) {
  return await axios.delete(`${NEXT_VENDORS}/${vendorId}`);
}
