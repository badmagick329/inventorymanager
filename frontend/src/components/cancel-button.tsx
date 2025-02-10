import { Button } from "@heroui/react";

export default function CancelButton({ onCancel }: { onCancel?: () => void }) {
  if (!onCancel) {
    return null;
  }
  return (
    <Button
      data-testid='cancel-button'
      onPress={onCancel}
      color='danger'
      variant='light'
      radius='sm'
    >
      Cancel
    </Button>
  );
}
