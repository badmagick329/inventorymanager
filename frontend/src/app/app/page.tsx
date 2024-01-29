'use client';
import { useRouter } from 'next/navigation';
import { Location } from '@/types';
import Spinner from '@/components/Spinner';
import useLocations from '@/hooks/useLocations';
import { Button, Divider } from '@nextui-org/react';
import { ShoppingCart, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { APP_LOGIN } from '@/consts/appurls';

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
        {locations.map((l: Location, idx: number) => (
          <div key={idx} className='flex w-full flex-col items-center'>
            <div className='flex w-full justify-between px-6 md:w-2/3 2xl:w-1/3'>
              <Button
                className='rounded-md text-xs xs:hidden xs:text-sm'
                color='primary'
                variant='light'
              >
                {l.name.length > 25 ? `${l.name.slice(0, 25)}...` : l.name}
              </Button>
              <Button
                className='hidden rounded-md xs:block'
                color='primary'
                variant='light'
              >
                {l.name}
              </Button>
              <div className='flex gap-2 self-center'>
                <div>
                  <ShoppingCart className='h-4 w-4' />
                  <span>1.5k</span>
                </div>
                <div className='text-danger'>
                  <ArrowDownIcon className='h-4 w-4' />
                  <span>15k</span>
                </div>
                <div className='text-success'>
                  <ArrowUpIcon className='h-4 w-4' />
                  <span>25k</span>
                </div>
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
