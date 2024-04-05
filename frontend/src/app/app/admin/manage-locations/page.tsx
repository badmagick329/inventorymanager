'use client';

import { ConnectionError, Spinner } from '@/components';
import { useLocations } from '@/hooks';
import { Location } from '@/types';
import React from 'react';

import { LocationCard, NewForm } from './_components';

export default function ManageLocation() {
  const { isError, isLoading, data: locations } = useLocations();
  if (isError) {
    return <ConnectionError />;
  }
  if (isLoading) {
    return <Spinner />;
  }

  if (locations) {
    return (
      <div className='flex w-full flex-col items-center gap-4 p-4'>
        <div className='flex text-2xl font-black'>Manage Locations</div>
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
}
