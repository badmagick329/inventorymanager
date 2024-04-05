import { NEXT_LOCATIONS } from '@/consts/urls';
import { isLocation } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useCreateLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createLocation,
    retry: false,
    onSettled: () => {},
    onSuccess: (data) => {
      if (!isLocation(data)) {
        queryClient.invalidateQueries({ queryKey: ['locations'] });
        return;
      }
      queryClient.setQueryData(['locations', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['locations'], exact: true });
    },
    onError: (error) => {
      console.error(`error during update/create location. ${error}`);
    },
  });
  return mutation;
}

async function createLocation({
  location,
  usernames,
  locationId,
}: {
  location: string;
  usernames: string[];
  locationId?: number;
}) {
  if (locationId) {
    const { data } = await axios.patch(`${NEXT_LOCATIONS}/${locationId}`, {
      location,
      usernames,
    });
    return data;
  }
  const { data } = await axios.post(NEXT_LOCATIONS, { location, usernames });
  return data;
}
