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
import { Eye, EyeOff, Pencil, Trash } from 'lucide-react';
import { useDeleteLocation, useUsers } from '@/hooks';
import DeleteModal from './delete-modal';
import LocationFormCard from './location-form-card';
import { ICON_MD } from '@/consts';
import { Spinner } from '@/components/loaders';
import { User } from '@/types';

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
  const disclosure = useDisclosure();
  const deleteLocation = useDeleteLocation();
  const [showForm, setShowForm] = React.useState(false);
  let usersText = users?.join(', ');
  if (!usersText) {
    usersText = '';
  }

  const { error, isError, isLoading, data, refetch } = useUsers();
  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return (
      <div>
        <span>An error occurred. Try again?</span>
        <Button color='danger' variant='solid' onClick={() => refetch()}>
          Retry?
        </Button>
      </div>
    );
  }

  const fetchedUsers = data?.data;
  if (!fetchedUsers) {
    <div>
      <span>No users found</span>
      <Button color='danger' variant='solid' onClick={() => refetch()}>
        Retry?
      </Button>
    </div>;
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
      <CardHeader>
        <p className='text-md md:text-semibold w-full text-center md:text-base'>
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
            <Button
              className='text-warning-600'
              variant='light'
              size='lg'
              onClick={() => setShowForm(true)}
            >
              <Pencil size={ICON_MD} /> Edit
            </Button>
            <Button
              className='text-danger-600'
              onPress={disclosure.onOpen}
              variant='light'
              size='lg'
              isLoading={deleteLocation.isPending}
            >
              <Trash size={ICON_MD} /> Delete
            </Button>
          </div>
          <DeleteModal disclosure={disclosure} locationId={locationId} />
        </div>
      </CardFooter>
    </Card>
  );
}
