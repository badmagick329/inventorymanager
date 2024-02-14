'use client';
import React from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalBody,
} from '@nextui-org/react';
import { useDeleteLocation } from '@/hooks';
import { Disclosure } from '@/types';

type ModalProps = {
  disclosure: Disclosure;
  locationId?: number;
};

export default function DeleteModal({ disclosure, locationId }: ModalProps) {
  const deleteLocation = useDeleteLocation();

  return (
    <Modal
      className='mx-4 flex w-full'
      isOpen={disclosure.isOpen}
      onOpenChange={disclosure.onOpenChange}
      placement='center'
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className='flex flex-col gap-1'>
              Confirm Deletion
            </ModalHeader>
            <ModalBody>
              <div className='flex justify-center gap-8'>
                <Button
                  color='default'
                  variant='light'
                  onPress={disclosure.onClose}
                >
                  Cancel
                </Button>
                <Button
                  color='danger'
                  onPress={() => {
                    deleteLocation.mutate(locationId);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </div>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
