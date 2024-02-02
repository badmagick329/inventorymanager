'use client';
import Spinner from '@/components/Spinner';
import LocationForm from './location-form';
import { Location } from '@/types';
import { useLocations } from '@/hooks';
import LocationLink from '@/components/location-link';
import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { Eye, EyeOff, Pencil, Trash } from 'lucide-react';
import { useDeleteLocation } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';

type LocationCardProps = {
  locationId?: number;
  name: string;
  users?: string[];
};

export default function LocationCard({
  locationId,
  name,
  users,
}: LocationCardProps) {
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const deleteLocation = useDeleteLocation();
  let usersText = users?.join(', ');
  if (!usersText) {
    usersText = '';
  }

  function fetchingLocations() {
    return queryClient.isFetching({ queryKey: ['locations'] }) > 0;
  }

  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader>
        <p className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          {name}
        </p>
      </CardHeader>
      <Divider />
      <CardBody>
        {usersText === '' ? (
          <div className='flex w-full justify-center gap-2 text-center text-default-400'>
            <EyeOff />
          </div>
        ) : (
          <div className='flex w-full justify-center gap-2 text-center'>
            <Eye />
            <span>{usersText}</span>
          </div>
        )}
      </CardBody>
      <Divider />
      <CardFooter>
        <div className='flex w-full justify-center gap-4'>
          <div className='flex h-full gap-4'>
            <Button className='text-warning-600' variant='light' size='lg'>
              <Pencil size={24} /> Edit
            </Button>
            <Button
              className='text-danger-600'
              onPress={onOpen}
              variant='light'
              size='lg'
              isLoading={deleteLocation.isPending || fetchingLocations()}
            >
              <Trash size={24} /> Delete
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader className='flex flex-col gap-1'>
                      Confirm Deletion
                    </ModalHeader>
                    <ModalFooter>
                      <Button color='default' variant='light' onPress={onClose}>
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
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
