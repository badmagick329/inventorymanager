import { NEXT_LOCATIONS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { isLocationArray } from '@/predicates';

export default function useDeleteLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteLocation,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, locationId) => {
      if (!locationId) {
        return;
      }
      const previousData = queryClient.getQueryData(['locations']);
      if (!(previousData && isLocationArray(previousData))) {
        queryClient.invalidateQueries({ queryKey: ['locations'] });
        return;
      }
      queryClient.setQueryData(
        ['locations'],
        previousData.filter((location) => location.id !== locationId)
      );
      queryClient.invalidateQueries({ queryKey: ['locations'], exact: true });
    },
    onError: (error) => {
      console.log(`error during delete location. ${error}`);
    },
  });
  return mutation;
}

async function deleteLocation(locationId: number) {
  return await axios.delete(`${NEXT_LOCATIONS}/${locationId}`);
}
