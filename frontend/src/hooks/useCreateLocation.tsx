import { NEXT_LOCATIONS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useCreateLocation() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['create-location'],
    mutationFn: createLocation,
    retry: false,
    onSettled: () => {
      console.log('settled create location');
    },
    onSuccess: () => {
      console.log('successfully created location');
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
    onError: (error) => {
      console.log(`error during create location. ${error}`);
    },
  });
  return mutation;
}

async function createLocation({
  location,
  usernames,
}: {
  location: string;
  usernames: string[];
}) {
  return await axios.post(NEXT_LOCATIONS, { location, usernames });
}
