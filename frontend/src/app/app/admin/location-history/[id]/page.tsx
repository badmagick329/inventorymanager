'use client';

import { ConnectionError, Spinner } from '@/components';
import { APP_LOCATIONS } from '@/consts/urls';
import { useLocationHistory } from '@/hooks';
import { isOrderHistoryArray } from '@/predicates';
import { Button, Input, Link } from "@heroui/react";
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import OrderHistoryAccordian from './_components/order-history-accordian';

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
          radius='sm'
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
          radius='sm'
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
