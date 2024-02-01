'use client';
import { useRouter } from 'next/navigation';
import { Location } from '@/types';
import Spinner from '@/components/Spinner';
import useLocations from '@/hooks/useLocations';
import { Divider } from '@nextui-org/react';
import { APP_LOGIN } from '@/consts/urls';
import LocationOverview from '@/app/app/location-overview';
import LocationName from '@/app/app/location';

export default function Locations() {
  const router = useRouter();
  const { isError, isLoading, data } = useLocations();

  if (isError) {
    router.push(APP_LOGIN);
    return null;
  }

  const locations = data?.data?.locations;
  if (locations) {
    return (
      <>
        <div className='mb-8 mt-4 text-2xl font-semibold'>Locations</div>
        {locations.map((loc: Location, idx: number) => (
          <div key={idx} className='flex w-full flex-col items-center'>
            <div className='flex w-full justify-between px-6 md:w-2/3 2xl:w-1/3'>
              <LocationName name={loc.name} />
              <div className='flex justify-end gap-2 md:gap-4'>
                <LocationOverview
                  items={1500}
                  purchaseAmount={15000}
                  salesAmount={25000}
                />
              </div>
            </div>
            {idx !== locations.length - 1 && (
              <Divider className='my-6 w-full px-6 md:w-2/3 2xl:w-1/3' />
            )}
          </div>
        ))}
      </>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }
}
