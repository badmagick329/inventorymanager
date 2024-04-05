import { ChangePasswordFormValues } from '@/types';
import { Input } from '@nextui-org/react';
import { FormState, UseFormRegister } from 'react-hook-form';

export default function NewPassword2Input({
  formState,
  register,
}: {
  formState: FormState<ChangePasswordFormValues>;
  register: UseFormRegister<ChangePasswordFormValues>;
}) {
  return (
    <>
      <span className='text-danger-500'>
        {formState.errors.newPassword2?.message}
      </span>
      <Input
        type='password'
        variant='flat'
        label='Retype New Password'
        autoComplete='off'
        {...register('newPassword2', {
          required: 'Please retype your new password',
        })}
      />
    </>
  );
}
