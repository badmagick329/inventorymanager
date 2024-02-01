import { Input } from '@nextui-org/react';
import { FormValues } from '@/app/_components/login-form';
import { FormState, UseFormRegister } from 'react-hook-form';

export default function PasswordInput({
  register,
  formState,
}: {
  register: UseFormRegister<FormValues>;
  formState: FormState<FormValues>;
}) {
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
