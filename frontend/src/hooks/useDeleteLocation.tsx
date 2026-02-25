import { NEXT_LOCATIONS } from '@/consts/urls';
import { queryKeys } from '@/consts/queryKeys';
import { isLocationArray } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useDeleteLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteLocation,
    retry: false,
    onSettled: () => {},
    onSuccess: (_, mutationVars) => {
      const { locationId } = mutationVars;
      if (!locationId) {
        return;
      }
      const previousData = queryClient.getQueryData(queryKeys.locations);
      if (!(previousData && isLocationArray(previousData))) {
        queryClient.invalidateQueries({ queryKey: queryKeys.locations });
        return;
      }
      queryClient.setQueryData(
        queryKeys.locations,
        previousData.filter((location) => location.id !== locationId)
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.locations,
        exact: true,
      });
    },
    onError: (error) => {
      console.error(`error during delete location. ${error}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.locations });
    },
  });
  return mutation;
}

async function deleteLocation({ locationId }: { locationId: number }) {
  return await axios.delete(`${NEXT_LOCATIONS}/${locationId}`);
}
