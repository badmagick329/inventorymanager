import { X } from 'lucide-react';
import { Button } from '@nextui-org/react';
import { ICON_MD } from '@/consts';

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
      <X size={ICON_MD} />
    </Button>
  );
}
