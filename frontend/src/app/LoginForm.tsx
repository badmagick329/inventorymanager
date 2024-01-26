'use client';
import React from 'react';
import { Input } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { SyntheticEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: SyntheticEvent) {
    e.preventDefault();
    const url = '/api/auth/login';
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const username = formData.get('username')?.toString();
    const password = formData.get('password')?.toString();
    console.log(`username: ${username} password: ${password}`);

    const fetcher = async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      console.log(`got response ${response}`);
      const responseJson = await response.json();
      console.log(responseJson);
      if (response.status === 200) {
        router.push('/me');
      }
      setLoading(false);
    };
    setLoading(true);
    fetcher();
  }

  function renderButton() {
    if (loading) {
      return (
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
    }
    return (
      <Button
        type='submit'
        className='py-6 text-xl font-semibold'
        color='primary'
        variant='ghost'
      >
        Login
      </Button>
    );
  }

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
      {renderButton()}
    </form>
  );
}
