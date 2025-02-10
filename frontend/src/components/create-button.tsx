import { Button } from "@heroui/react";

type FormState = {
  isSubmitting: boolean;
};

export default function CreateButton({ formState }: { formState: FormState }) {
  return (
    <Button
      data-testid='create-button'
      type='submit'
      color='primary'
      isLoading={formState.isSubmitting}
      radius='sm'
    >
      Create
    </Button>
  );
}
