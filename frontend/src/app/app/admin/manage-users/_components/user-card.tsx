'use client';
import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Button,
  Link,
  useDisclosure,
} from '@nextui-org/react';
import { Trash, Warehouse, User as UserIcon } from 'lucide-react';
import DeleteModal from './delete-modal';
import { ICON_MD } from '@/consts';
import { APP_ITEMS, APP_MANAGE_LOCATIONS } from '@/consts/urls';

import { User } from '@/types';

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  const disclosure = useDisclosure();

  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex items-center justify-center gap-2'>
        <UserIcon className='pb-1' size={ICON_MD} />
        <p className='font-semibold'>{user.username}</p>
      </CardHeader>
      <Divider />
      <CardBody>
        <div className='flex flex-col items-start gap-4'>
          {user.locations.map((location) => (
            <Link
              color='foreground'
              href={`${APP_ITEMS}/${location.id}`}
              key={location.id}
              className='flex justify-start gap-2 pr-4'
            >
              <Warehouse className='pb-1' size={ICON_MD} />
              <p className='text-center' key={location.name}>
                {location.name}
              </p>
            </Link>
          ))}
          {user.locations.length === 0 && (
            <Link
              color='foreground'
              href={APP_MANAGE_LOCATIONS}
              className='text-md md:text-semibold flex w-full justify-center underline md:text-base'
            >
              Assign Locations
            </Link>
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
  );
}
