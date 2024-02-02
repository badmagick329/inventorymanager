import { X } from 'lucide-react';
import { Button } from '@nextui-org/react';

export default function CancelButton({ onCancel }: { onCancel?: () => void }) {
  if (!onCancel) {
    return null;
  }
  return (
    <Button
      onClick={onCancel}
      className='p-2'
      color='warning'
      variant='light'
      isIconOnly
    >
      <X size={24} />
    </Button>
  );
}
