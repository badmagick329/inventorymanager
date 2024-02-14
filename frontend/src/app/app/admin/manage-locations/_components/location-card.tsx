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
import { useDeleteLocation, useUsers } from '@/hooks';
import LocationFormCard from './location-form-card';
import { User } from '@/types';
import LocationCardSkeleton from './location-card-skeleton';
import LocationCardError from './location-card-error';
import LocationCardHeader from './location-card-header';
import LocationCardBody from './location-card-body';
import ConfirmedDelete from './confirmed-delete';

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
  const { isError, isLoading, data, refetch } = useUsers();

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

  const fetchedUsers = data?.data;
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
    <Card className='flex min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <CardHeader className='flex w-full items-center justify-center gap-2'>
        <LocationCardHeader name={name} locationId={locationId} />
      </CardHeader>
      <Divider />
      <CardBody>
        <LocationCardBody users={users ?? []} />
      </CardBody>
      <Divider />
      <CardFooter>
        <ConfirmedDelete
          locationId={locationId}
          onEditPress={() => setShowForm(true)}
          isLoading={deleteLocation.isPending}
          disclosure={disclosure}
        />
      </CardFooter>
    </Card>
  );
}
