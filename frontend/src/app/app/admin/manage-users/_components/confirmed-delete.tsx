import { Button } from '@nextui-org/react';
import { ICON_MD } from '@/consts';
import { Trash } from 'lucide-react';
import { Disclosure } from '@/types';
import DeleteModal from '@/components/delete-modal';
import { useDeleteUser } from '@/hooks';

export default function ConfirmedDelete({
  disclosure,
  userId,
}: {
  disclosure: Disclosure;
  userId: number;
}) {
  const deleteUser = useDeleteUser();
  return (
    <>
      <div className='flex w-full justify-center gap-4'>
        <Button
          className='text-danger-600'
          onPress={disclosure.onOpen}
          variant='light'
          size='lg'
        >
          <Trash size={ICON_MD} /> Delete
        </Button>
        <DeleteModal
          disclosure={disclosure}
          id={userId}
          mutation={deleteUser}
        />
      </div>
    </>
  );
}
