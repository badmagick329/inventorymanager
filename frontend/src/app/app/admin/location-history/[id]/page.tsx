'use client';
import { Spinner } from '@/components/loaders';
import React from 'react';
import { ConnectionError } from '@/components/errors';
import { useLocationHistory } from '@/hooks';
import { usePathname } from 'next/navigation';

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
  console.log(data);
  return <span>{JSON.stringify(data, null, 2)}</span>;
}
