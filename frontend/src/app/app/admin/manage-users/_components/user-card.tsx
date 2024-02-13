'use client';
import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  useDisclosure,
} from '@nextui-org/react';
import UsernameDisplay from './username-display';
import LocationList from './location-list';
import ConfirmedDelete from './confirmed-delete';

import { User } from '@/types';

export default function UserCard({ user }: { user: User }) {
  const disclosure = useDisclosure();

  return (
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex items-center justify-center gap-2'>
        <UsernameDisplay username={user.username} />
      </CardHeader>
      <Divider />
      <CardBody>
        <LocationList locations={user.locations} />
      </CardBody>
      <Divider />
      <CardFooter>
        <ConfirmedDelete disclosure={disclosure} userId={user.id} />
      </CardFooter>
    </Card>
  );
}
