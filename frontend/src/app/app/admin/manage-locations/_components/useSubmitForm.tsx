import { useCreateLocation, useUpdateLocation } from '@/hooks';
import axios from 'axios';

export type FormValues = {
  location: string;
  usernames: string[];
};

export default function useSubmitForm({
  onSuccess,
  setError,
}: {
  onSuccess: () => void;
  setError: (error: string) => void;
}) {
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();

  async function submitForm(data: FormValues, locationId?: number) {
    try {
      let response;
      if (locationId) {
        response = await updateLocation.mutateAsync({
          ...data,
          locationId,
        });
      } else {
        response = await createLocation.mutateAsync(data);
      }
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
