import { Input } from '@nextui-org/react';
import { LoginFormValues } from '@/types';
import { FormState, UseFormRegister } from 'react-hook-form';

type InputProps = {
  register: UseFormRegister<LoginFormValues>;
  formState: FormState<LoginFormValues>;
};

export default function PasswordInput({ register, formState }: InputProps) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.password?.message}
      </span>
      <Input
        type='password'
        variant='flat'
        label='Password'
        autoComplete='off'
        {...register('password', { required: 'Password is required' })}
      />
    </>
  );
}
