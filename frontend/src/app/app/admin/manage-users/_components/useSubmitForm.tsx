import { useCreateUser } from '@/hooks';
import axios from 'axios';

type FormValues = {
  username: string;
  password: string;
  password2: string;
};

export default function useSubmitForm(
  setError: (error: string) => void,
  onSuccess: () => void
) {
  const createUser = useCreateUser();

  function createPayload(data: FormValues) {
    if (data.password !== data.password2) {
      setError('Passwords do not match');
      return;
    }
    return {
      username: data.username,
      password: data.password,
    };
  }

  async function submitForm(data: FormValues) {
    const payload = createPayload(data);
    if (!payload) {
      return;
    }
    await handleCreate(payload);
  }

  async function handleCreate(payload: { username: string; password: string }) {
    try {
      await createUser.mutateAsync(payload);
      onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse = error.response?.data;
        if (error.response?.status === 400 && errorResponse) {
          for (const [_, value] of Object.entries(errorResponse)) {
            setError(`${value}`);
            break;
          }
        }
      } else {
        setError('Something went wrong');
      }
    }
  }

  return submitForm;
}
