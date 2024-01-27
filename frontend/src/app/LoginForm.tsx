'use client';
import React from 'react';
import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const url = '/fetch/auth/login';
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    if (!username || !password) {
      return;
    }

    const loginResult = axios.post(url, { username, password });

    setLoading(true);
    loginResult
      .then((response) => {
        if (response.status === 200) {
          router.push('/me');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const loadingButton = (
    <Button
      type='submit'
      className='py-6 text-xl font-semibold'
      color='primary'
      variant='ghost'
      isLoading
    >
      Logging in
    </Button>
  );
  const loginButton = (
    <Button
      type='submit'
      className='py-6 text-xl font-semibold'
      color='primary'
      variant='ghost'
    >
      Login
    </Button>
  );

  return (
    <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
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
      {loading ? loadingButton : loginButton}
    </form>
  );
}
