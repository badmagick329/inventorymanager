import { Button } from '@nextui-org/react';

export default function CancelButton({ onCancel }: { onCancel?: () => void }) {
  if (!onCancel) {
    return null;
  }
  return (
    <Button onPress={onCancel} color='danger' variant='light' radius='sm'>
      Cancel
    </Button>
  );
}
