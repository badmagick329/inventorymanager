import { useForm } from 'react-hook-form';
import { useState } from 'react';
import React from 'react';
import UsernamesDropdown from './usernames-dropdown';
import LocationInput from './location-input';
import SubmitButton from './submit-new-button';
import axios from 'axios';
import CancelButton from './cancel-new-button';
import { useQueryClient } from '@tanstack/react-query';
import { Location } from '@/types';
import { AxiosResponse } from 'axios';
import { useCreateLocation, useUpdateLocation } from '@/hooks';

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
      let response;
      if (locationId) {
        response = await updateLocation.mutateAsync({
          ...data,
          locationId,
        });
      } else {
        response = await createLocation.mutateAsync(data);
      }
      console.log('response', response.data);
      onSuccess && onSuccess();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('axios error', error.response?.data);
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
      <div className='flex w-full items-center justify-between'>
        <UsernamesDropdown
          usernames={usernames}
          setValue={setValue}
          selectedNames={selectedNames}
        />
        <CancelButton onCancel={onCancel} />
        <SubmitButton isLoading={false} formState={formState} />
      </div>
    </form>
  );
}

function getUsersWithAccessTo(locationId?: number) {
  if (!locationId) {
    return [] as string[];
  }
  const queryClient = useQueryClient();
  const locationQuery = queryClient.getQueryData(['locations']) as
    | AxiosResponse<any, any>
    | undefined;
  let selectedNames = [] as string[];
  if (locationQuery) {
    const locations = locationQuery.data as Location[];
    for (const location of locations) {
      if (location.id === locationId) {
        return location.users || ([] as string[]);
      }
    }
  }
  return selectedNames;
}
