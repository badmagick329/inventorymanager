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
import { Pencil, Trash, Warehouse, User as UserIcon } from 'lucide-react';
import { useDeleteLocation, useUsers } from '@/hooks';
import DeleteModal from './delete-modal';
import LocationFormCard from './location-form-card';
import { ICON_MD } from '@/consts';
import { User } from '@/types';
import LocationCardSkeleton from './location-card-skeleton';
import { Link } from '@nextui-org/react';
import { APP_ITEMS, APP_MANAGE_USERS } from '@/consts/urls';

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

  const { isError, isLoading, data, refetch } = useUsers();
  if (isLoading) {
    return <LocationCardSkeleton />;
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
      <CardHeader className='flex w-full items-center justify-center gap-2'>
        <Warehouse className='pb-1' size={ICON_MD} />
        <Link
          color='foreground'
          className='font-semibold'
          href={`${APP_ITEMS}/${locationId}`}
        >
          {name}
        </Link>
      </CardHeader>
      <Divider />
      <CardBody>
        <ul className='flex flex-wrap justify-center gap-8'>
          {users?.map((user: string) => {
            return (
              <div key={user} className='flex gap-2'>
                <UserIcon className='pb-1' size={ICON_MD} />
                <span>{user}</span>
              </div>
            );
          })}
        </ul>
        {users?.length === 0 && (
          <div className='flex w-full justify-center gap-2'>
            <span>No users assigned. </span>
            <Link
              color='foreground'
              href={APP_MANAGE_USERS}
              className='underline'
            >
              Create new user?
            </Link>
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
