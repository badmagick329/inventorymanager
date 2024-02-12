import { Button } from '@nextui-org/react';
import { FormValues } from './user-form';
import { FormState } from 'react-hook-form';

export default function SubmitButton({
  isLoading,
  formState,
}: {
  isLoading: boolean;
  formState: FormState<FormValues>;
}) {
  return (
    <Button
      className='p-2'
      type='submit'
      color='primary'
      isLoading={formState.isSubmitting || isLoading}
    >
      Create
    </Button>
  );
}
