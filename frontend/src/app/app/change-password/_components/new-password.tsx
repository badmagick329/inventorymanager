import { ChangePasswordFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister } from 'react-hook-form';

export default function NewPasswordInput({
  formState,
  register,
}: {
  formState: FormState<ChangePasswordFormValues>;
  register: UseFormRegister<ChangePasswordFormValues>;
}) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.newPassword?.message}
      </span>
      <Input
        type='password'
        variant='flat'
        label='New Password'
        autoComplete='off'
        {...register('newPassword', { required: 'New Password is required' })}
      />
    </>
  );
}
