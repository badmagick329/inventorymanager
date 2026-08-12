'use client';

import { ConnectionError, Spinner } from '@/components';
import { APP_LOCATIONS } from '@/consts/urls';
import { useLocationHistory } from '@/hooks';
import { isLocationHistoryResponse } from '@/predicates';
import { Button, Input, Link } from '@heroui/react';
import { usePathname } from 'next/navigation';
import React, { useDeferredValue, useState } from 'react';

import OrderHistoryAccordian from './_components/order-history-accordian';

export default function LocationHistory() {
  const pathname = usePathname();
  const locationId = pathname.split('/').pop();
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const deferredSearchValue = useDeferredValue(searchValue);

  if (!locationId) {
    return <ConnectionError message={'Invalid URL'} />;
  }

  const {
    isError,
    isLoading,
    data: history,
  } = useLocationHistory(locationId, page, deferredSearchValue);

  if (isError) {
    return <ConnectionError />;
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (!isLocationHistoryResponse(history)) {
    return (
      <ConnectionError
        message={
          'There may be an error in the data returned. Please contact the admin'
        }
      />
    );
  }

  return (
    <div
      data-testid='location-history-page'
      className='flex w-full flex-col gap-4'
    >
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
          data-testid='location-history-search'
          className='max-w-[540px]'
          type='search'
          placeholder='Search by item name'
          radius='sm'
          fullWidth
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <p className='px-4 text-sm text-muted-foreground'>{history.pagination.total} items</p>
      {history.results.map((order, index) => (
        <OrderHistoryAccordian
          key={index}
          orderHistory={order}
          searchValue={searchValue}
        />
      ))}
      <div className='flex items-center justify-between px-4 pb-4'>
        <Button variant='flat' color='default' isDisabled={page === 1} onPress={() => setPage((current) => current - 1)}>Previous</Button>
        <span className='text-sm text-muted-foreground'>Page {history.pagination.page}</span>
        <Button variant='flat' color='default' isDisabled={!history.pagination.hasNext} onPress={() => setPage((current) => current + 1)}>Next</Button>
      </div>
    </div>
  );
}
