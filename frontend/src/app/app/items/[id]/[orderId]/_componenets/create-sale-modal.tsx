import React from 'react';
import { Modal, Button, useDisclosure } from '@nextui-org/react';
import CreateSaleForm from './create-sale-form';
import { Plus } from 'lucide-react';
import { ICON_SM } from '@/consts';

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
      <Button
        onPress={onOpen}
        isDisabled={remainingStock <= 0}
        endContent={<Plus size={ICON_SM} />}
        variant='ghost'
        color='default'
        radius='sm'
      >
        Add Sale
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
        <CreateSaleForm
          locationId={locationId}
          orderId={orderId}
          onClose={onClose}
        />
      </Modal>
    </>
  );
}
