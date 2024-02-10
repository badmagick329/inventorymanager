import React from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spacer,
} from '@nextui-org/react';
import CreateOrderForm from './create-order-form';

type Props = {
  locationId: string;
};

export default function CreateOrderModal({ locationId }: Props) {
  const size = '5xl';
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <div className='flex w-full justify-center'>
      <Button onPress={onOpen}>Add Item</Button>
      <Modal
        className='flex w-full'
        size={size}
        isOpen={isOpen}
        onClose={onClose}
        placement='center'
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <div className='flex flex-col gap-4'>
              <Spacer y={2} />
              <CreateOrderForm locationId={locationId} />
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button color='primary' onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
