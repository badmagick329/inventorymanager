import { Button } from '@nextui-org/react';
import { FormValues } from './location-form';
import { FormState } from 'react-hook-form';
import { Plus } from 'lucide-react';

export default function SubmitButton({
  isLoading,
  formState,
}: {
  isLoading: boolean;
  formState: FormState<FormValues>;
}) {
  return (
    <Button
      type='submit'
      className='text-xl font-semibold'
      color='success'
      variant='ghost'
      isLoading={formState.isSubmitting || isLoading}
      isIconOnly
    >
      <Plus />
    </Button>
  );
}
