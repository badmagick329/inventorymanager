'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { APP_LOCATIONS, API_LOCATIONS, API_LOGIN } from '@/consts/urls';
import { useForm } from 'react-hook-form';
import LoginButton from './LoginButton';
import PasswordInput from './PasswordInput';
import UsernameInput from './UsernameInput';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type FormValues = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  async function submitForm(data: FormValues) {
    setIsLoading(true);
    const loggedIn = await processLoginAndPrefetch(
      data.username,
      data.password,
      setError,
      setIsLoading
    );
    if (!loggedIn) {
      return;
    }
    await prefetchLocations(queryClient, router);
  }

  return (
    <form
      className='flex w-64 flex-col gap-2'
      onSubmit={handleSubmit((data) => submitForm(data))}
    >
      {error && <span className='text-danger-400'>{error}</span>}
      <UsernameInput register={register} formState={formState} />
      <PasswordInput register={register} formState={formState} />
      <LoginButton isLoading={isLoading} formState={formState} />
    </form>
  );
}

async function processLoginAndPrefetch(
  username: string,
  password: string,
  setError: (error: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<boolean> {
  try {
    await axios.post(API_LOGIN, { username, password });
    return true;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      setError('Invalid username or password');
    } else {
      setError('Something went wrong');
    }
    setIsLoading(false);
    return false;
  }
}

async function prefetchLocations(
  queryClient: QueryClient,
  router: AppRouterInstance
) {
  await queryClient.prefetchQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(API_LOCATIONS),
  });
  router.replace(APP_LOCATIONS);
}
