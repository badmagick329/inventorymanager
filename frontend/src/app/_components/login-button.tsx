import { Button } from '@nextui-org/react';
import { FormValues } from '@/app/_components/login-form';
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
      className='mt-2 py-6 text-xl font-semibold'
      color='primary'
      variant='ghost'
      isLoading={formState.isSubmitting || isLoading}
    >
      Login
    </Button>
  );
}
