import { ICON_SM } from '@/consts';
import { Button, Modal, useDisclosure } from '@nextui-org/react';
import { Plus } from 'lucide-react';
import React from 'react';

import { CreateOrderForm } from '.';

export default function CreateOrderModal({
  locationId,
}: {
  locationId: string;
  orderId?: string;
}) {
  const size = '5xl';
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button
        onPress={onOpen}
        variant='ghost'
        color='default'
        radius='sm'
        endContent={<Plus size={ICON_SM} />}
      >
        Add Item
      </Button>
      <Modal
        className='flex w-full'
        size={size}
        isOpen={isOpen}
        onClose={onClose}
        placement='center'
        hideCloseButton
        isDismissable={false}
      >
        <CreateOrderForm locationId={locationId} onClose={onClose} />
      </Modal>
    </>
  );
}
