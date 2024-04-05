import { NEXT_LOGIN, NEXT_VENDORS } from '@/consts/urls';
import { LoginFormValues } from '@/types';
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UseFormSetError } from 'react-hook-form';

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

export async function preFetchVendors(
  queryClient: QueryClient,
  locationId: string
) {
  await queryClient.prefetchQuery({
    queryKey: ['vendors', locationId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${NEXT_VENDORS}?location_id=${locationId}`
      );
      return data;
    },
  });
}
