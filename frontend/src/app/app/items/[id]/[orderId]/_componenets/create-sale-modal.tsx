import React from 'react';
import { Modal, Button, useDisclosure } from '@nextui-org/react';
import CreateSaleForm from './create-sale-form';

export default function CreateSaleModal({
  locationId,
  orderId,
}: {
  locationId: string;
  orderId: string;
}) {
  const size = '5xl';
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>Add Item</Button>
      <Modal
        className='flex w-full'
        size={size}
        isOpen={isOpen}
        onClose={onClose}
        placement='center'
        hideCloseButton
      >
        <CreateSaleForm
          locationId={locationId}
          orderId={orderId}
          onClose={onClose}
        />
      </Modal>
    </>
  );
}
