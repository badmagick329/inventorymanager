import { LoginFormValues } from '@/types';
import { Button } from '@nextui-org/react';
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
