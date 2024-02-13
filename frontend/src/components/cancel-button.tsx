import { Button } from '@nextui-org/react';

export default function CancelButton({ onCancel }: { onCancel?: () => void }) {
  if (!onCancel) {
    return null;
  }
  return (
    <Button onClick={onCancel} color='danger' variant='light'>
      Cancel
    </Button>
  );
}
