import { NEXT_VENDORS } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isVendorResponseArray } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useDeleteVendor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteVendor,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { vendorId, locationId } = mutationVars;
      if (!locationId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot });
        return;
      }
      const previousData = queryClient.getQueryData(
        queryKeys.vendors(locationId)
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.salesRoot });
      if (!isVendorResponseArray(previousData)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot });
        return;
      }
      queryClient.setQueryData(
        queryKeys.vendors(locationId),
        previousData.filter((vendor) => vendor.id !== vendorId)
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors(locationId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error(`error during delete vendor`, error);
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot });
    },
  });
  return mutation;
}

async function deleteVendor({
  vendorId,
  locationId,
}: {
  vendorId: number;
  locationId?: string;
}) {
  return await axios.delete(`${NEXT_VENDORS}/${vendorId}`);
}
