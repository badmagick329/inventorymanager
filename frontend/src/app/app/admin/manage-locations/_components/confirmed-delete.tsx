import { ICON_MD } from '@/consts';
import { Button } from '@nextui-org/react';
import { Pencil, Trash } from 'lucide-react';
import DeleteModal from './delete-modal';
import { Disclosure } from '@/types';

type ConfirmedDeleteProps = {
  locationId: number;
  onEditPress: () => void;
  isLoading: boolean;
  disclosure: Disclosure;
};

export default function ConfirmedDelete({
  locationId,
  onEditPress,
  isLoading,
  disclosure,
}: ConfirmedDeleteProps) {
  return (
    <div className='flex w-full justify-center gap-4'>
      <Button
        className='text-warning-600'
        variant='light'
        size='lg'
        onPress={onEditPress}
      >
        <Pencil size={ICON_MD} /> Edit
      </Button>
      <Button
        className='text-danger-600'
        onPress={disclosure.onOpen}
        variant='light'
        size='lg'
        isLoading={isLoading}
      >
        <Trash size={ICON_MD} /> Delete
      </Button>
      <DeleteModal disclosure={disclosure} locationId={locationId} />
    </div>
  );
}
