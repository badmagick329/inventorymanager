'use client';
import React from 'react';
import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { LOCATIONS, LOGIN } from '@/consts/urls';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = new QueryClient();

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const { username, password } = parseFormInputs(e.target as HTMLFormElement);
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    processLoginAndPrefetch(username, password);
  }

  function parseFormInputs(form: HTMLFormElement) {
    const formData = new FormData(form);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    return { username, password };
  }

  function processLoginAndPrefetch(username: string, password: string) {
    const loginResult = axios.post(LOGIN, { username, password });
    setLoading(true);
    loginResult
      .then((response) => {
        const showAdmin = response.data?.showAdmin || false;
        console.log(`showAdmin before prefetch: ${showAdmin}`);
        prefetchLocations();
      })
      .catch((error) => {
        if (error.response?.status === 401) {
          setError('Invalid username or password');
        } else {
          console.error(error.response?.status);
          setError('Something went wrong');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function prefetchLocations() {
    queryClient
      .prefetchQuery({
        queryKey: ['locations'],
        queryFn: () => axios.get(LOCATIONS),
      })
      .then(() => {
        router.push('/');
      });
  }

  return (
    <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
      {error && <span className='text-danger-400'>{error}</span>}
      <Input
        name='username'
        type='text'
        variant='flat'
        label='Username'
        autoComplete='off'
      />
      <Input
        name='password'
        type='password'
        variant='flat'
        label='Password'
        autoComplete='off'
      />
      <Button
        type='submit'
        className='py-6 text-xl font-semibold'
        color='primary'
        variant='ghost'
        isLoading={loading}
      >
        Login
      </Button>
    </form>
  );
}
