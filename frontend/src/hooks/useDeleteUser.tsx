import { NEXT_USERS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useDeleteUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['delete-user'],
    mutationFn: deleteUser,
    retry: false,
    onSettled: () => {
      console.log('settled delete user');
    },
    onSuccess: () => {
      console.log('successfully deleted user');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.log(`error during delete user. ${error}`);
    },
  });
  return mutation;
}

async function deleteUser(userId: number | undefined) {
  if (!userId) {
    throw new Error('userId is undefined');
  }
  return await axios.delete(`${NEXT_USERS}/${userId}`);
}
