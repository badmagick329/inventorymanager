'use client';

import { useAdminStatus } from '@/app/context/global-context-provider';
import { Spinner } from '@/components';
import { APP_DEMO_WORKFLOW, APP_LOGIN } from '@/consts/urls';
import { useLocations } from '@/hooks';
import { Location } from '@/types';
import { Button, Divider, Link } from '@heroui/react';
import { useRouter } from 'next/navigation';

import LocationLink from './_components/location-link';
import LocationOverview from './_components/location-overview';

export default function Locations() {
  const router = useRouter();
  const { error, isError, isLoading, data: locations } = useLocations();
  const isAdmin = useAdminStatus();
  const nonAdminMessage = isAdmin
    ? ''
    : 'You may not have permission to view any locations yet.';

  if (isError) {
    console.error(`Received error ${error}`);
    router.push(APP_LOGIN);
  }

  if (isLoading) {
    return <Spinner />;
  }
  if (locations) {
    return (
      <>
        <h1
          data-testid='home-locations-title'
          className='mb-8 mt-12 text-2xl font-semibold'
        >
          Locations
        </h1>
        {locations.map((loc: Location, idx: number) => (
          <div
            data-testid='home-locations-container'
            key={loc.name}
            className='flex w-full flex-col items-center'
          >
            <div className='flex w-full justify-between px-6 md:w-2/3 2xl:w-1/3'>
              <LocationLink id={loc.id} name={loc.name} />
              <div className='flex justify-end gap-2 md:gap-4'>
                <LocationOverview
                  spendings={loc.spendings}
                  revenue={loc.revenue}
                  profit={loc.profit}
                  locationId={loc.id}
                />
              </div>
            </div>
            {idx !== locations.length - 1 && (
              <Divider className='my-6 w-full px-6 md:w-2/3 2xl:w-1/3' />
            )}
          </div>
        ))}
        {locations.length === 0 && (
          <div
            data-testid='home-locations-container'
            className='flex items-center justify-center'
          >
            No locations found.{nonAdminMessage}
          </div>
        )}
      </>
    );
  }
}
