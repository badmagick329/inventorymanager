'use client';

import { NEXT_USERS_ME } from '@/consts/urls';
import { ChangePasswordFormValues } from '@/types';
import { Button } from '@nextui-org/react';
import axios from 'axios';
import { useState } from 'react';
import { UseFormReset, UseFormSetError, useForm } from 'react-hook-form';

import NewPasswordInput from './_components/new-password';
import NewPassword2Input from './_components/new-password2';
import PasswordInput from './_components/password-input';

export default function ChangePassword() {
  const [output, setOutput] = useState<string>('');
  const { register, handleSubmit, formState, setError, reset } = useForm({
    defaultValues: {
      password: '',
      newPassword: '',
      newPassword2: '',
    },
  });

  return (
    <div className='flex flex-col items-center gap-2 pt-24'>
      <span className='text-2xl font-semibold'>Change password</span>
      <form
        className='flex w-64 flex-col gap-2'
        onSubmit={handleSubmit((data) =>
          submitForm(data, reset, setError, setOutput)
        )}
      >
        <PasswordInput formState={formState} register={register} />
        <NewPasswordInput formState={formState} register={register} />
        <NewPassword2Input formState={formState} register={register} />
        <Button
          type='submit'
          className='mt-2 py-6 text-xl font-semibold'
          color='primary'
          variant='ghost'
          radius='sm'
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

async function submitForm(
  data: ChangePasswordFormValues,
  reset: UseFormReset<ChangePasswordFormValues>,
  setError: UseFormSetError<ChangePasswordFormValues>,
  setOutput: (output: string) => void
) {
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
