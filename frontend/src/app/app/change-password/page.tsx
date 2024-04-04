'use client';
import { Input, Button } from '@nextui-org/react';
import { useForm, UseFormSetError } from 'react-hook-form';
import { NEXT_USERS_ME } from '@/consts/urls';
import axios from 'axios';
import { useState } from 'react';

type ChangePasswordFormValues = {
  password: string;
  newPassword: string;
  newPassword2: string;
};

export default function ChangePassword() {
  const [output, setOutput] = useState<string>('');
  const { register, handleSubmit, formState, setError, reset } = useForm({
    defaultValues: {
      password: '',
      newPassword: '',
      newPassword2: '',
    },
  });

  async function submitForm(data: ChangePasswordFormValues) {
    const payload = {
      password: data.password,
      newPassword: data.newPassword,
      newPassword2: data.newPassword2,
    };
    try {
      const { data: response } = await axios.patch(NEXT_USERS_ME, payload);
      reset();
      setOutput(response?.message);
    } catch (error) {
      setFormError(error, setError);
    }
  }

  return (
    <div className='flex flex-col items-center gap-2 pt-24'>
      <span className='text-2xl font-semibold'>Change password</span>
      <form
        className='flex w-64 flex-col gap-2'
        onSubmit={handleSubmit((data) => submitForm(data))}
      >
        <span className='text-danger-500'>
          {formState.errors.password?.message}
        </span>
        <Input
          type='password'
          variant='flat'
          label='Current Password'
          autoComplete='off'
          {...register('password', {
            required: 'Current Password is required',
          })}
        />
        <span className='text-danger-500'>
          {formState.errors.newPassword?.message}
        </span>
        <Input
          type='password'
          variant='flat'
          label='New Password'
          autoComplete='off'
          {...register('newPassword', { required: 'New Password is required' })}
        />
        <span className='text-danger-500'>
          {formState.errors.newPassword2?.message}
        </span>
        <Input
          type='password'
          variant='flat'
          label='Retype New Password'
          autoComplete='off'
          {...register('newPassword2', {
            required: 'Please retype your new password',
          })}
        />
        <Button
          type='submit'
          className='mt-2 py-6 text-xl font-semibold'
          color='primary'
          variant='ghost'
          isLoading={formState.isSubmitting}
        >
          Submit
        </Button>
      </form>
      <span className='text-xl text-success-500'>{output}</span>
    </div>
  );
}

function setFormError(
  error: unknown,
  setError: UseFormSetError<ChangePasswordFormValues>
) {
  if (axios.isAxiosError(error)) {
    const errorResponse = error.response?.data;
    if (error.response?.status === 400 && errorResponse) {
      for (const [field, value] of Object.entries(errorResponse)) {
        if (field === 'password') {
          setError('password', { message: `${value}` });
          return;
        }
        if (field === 'newPassword') {
          setError('newPassword', { message: `${value}` });
          return;
        }
      }
    }
  }
  setError('password', { message: 'Something went wrong' });
}
