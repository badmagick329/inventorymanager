import { NEXT_LOGOUT, APP_LOGIN } from '@/consts/urls';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function useLogout() {
  const router = useRouter();
  const mutation = useMutation({
    mutationKey: ['logout'],
    mutationFn: () => axios.post(NEXT_LOGOUT),
    retry: false,
    onSettled: () => {
      router.push(APP_LOGIN);
    },
    onSuccess: () => {},
    onError: (error) => {
      console.log(`error during logout. ${error}`);
    },
  });
  return mutation;
}
