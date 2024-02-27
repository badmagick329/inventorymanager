'use client';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/loaders';
import { useLocations } from '@/hooks';
import { Divider } from '@nextui-org/react';
import { APP_LOGIN } from '@/consts/urls';
import LocationOverview from '@/app/app/_components/location-overview';
import LocationLink from './_components/location-link';
import { Location } from '@/types';

export default function Locations() {
  const router = useRouter();
  const { error, isError, isLoading, data: locations } = useLocations();

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
        <div className='mb-8 mt-4 text-2xl font-semibold'>Locations</div>
        {locations.map((loc: Location, idx: number) => (
          <div key={loc.name} className='flex w-full flex-col items-center'>
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
          <div className='flex items-center justify-center'>
            No locations found. You may not have permission to view any
            locations yet.
          </div>
        )}
      </>
    );
  }
}
