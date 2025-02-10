'use client';

import { useDeleteLocation, useUsers } from '@/hooks';
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

import {
  LocationCardBody,
  LocationCardButtons,
  LocationCardError,
  LocationCardHeader,
  LocationCardSkeleton,
  LocationFormCard,
} from '.';

type LocationCardProps = {
  locationId: number;
  name: string;
  users?: string[];
};

export default function LocationCard({
  locationId,
  name,
  users,
}: LocationCardProps) {
  const disclosure = useDisclosure();
  const deleteLocation = useDeleteLocation();
  const [showForm, setShowForm] = React.useState(false);
  const { isError, isLoading, data: fetchedUsers, refetch } = useUsers();

  if (isLoading) {
    return <LocationCardSkeleton />;
  }

  if (isError) {
    return (
      <LocationCardError
        message={'An error occurred. Try again?'}
        refetcher={() => refetch()}
      />
    );
  }

  if (!fetchedUsers) {
    return (
      <LocationCardError
        message={'No users found'}
        refetcher={() => refetch()}
      />
    );
  }

  const usernames = fetchedUsers.map(
    (fetchedUser: User) => fetchedUser.username
  );

  if (showForm) {
    return (
      <LocationFormCard
        location={name}
        usernames={usernames}
        setShowForm={setShowForm}
        locationId={locationId}
      />
    );
  }

  return (
    <Card
      data-testid='manage-locations-location-card'
      className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'
    >
      <CardHeader className='flex w-full items-center justify-center gap-2'>
        <LocationCardHeader name={name} locationId={locationId} />
      </CardHeader>
      <Divider />
      <CardBody>
        <LocationCardBody users={users ?? []} />
      </CardBody>
      <Divider />
      <CardFooter>
        <LocationCardButtons
          locationId={locationId}
          onEditPress={() => setShowForm(true)}
          isLoading={deleteLocation.isPending}
          disclosure={disclosure}
        />
      </CardFooter>
    </Card>
  );
}
