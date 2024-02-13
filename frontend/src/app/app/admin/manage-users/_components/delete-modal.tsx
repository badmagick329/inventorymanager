'use client';
import React from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spacer,
} from '@nextui-org/react';
import { useDeleteUser } from '@/hooks';
import { Disclosure } from '@/types';

type ModalProps = {
  disclosure: Disclosure;
  userId: number;
};

export default function DeleteModal({ userId, disclosure }: ModalProps) {
  const deleteUser = useDeleteUser();

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
                    deleteUser.mutate(userId);
                    onClose();
                  }}
                >
                  Delete
                </Button>
              </div>
            </ModalBody>
            <Spacer y={2} />
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
