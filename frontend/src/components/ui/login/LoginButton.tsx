import { Button } from '@nextui-org/react';
import { FormValues } from './LoginForm';
import { FormState } from 'react-hook-form';

export default function LoginButton({
  isLoading,
  formState,
}: {
  isLoading: boolean;
  formState: FormState<FormValues>;
}) {
  return (
    <Button
      type='submit'
      className='py-6 text-xl font-semibold'
      color='primary'
      variant='ghost'
      isLoading={formState.isSubmitting || isLoading}
    >
      Login
    </Button>
  );
}
