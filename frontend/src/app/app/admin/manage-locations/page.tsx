'use client';

import { ConnectionError, Spinner } from '@/components';
import { useLocations } from '@/hooks';
import { Location } from '@/types';
import { Chip } from '@heroui/react';
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
      <section className='mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12'>
        <header className='mb-8 flex items-end justify-between gap-4'>
          <div>
            <h1
              data-testid='manage-locations-title'
              className='text-3xl font-semibold tracking-tight'
            >
              Manage Locations
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              Create schools and control who can access their inventory.
            </p>
          </div>
          <Chip variant='flat' radius='sm'>
            {locations.length} {locations.length === 1 ? 'location' : 'locations'}
          </Chip>
        </header>
        <div className='grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
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
      </section>
    );
  }
}
