import { Button } from '@nextui-org/react';
import { FormValues } from './location-form';
import { FormState } from 'react-hook-form';
import { Plus, Pencil } from 'lucide-react';

export default function SubmitButton({
  isLoading,
  formState,
  editMode,
}: {
  isLoading: boolean;
  formState: FormState<FormValues>;
  editMode?: boolean;
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
      {editMode ? <Pencil size={24} /> : <Plus size={24} />}
    </Button>
  );
}
