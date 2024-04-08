import { DeleteModal } from '@/components';
import { ICON_MD } from '@/consts';
import { useDeleteLocation } from '@/hooks';
import { Disclosure } from '@/types';
import { Button } from '@nextui-org/react';
import { Pencil, Trash } from 'lucide-react';

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
        data-testid='manage-locations-edit-button'
        className='text-warning-600'
        variant='light'
        radius='sm'
        onPress={onEditPress}
      >
        <Pencil size={ICON_MD} /> Edit
      </Button>
      <Button
        data-testid='manage-locations-delete-button'
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
