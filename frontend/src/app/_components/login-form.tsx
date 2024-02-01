'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import {
  APP_LOCATIONS,
  NEXT_LOCATIONS,
  NEXT_LOGIN,
  NEXT_ADMIN,
} from '@/consts/urls';
import { useForm } from 'react-hook-form';
import LoginButton from '@/app/_components/login-button';
import PasswordInput from '@/app/_components/password-input';
import UsernameInput from '@/app/_components/username-input';

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
    const loggedIn = await tryLogin(
      data.username,
      data.password,
      setError,
      setIsLoading
    );
    if (!loggedIn) {
      return;
    }
    await Promise.allSettled([
      prefetchLocations(queryClient),
      prefetchIsAdmin(queryClient),
    ]);
    router.push(APP_LOCATIONS);
  }

  return (
    <form
      className='flex w-64 flex-col gap-2'
      onSubmit={handleSubmit((data) => submitForm(data))}
    >
      {error && <span className='self-center text-danger-500'>{error}</span>}
      <UsernameInput register={register} formState={formState} />
      <PasswordInput register={register} formState={formState} />
      <LoginButton isLoading={isLoading} formState={formState} />
    </form>
  );
}

async function tryLogin(
  username: string,
  password: string,
  setError: (error: string) => void,
  setIsLoading: (isLoading: boolean) => void
): Promise<boolean> {
  try {
    await axios.post(NEXT_LOGIN, { username, password });
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

async function prefetchLocations(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(NEXT_LOCATIONS),
  });
}

async function prefetchIsAdmin(queryClient: QueryClient) {
  await queryClient.prefetchQuery({
    queryKey: ['isAdmin'],
    queryFn: () => axios.get(NEXT_ADMIN),
  });
}
