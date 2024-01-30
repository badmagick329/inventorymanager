import { Input } from '@nextui-org/react';
import { FormValues } from './LoginForm';
import { FormState, UseFormRegister } from 'react-hook-form';

export default function UsernameInput({
  register,
  formState,
}: {
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
}) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.username?.message}
      </span>
      <Input
        type='text'
        variant='flat'
        label='Username'
        autoComplete='off'
        {...register('username', { required: 'Username is required' })}
      />
    </>
  );
}
