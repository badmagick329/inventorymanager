import { ICON_MD } from '@/consts';
import { Button } from '@nextui-org/react';
import { Pencil, Trash } from 'lucide-react';
import DeleteModal from '@/components/delete-modal';
import { Disclosure } from '@/types';
import { useDeleteLocation } from '@/hooks';

type LocationCardButtonsProps = {
  locationId: number;
  onEditPress: () => void;
  isLoading: boolean;
  disclosure: Disclosure;
};

export default function LocationCardButtons({
  locationId,
  onEditPress,
  isLoading,
  disclosure,
}: LocationCardButtonsProps) {
  const deleteLocation = useDeleteLocation();
  return (
    <div className='flex w-full justify-center gap-4'>
      <Button
        className='text-warning-600'
        variant='light'
        radius='sm'
        onPress={onEditPress}
      >
        <Pencil size={ICON_MD} /> Edit
      </Button>
      <Button
        className='text-danger-600'
        onPress={disclosure.onOpen}
        variant='light'
        radius='sm'
        isLoading={isLoading}
      >
        <Trash size={ICON_MD} /> Delete
      </Button>
      <DeleteModal
        params={{ locationId }}
        disclosure={disclosure}
        mutation={deleteLocation}
      />
    </div>
  );
}
