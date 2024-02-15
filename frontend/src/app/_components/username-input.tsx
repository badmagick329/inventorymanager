import { Input } from '@nextui-org/react';
import { LoginFormValues } from '@/types';
import { FormState, UseFormRegister } from 'react-hook-form';

type InputProps = {
  register: UseFormRegister<LoginFormValues>;
  formState: FormState<LoginFormValues>;
};

export default function UsernameInput({ register, formState }: InputProps) {
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
