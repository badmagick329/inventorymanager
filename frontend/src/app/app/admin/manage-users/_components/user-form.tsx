import { useForm } from 'react-hook-form';
import { useState } from 'react';
import React from 'react';
import SubmitButton from './submit-new-button';
import CancelButton from './cancel-new-button';
import { Input } from '@nextui-org/react';
import { useCreateUser } from '@/hooks';
import axios from 'axios';

export type FormValues = {
  username: string;
  password: string;
  password2: string;
};

type FormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function UserForm({ onSuccess, onCancel }: FormProps) {
  const [error, setError] = useState('');
  const defaultValues = {
    username: '',
    password: '',
    password2: '',
  };
  const { register, handleSubmit, formState } = useForm({
    defaultValues: defaultValues,
  });
  const createUser = useCreateUser();

  async function submitForm(data: FormValues) {
    if (data.password !== data.password2) {
      setError('Passwords do not match');
      return;
    }
    const payload = {
      username: data.username,
      password: data.password,
    };
    const response = await createUser.mutateAsync(payload);
    try {
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

  return (
    <form
      className='flex w-72 flex-col gap-4'
      onSubmit={handleSubmit((data) => submitForm(data))}
    >
      {error && <span className='self-center text-danger-500'>{error}</span>}
      <Input
        type='text'
        variant='flat'
        label='Username'
        autoComplete='off'
        {...register('username', { required: 'Username is required' })}
      />
      <Input
        type='password'
        variant='flat'
        label='Password'
        autoComplete='off'
        {...register('password', { required: 'Password cannot be empty' })}
      />
      <Input
        type='password'
        variant='flat'
        label='Confirm Password'
        autoComplete='off'
        {...register('password2', { required: 'Password cannot be empty' })}
      />
      {/* TODO: Add loading state */}
      <div className='flex w-full items-center justify-around'>
        <CancelButton onCancel={onCancel} />
        <SubmitButton formState={formState} isLoading={false} />
      </div>
    </form>
  );
}
