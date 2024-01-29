'use client';
import React from 'react';
import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { LOCATIONS, LOGIN } from '@/consts/urls';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const usernameInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const username = usernameInput.current?.value;
    const password = passwordInput.current?.value;
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }
    processLoginAndPrefetch(username, password);
  }

  async function processLoginAndPrefetch(username: string, password: string) {
    setLoading(true);
    try {
      const response = await axios.post(LOGIN, { username, password });
      const showAdmin = response.data?.showAdmin || false;
      queryClient.setQueryData(['showAdmin'], showAdmin);
      await prefetchLocations();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Something went wrong');
      }
      setLoading(false);
    }
  }

  async function prefetchLocations() {
    await queryClient.prefetchQuery({
      queryKey: ['locations'],
      queryFn: () => axios.get(LOCATIONS),
    });
    router.replace('/');
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
        ref={usernameInput}
      />
      <Input
        name='password'
        type='password'
        variant='flat'
        label='Password'
        autoComplete='off'
        ref={passwordInput}
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
