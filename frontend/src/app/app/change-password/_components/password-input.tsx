import { ChangePasswordFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister } from 'react-hook-form';

export default function PasswordInput({
  formState,
  register,
}: {
  formState: FormState<ChangePasswordFormValues>;
  register: UseFormRegister<ChangePasswordFormValues>;
}) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.password?.message}
      </span>
      <Input
        type='password'
        variant='flat'
        label='Current Password'
        autoComplete='off'
        {...register('password', {
          required: 'Current Password is required',
        })}
      />
    </>
  );
}
