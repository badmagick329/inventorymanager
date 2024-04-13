import { ICON_SM } from '@/consts';
import { Button, Modal, useDisclosure } from '@nextui-org/react';
import { Plus } from 'lucide-react';
import React from 'react';

import { CreateSaleForm } from '.';

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
        data-testid='sales-add-sale-button'
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
