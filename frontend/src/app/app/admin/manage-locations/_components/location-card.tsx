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
import { useDeleteLocation } from '@/hooks';
import { useQueryClient } from '@tanstack/react-query';
import DeleteModal from './delete-modal';
import LocationFormCard from './location-form-card';

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
  const disclosure = useDisclosure();
  const deleteLocation = useDeleteLocation();
  const [showForm, setShowForm] = React.useState(false);
  let usersText = users?.join(', ');
  if (!usersText) {
    usersText = '';
  }

  function fetchingLocations() {
    return queryClient.isFetching({ queryKey: ['locations'] }) > 0;
  }
  // TODO: Get usernames from the server
  const usernames = ['testuser1'];

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
        <p className='text-md md:text-semibold w-full text-center capitalize md:text-base'>
          {name}
        </p>
      </CardHeader>
      <Divider />
      <CardBody>
        {usersText === '' ? (
          <div className='text-default-400 flex w-full justify-center gap-2 text-center'>
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
              <Pencil size={24} /> Edit
            </Button>
            <Button
              className='text-danger-600'
              onPress={disclosure.onOpen}
              variant='light'
              size='lg'
              isLoading={deleteLocation.isPending || fetchingLocations()}
            >
              <Trash size={24} /> Delete
            </Button>
          </div>
          <DeleteModal disclosure={disclosure} locationId={locationId} />
        </div>
      </CardFooter>
    </Card>
  );
}
