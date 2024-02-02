import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister } from 'react-hook-form';
import React from 'react';

type FormValues = {
  location: string;
  usernames: string[];
};

type LocationInputProps = {
  location: string;
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
};

export default function LocationInput({
  location,
  register,
  formState,
}: LocationInputProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.location?.message}
      </span>
      <Input
        className='mb-2 rounded-none'
        type='text'
        variant='flat'
        label='Location'
        autoComplete='off'
        defaultValue={location}
        {...register('location', { required: 'Location is required' })}
      />
    </>
  );
}
