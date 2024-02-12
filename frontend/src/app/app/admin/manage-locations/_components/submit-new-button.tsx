import { Button } from '@nextui-org/react';
import { FormValues } from './location-form';
import { FormState } from 'react-hook-form';

export default function SubmitButton({
  formState,
}: {
  formState: FormState<FormValues>;
}) {
  return (
    <Button type='submit' color='primary' isLoading={formState.isSubmitting}>
      Create
    </Button>
  );
}
