import { useForm } from 'react-hook-form';
import { useState } from 'react';
import React from 'react';
import UsernamesDropdown from './usernames-dropdown';
import LocationInput from './location-input';
import SubmitButton from './submit-button';
import { NEXT_LOCATIONS } from '@/consts/urls';
import axios from 'axios';
import { Button } from '@nextui-org/react';
import { X } from 'lucide-react';

export type FormValues = {
  location: string;
  usernames: string[];
};

type FormProps = {
  location?: string;
  usernames?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function LocationForm({
  location,
  usernames,
  onSuccess,
  onCancel,
}: FormProps) {
  const [error, setError] = useState('');
  location = location || '';
  usernames = (usernames || []) as string[];
  const defaults = {
    location: location || '',
    usernames: (usernames || []) as string[],
  };
  const { register, handleSubmit, formState, setValue } = useForm({
    defaultValues: defaults,
  });

  async function submitForm(data: FormValues) {
    try {
      const response = await axios.post(NEXT_LOCATIONS, data);
      console.log('response', response.data);
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
      <LocationInput register={register} formState={formState} />
      <div className='flex w-full items-center justify-between'>
        <UsernamesDropdown usernames={usernames} setValue={setValue} />
        <CancelButton onCancel={onCancel} />
        <SubmitButton isLoading={false} formState={formState} />
      </div>
    </form>
  );
}

function CancelButton({ onCancel }: { onCancel?: () => void }) {
  if (!onCancel) {
    return null;
  }
  return (
    <Button onClick={onCancel} color='danger' variant='ghost' isIconOnly>
      <X />
    </Button>
  );
}
