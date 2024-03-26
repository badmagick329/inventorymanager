import { NEXT_VENDORS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { isVendorResponse } from '@/predicates';

export default function useCreateVendor() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createVendor,
    retry: false,
    onSettled: () => {},
    onSuccess: (data, mutationVars) => {
      if (!isVendorResponse(data)) {
        queryClient.invalidateQueries({ queryKey: ['vendors'] });
        return;
      }
      const { locationId } = mutationVars;
      queryClient.setQueryData(['vendors', locationId, data.id], data);
      queryClient.invalidateQueries({
        queryKey: ['vendors', locationId],
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
