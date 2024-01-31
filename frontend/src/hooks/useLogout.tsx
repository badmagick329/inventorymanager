import { NEXT_LOGOUT, APP_LOGIN } from '@/consts/urls';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: () => axios.post(NEXT_LOGOUT),
    onSettled: () => {
      queryClient.removeQueries();
      router.push(APP_LOGIN);
    },
    onSuccess: () => {
      console.log('successfully logged out');
    },
    onError: () => {
      console.log('error during logout');
    },
  });
  return mutation;
}