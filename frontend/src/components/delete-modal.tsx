'use client';

import { Disclosure } from '@/types';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spacer,
} from "@heroui/react";
import { UseMutationResult } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import React from 'react';

type MutationResult = UseMutationResult<
  AxiosResponse<any, any>,
  unknown,
  any,
  unknown
>;

type ModalProps = {
  params: any;
  disclosure: Disclosure;
  mutation: MutationResult;
};

export default function DeleteModal({
  params,
  disclosure,
  mutation,
}: ModalProps) {
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
                  radius='sm'
                  onPress={disclosure.onClose}
                  isDisabled={mutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  data-testid='delete-confirm-button'
                  color='danger'
                  isDisabled={mutation.isPending}
                  radius='sm'
                  onPress={() => {
                    mutation.mutateAsync(params).then(() => {
                      onClose();
                    });
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
