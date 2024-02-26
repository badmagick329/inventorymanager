'use client';
import { Spinner } from '@/components/loaders';
import React from 'react';
import { ConnectionError } from '@/components/errors';
import { useLocationHistory } from '@/hooks';
import { usePathname } from 'next/navigation';
import { isOrderHistoryArray } from '@/predicates';
import OrderHistoryAccordian from './_components/order-history-accordian';
import { Button, Link } from '@nextui-org/react';
import { APP_LOCATIONS } from '@/consts/urls';
import PaddedDivider from '@/components/padded-divider';

export default function LocationHistory() {
  const pathname = usePathname();
  const locationId = pathname.split('/').pop();
  if (!locationId) {
    return <ConnectionError message={'Invalid URL'} />;
  }
  const {
    isError,
    isLoading,
    data: orderHistories,
  } = useLocationHistory(locationId);
  if (isError) {
    return <ConnectionError />;
  }
  if (isLoading) {
    return <Spinner />;
  }
  if (!isOrderHistoryArray(orderHistories)) {
    return (
      <ConnectionError
        message={
          'There may be an error in the data returned. Please contact the admin'
        }
      />
    );
  }

  return (
    <div className='flex w-full flex-col gap-4'>
      <div className='self-center pt-4'>
        <Button
          as={Link}
          href={APP_LOCATIONS}
          variant='flat'
          size='md'
          color='default'
        >
          Back to Locations
        </Button>
      </div>
      {orderHistories.map((order, index) => (
        <div key={index} className='flex flex-col p-4'>
          <div className='flex flex-col rounded-md border-1 border-default-400'>
            <OrderHistoryAccordian orderHistory={order} />
          </div>
        </div>
      ))}
    </div>
  );
}
