import { useRouter } from 'next/navigation';
import { APP_LOCATIONS } from '@/consts/urls';
import { LoginFormValues } from '@/types';
import { tryLogin } from '@/utils/requests';
import { UseFormSetError } from 'react-hook-form';
import React from 'react';

type UseSubmitLoginFormProps = {
  setError: UseFormSetError<LoginFormValues>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function useSubmitLoginForm({
  setError,
  setIsLoading,
}: UseSubmitLoginFormProps) {
  const router = useRouter();

  async function submitForm(data: LoginFormValues) {
    setIsLoading(true);
    const loggedIn = await tryLogin(
      data.username,
      data.password,
      setError,
      setIsLoading
    );
    if (!loggedIn) {
      return;
    }
    router.push(APP_LOCATIONS);
  }

  return submitForm;
}
