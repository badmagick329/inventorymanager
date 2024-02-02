import { Button } from '@nextui-org/react';
import { FormValues } from './location-form';
import { FormState } from 'react-hook-form';
import { Check } from 'lucide-react';

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
      color='success'
      variant='light'
      isLoading={formState.isSubmitting || isLoading}
      isIconOnly
    >
      <Check />
    </Button>
  );
}
