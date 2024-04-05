import { CancelButton, CreateButton } from '@/components';
import { useSubmitUser } from '@/hooks';
import { Input } from '@nextui-org/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

type FormProps = {
  onSuccess: () => void;
  onCancel: () => void;
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
  const submitForm = useSubmitUser(setError, onSuccess);

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
      <div className='flex w-full items-center justify-around'>
        <CancelButton onCancel={onCancel} />
        <CreateButton formState={formState} />
      </div>
    </form>
  );
}
