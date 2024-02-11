import React from 'react';
import { Modal, Button, useDisclosure } from '@nextui-org/react';
import CreateOrderForm from './create-order-form';

export default function CreateOrderModal({ locationId }: {locationId: string}) {
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
        <CreateOrderForm locationId={locationId} onClose={onClose} />
      </Modal>
    </>
  );
}
