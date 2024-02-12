import { useForm } from 'react-hook-form';
import { useState } from 'react';
import React from 'react';
import LocationInput from './location-input';
import SubmitButton from './submit-new-button';
import axios from 'axios';
import CancelButton from './cancel-new-button';
import { getUsersWithAccessTo } from '@/utils/query-client-reader';
import { useCreateLocation, useUpdateLocation } from '@/hooks';
import UsernamesSelect from './usernames-select';

export type FormValues = {
  location: string;
  usernames: string[];
};

type FormProps = {
  location?: string;
  usernames?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
  locationId?: number;
};

export default function LocationForm({
  location,
  usernames,
  onSuccess,
  onCancel,
  locationId,
}: FormProps) {
  const [error, setError] = useState('');
  location = location || '';
  usernames = (usernames || []) as string[];
  const defaultValues = {
    location: location || '',
    usernames: (usernames || []) as string[],
  };
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: defaultValues,
  });
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const selectedNames = getUsersWithAccessTo(locationId);

  async function submitForm(data: FormValues) {
    try {
      console.log('form data', data);
      let response;
      if (locationId) {
        response = await updateLocation.mutateAsync({
          ...data,
          locationId,
        });
      } else {
        response = await createLocation.mutateAsync(data);
      }
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
      className='flex w-72 flex-col gap-2'
      onSubmit={handleSubmit((data) => submitForm(data))}
    >
      {error && <span className='self-center text-danger-500'>{error}</span>}
      <LocationInput
        location={location}
        register={register}
        formState={formState}
      />
      <div className='flex w-full flex-col items-center gap-4'>
        <UsernamesSelect
          usernames={usernames}
          selectedNames={selectedNames}
          register={register}
          setValue={setValue}
        />
        <div className='flex gap-4'>
          <CancelButton onCancel={onCancel} />
          <SubmitButton formState={formState} />
        </div>
      </div>
    </form>
  );
}
