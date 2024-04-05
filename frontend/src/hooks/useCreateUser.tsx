import { NEXT_USERS } from '@/consts/urls';
import { isUser } from '@/predicates';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function useCreateUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createUser,
    retry: false,
    onSettled: () => {},
    onSuccess: (data) => {
      if (!isUser(data)) {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        return;
      }
      queryClient.setQueryData(['users', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['users'], exact: true });
    },
    onError: (error) => {
      console.error(`error during create user. ${error}`);
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
