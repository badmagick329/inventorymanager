import { NEXT_LOCATIONS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useDeleteLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['delete-location'],
    mutationFn: deleteLocation,
    retry: false,
    onSettled: () => {
      console.log('settled delete location');
    },
    onSuccess: () => {
      console.log('successfully deleted location');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      console.log(`error during delete location. ${error}`);
    },
  });
  return mutation;
}

async function deleteLocation(locationId: number | undefined) {
  if (!locationId) {
    throw new Error('locationId is undefined');
  }
  return await axios.delete(`${NEXT_LOCATIONS}/${locationId}`);
}
