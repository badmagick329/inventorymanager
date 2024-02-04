'use client';
import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  useDisclosure,
} from '@nextui-org/react';
import { Trash } from 'lucide-react';
import { useDeleteUser } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import DeleteModal from './delete-modal';
import { ICON_MD } from '@/consts';

import { User } from '@/types';

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const queryClient = useQueryClient();
  const disclosure = useDisclosure();
  const [showForm, setShowForm] = React.useState(false);

  return (
    <div>
      <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
        <CardHeader>
          <p className='text-md md:text-semibold w-full text-center md:text-base'>
            {user.username}
          </p>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className='flex flex-col gap-2'>
            {user.locations.map((location) => (
              <p className='text-center' key={location.name}>
                {location.name}
              </p>
            ))}
            {user.locations.length === 0 && (
              <p className='text-center text-default-300'>No locations</p>
            )}
          </div>
        </CardBody>
        <Divider />
        <CardFooter>
          <div className='flex w-full justify-center gap-4'>
            <div className='flex h-full gap-4'>
              <Button
                className='text-danger-600'
                onPress={disclosure.onOpen}
                variant='light'
                size='lg'
              >
                <Trash size={ICON_MD} /> Delete
              </Button>
            </div>
            <DeleteModal disclosure={disclosure} userId={user.id} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
