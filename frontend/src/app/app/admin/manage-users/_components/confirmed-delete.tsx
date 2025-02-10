import { DeleteModal } from '@/components';
import { ICON_MD } from '@/consts';
import { useDeleteUser } from '@/hooks';
import { Disclosure } from '@/types';
import { Button } from "@heroui/react";
import { Trash } from 'lucide-react';

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
          data-testid='manage-users-delete-button'
          className='text-danger-600'
          onPress={disclosure.onOpen}
          variant='light'
          size='lg'
        >
          <Trash size={ICON_MD} /> Delete
        </Button>
        <DeleteModal
          disclosure={disclosure}
          params={{ userId }}
          mutation={deleteUser}
        />
      </div>
    </>
  );
}
