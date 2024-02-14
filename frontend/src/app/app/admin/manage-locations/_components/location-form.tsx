import { useForm } from 'react-hook-form';
import { useState } from 'react';
import React from 'react';
import LocationInput from './location-input';
import { getUsersWithAccessTo } from '@/utils/query-client-reader';
import UsernamesSelect from './usernames-select';
import CancelButton from '@/components/cancel-button';
import CreateButton from '@/components/create-button';
import useSubmitForm from './useSubmitForm';

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
  const selectedNames = getUsersWithAccessTo(locationId);
  const submitForm = useSubmitForm({ onSuccess, setError });

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
          <CreateButton formState={formState} />
        </div>
      </div>
    </form>
  );
}
