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
    <Card
      data-testid='manage-users-user-card'
      className='flex min-h-52 w-full flex-col rounded-lg border border-border bg-card shadow-none'
    >
      <CardHeader className='flex items-center justify-start gap-2 px-5 py-4'>
        <UsernameDisplay username={user.username} />
      </CardHeader>
      <Divider />
      <CardBody className='px-5 py-4'>
        <LocationList locations={user.locations} />
      </CardBody>
      <Divider />
      <CardFooter className='px-3 py-2'>
        <ConfirmedDelete disclosure={disclosure} userId={user.id} />
      </CardFooter>
    </Card>
  );
}
