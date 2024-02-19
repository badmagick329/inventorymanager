import { useCreateLocation } from '@/hooks';
import axios from 'axios';
import { LocationFormValues } from '@/types';

export default function useSubmitLocation({
  onSuccess,
  setError,
}: {
  onSuccess: () => void;
  setError: (error: string) => void;
}) {
  const createLocation = useCreateLocation();

  async function submitForm(data: LocationFormValues, locationId?: number) {
    try {
      await createLocation.mutateAsync({ ...data, locationId });
      onSuccess && onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        if (error.response?.status === 400 && errorResponse) {
          for (const [_, value] of Object.entries(errorResponse)) {
            setError(`${value}`);
            return;
          }
        }
      }
      setError('Something went wrong');
    }
  }

  return submitForm;
}
