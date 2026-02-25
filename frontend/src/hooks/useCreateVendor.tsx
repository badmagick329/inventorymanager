import { NEXT_VENDORS } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isVendorResponse } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useCreateVendor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createVendor,
    retry: false,
    onSettled: () => {},
    onSuccess: (data, mutationVars) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesRoot });
      if (!isVendorResponse(data)) {
        queryClient.invalidateQueries({ queryKey: queryKeys.vendorsRoot });
        return;
      }
      const { locationId } = mutationVars;
      queryClient.setQueryData(
        queryKeys.vendors(locationId),
        (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }
          return [...current, data];
        }
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.vendors(locationId),
        exact: true,
      });
    },
    onError: (error) => {
      console.error(`error during update/create vendor. ${error}`);
    },
  });
  return mutation;
}

async function createVendor({
  name,
  locationId,
  vendorId,
}: {
  name: string;
  locationId: string;
  vendorId?: string;
}) {
  if (vendorId) {
    const { data } = await axios.patch(`${NEXT_VENDORS}/${vendorId}`, {
      name,
      locationId,
    });
    return data;
  }
  const { data } = await axios.post(NEXT_VENDORS, { name, locationId });
  return data;
}
