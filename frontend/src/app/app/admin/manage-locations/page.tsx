'use client';
import Spinner from '@/components/Spinner';
import LocationForm from './_components/location-form';
import { Location } from '@/types';
import { useLocations } from '@/hooks';
import React from 'react';
import LocationCard from './_components/location-card';
import NewForm from './_components/new-form';

export default function ManageLocation() {
  const { error, isError, isLoading, data, refetch } = useLocations();
  if (isError) {
    return (
      <div>
        <span>An error occurred. Try again?</span>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  const locations = data?.data;
  if (locations) {
    return (
      <div className='flex h-full w-full flex-grow flex-col items-center gap-4 p-4'>
        <div className='flex text-2xl font-semibold'>Manage Locations</div>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8 2xl:grid-cols-3'>
          {locations.map((loc: Location) => {
            return (
              <LocationCard
                key={loc.name}
                locationId={loc.id}
                name={loc.name}
                users={loc.users}
              />
            );
          })}
          <NewForm />
        </div>
      </div>
    );
  }
  if (isLoading) {
    return <Spinner />;
  }
}
