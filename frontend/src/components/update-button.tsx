import { Button } from '@nextui-org/react';

type FormState = {
  isSubmitting: boolean;
};

export default function UpdateButton({ formState }: { formState: FormState }) {
  return (
    <Button
      data-testid='update-button'
      type='submit'
      color='warning'
      isLoading={formState.isSubmitting}
      radius='sm'
    >
      Update
    </Button>
  );
}
