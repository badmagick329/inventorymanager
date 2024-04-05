import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister } from 'react-hook-form';

type FormValues = {
  name: string;
};

type NameInputProps = {
  name: string;
  error: string;
  isEditing: boolean;
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
};

export default function NameInput({
  name,
  isEditing,
  error,
  register,
  formState,
}: NameInputProps) {
  if (isEditing) {
    return (
      <div className='flex w-full flex-col'>
        <span className='text-danger-500'>
          {formState.errors.name?.message || error}
        </span>
        <Input
          size='sm'
          className='max-w-lg'
          type='text'
          variant='flat'
          defaultValue={name}
          autoComplete='off'
          {...register('name', { required: 'Name is required' })}
        />
      </div>
    );
  }
  return (
    <div className='flex w-full flex-col'>
      <span className='text-xl'>{name}</span>
    </div>
  );
}
