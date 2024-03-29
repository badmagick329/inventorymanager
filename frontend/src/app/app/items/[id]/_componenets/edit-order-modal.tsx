import React from 'react';
import { Modal, Button, useDisclosure } from '@nextui-org/react';
import CreateOrderForm from './create-order-form';
import { Pencil } from 'lucide-react';
import { ICON_SM } from '@/consts';
import { Tooltip } from '@nextui-org/react';
import { DELAY_500 } from '@/consts';

export default function EditOrderModal({
  locationId,
  orderId,
  isDisabled,
}: {
  locationId: string;
  orderId: string;
  isDisabled: boolean;
}) {
  const size = '5xl';
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Tooltip content='Edit' color='default' delay={DELAY_500}>
        <Button
          onPress={onOpen}
          size='sm'
          variant='flat'
          isIconOnly
          isDisabled={isDisabled}
        >
          <Pencil size={ICON_SM} />
        </Button>
      </Tooltip>
      <Modal
        className='flex w-full'
        size={size}
        isOpen={isOpen}
        onClose={onClose}
        placement='center'
        hideCloseButton
      >
        <CreateOrderForm
          locationId={locationId}
          orderId={orderId}
          onClose={onClose}
        />
      </Modal>
    </>
  );
}
