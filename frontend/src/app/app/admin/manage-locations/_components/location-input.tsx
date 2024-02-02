import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister, useForm } from 'react-hook-form';
import React from 'react';

type FormValues = {
  location: string;
  usernames: string[];
};

export default function LocationInput({
  register,
  formState,
}: {
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
}) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.location?.message}
      </span>
      <Input
        className='mb-2'
        type='text'
        variant='flat'
        label='Location'
        autoComplete='off'
        {...register('location', { required: 'Location is required' })}
      />
    </>
  );
}
