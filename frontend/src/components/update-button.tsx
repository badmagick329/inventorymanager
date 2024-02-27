import { Button } from '@nextui-org/react';

type FormState = {
  isSubmitting: boolean;
};

export default function UpdateButton({ formState }: { formState: FormState }) {
  return (
    <Button type='submit' color='warning' isLoading={formState.isSubmitting}>
      Update
    </Button>
  );
}
