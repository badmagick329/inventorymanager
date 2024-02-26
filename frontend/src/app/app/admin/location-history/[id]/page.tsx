'use client';
import { Spinner } from '@/components/loaders';
import React from 'react';
import { ConnectionError } from '@/components/errors';
import { useLocationHistory } from '@/hooks';
import { usePathname } from 'next/navigation';
import { isOrderHistoryArray } from '@/predicates';
import OrderHistoryAccordian from './_components/order-history-accordian';
import { Button, Input, Link } from '@nextui-org/react';
import { APP_LOCATIONS } from '@/consts/urls';
import { useState } from 'react';

export default function LocationHistory() {
  const pathname = usePathname();
  const locationId = pathname.split('/').pop();
  const [searchValue, setSearchValue] = useState('');

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
      <div className='flex w-full justify-center'>
        <Input
          className='max-w-[540px]'
          type='search'
          placeholder='Search by item name'
          size='sm'
          fullWidth
          onChange={(e) => {
            setSearchValue(e.target.value);
          }}
        />
      </div>
      {orderHistories.map((order, index) => (
        <OrderHistoryAccordian
          key={index}
          orderHistory={order}
          searchValue={searchValue}
        />
      ))}
    </div>
  );
}
