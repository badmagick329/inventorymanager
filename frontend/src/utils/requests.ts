import { NEXT_LOGIN, NEXT_LOCATIONS, NEXT_ADMIN } from '@/consts/urls';
import axios from 'axios';
import { UseFormSetError } from 'react-hook-form';
import { LoginFormValues } from '@/types';
import { QueryClient } from '@tanstack/react-query';

export async function tryLogin(
  username: string,
  password: string,
  setError: UseFormSetError<LoginFormValues>,
  setIsLoading: (isLoading: boolean) => void
): Promise<boolean> {
  try {
    await axios.post(NEXT_LOGIN, { username, password });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setError('username', {
        type: 'server',
        message: 'Invalid username or password',
      });
    } else {
      setError('username', { type: 'server', message: 'An error occurred' });
    }
    setIsLoading(false);
    return false;
  }
}

export async function prefetchLocations(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await axios.get(NEXT_LOCATIONS);
      return data;
    },
  });
}

export async function prefetchIsAdmin(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['isAdmin'],
    queryFn: () => axios.get(NEXT_ADMIN),
  });
}
