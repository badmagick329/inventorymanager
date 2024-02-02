import { NEXT_LOCATIONS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useUpdateLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['update-location'],
    mutationFn: updateLocation,
    retry: false,
    onSettled: () => {
      console.log('settled update location');
    },
    onSuccess: () => {
      console.log('successfully updated location');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      console.log(`error during update location. ${error}`);
    },
  });
  return mutation;
}

async function updateLocation({
  location,
  usernames,
  locationId,
}: {
  location: string;
  usernames: string[];
  locationId: number;
}) {
  return await axios.patch(`${NEXT_LOCATIONS}/${locationId}`, {
    location,
    usernames,
  });
}
