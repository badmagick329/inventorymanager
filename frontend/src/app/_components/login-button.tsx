import { LoginFormValues } from '@/types';
import { Button } from "@heroui/react";
import { FormState } from 'react-hook-form';

export default function LoginButton({
  isLoading,
  formState,
}: {
  isLoading: boolean;
  formState: FormState<LoginFormValues>;
}) {
  return (
    <Button
      data-testid='login-submit'
      type='submit'
      className='mt-2 py-6 text-xl font-semibold'
      color='primary'
      variant='ghost'
      radius='sm'
      isLoading={formState.isSubmitting || isLoading}
    >
      Login
    </Button>
  );
}
