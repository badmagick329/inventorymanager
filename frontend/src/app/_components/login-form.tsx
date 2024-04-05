'use client';

import LoginButton from '@/app/_components/login-button';
import PasswordInput from '@/app/_components/password-input';
import UsernameInput from '@/app/_components/username-input';
import { useSubmitLoginForm } from '@/hooks';
import React from 'react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const submitForm = useSubmitLoginForm({ setError, setIsLoading });

  return (
    <form
      className='flex w-64 flex-col gap-2'
      onSubmit={handleSubmit((data) => submitForm(data))}
    >
      <UsernameInput register={register} formState={formState} />
      <PasswordInput register={register} formState={formState} />
      <LoginButton isLoading={isLoading} formState={formState} />
    </form>
  );
}
