import { Button } from '@nextui-org/react';

type FormState = {
  isSubmitting: boolean;
};

export default function CreateButton({ formState }: { formState: FormState }) {
  return (
    <Button
      type='submit'
      color='primary'
      isLoading={formState.isSubmitting}
      radius='sm'
    >
      Create
    </Button>
  );
}
