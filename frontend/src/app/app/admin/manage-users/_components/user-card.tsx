'use client';

import { User } from '@/types';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  useDisclosure,
} from "@heroui/react";
import React from 'react';

import ConfirmedDelete from './confirmed-delete';
import LocationList from './location-list';
import UsernameDisplay from './username-display';

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
