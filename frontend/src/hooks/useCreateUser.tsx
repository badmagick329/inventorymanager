import { NEXT_USERS } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

export default function useCreateUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['create-user'],
    mutationFn: createUser,
    retry: false,
    onSettled: () => {
      console.log('settled create user');
    },
    onSuccess: () => {
      console.log('successfully created user');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.log(`error during create user. ${error}`);
    },
  });
  return mutation;
}

async function createUser({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return await axios.post(NEXT_USERS, { username, password });
}
