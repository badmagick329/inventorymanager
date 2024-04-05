import {
  CancelButton,
  ConnectionError,
  CreateButton,
  UpdateButton,
} from '@/components';
import { useLocations, useSubmitLocation } from '@/hooks';
import { isLocationArray } from '@/predicates';
import { Location } from '@/types';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import LocationInput from './location-input';
import UsernamesSelect from './usernames-select';

type FormProps = {
  location: string;
  usernames: string[];
  onSuccess: () => void;
  onCancel: () => void;
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
  const defaultValues = { location, usernames };
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues,
  });

  const { data: locations, isLoading, isError } = useLocations();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError || !isLocationArray(locations)) {
    return <ConnectionError />;
  }

  const selectedNames = getUsersWithAccessTo(locationId, locations);
  const submitForm = useSubmitLocation({ onSuccess, setError });

  return (
    <form
      className='flex w-72 flex-col gap-2'
      onSubmit={handleSubmit((data) => submitForm(data, locationId))}
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
          {locationId ? (
            <UpdateButton formState={formState} />
          ) : (
            <CreateButton formState={formState} />
          )}
        </div>
      </div>
    </form>
  );
}

function getUsersWithAccessTo(
  locationId: number | undefined,
  locations: Location[]
) {
  if (!locationId) {
    return [];
  }
  const location = locations.find((loc) => loc.id === locationId);
  return location?.users || [];
}
