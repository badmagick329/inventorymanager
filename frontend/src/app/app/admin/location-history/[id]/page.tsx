'use client';
import { Spinner } from '@/components/loaders';
import React from 'react';
import { ConnectionError } from '@/components/errors';
import { useLocationHistory } from '@/hooks';
import { usePathname } from 'next/navigation';
import { isOrderHistoryArray } from '@/predicates';
import OrderHistoryAccordian from './_components/order-history-accordian';

export default function LocationHistory() {
  const pathname = usePathname();
  const locationId = pathname.split('/').pop();
  if (!locationId) {
    return <ConnectionError message={'Invalid URL'} />;
  }
  const { isError, isLoading, data } = useLocationHistory(locationId);
  if (isError) {
    return <ConnectionError />;
  }
  if (isLoading) {
    return <Spinner />;
  }
  if (!isOrderHistoryArray(data)) {
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
      {data.map((order, index) => (
        <div key={index}>
          <OrderHistoryAccordian orderHistory={order} />
        </div>
      ))}
    </div>
  );
}
