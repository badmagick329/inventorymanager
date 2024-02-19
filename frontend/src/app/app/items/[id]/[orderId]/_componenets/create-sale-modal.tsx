import React from 'react';
import { Modal, Button, useDisclosure } from '@nextui-org/react';
import CreateSaleForm from './create-sale-form';

export default function CreateSaleModal({
  locationId,
  orderId,
  remainingStock,
}: {
  locationId: string;
  orderId: string;
  remainingStock: number;
}) {
  const size = '5xl';
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button onPress={onOpen} isDisabled={remainingStock <= 0}>
        Add Sale
      </Button>
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
