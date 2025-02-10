import { Card, Skeleton } from "@heroui/react";
import React from 'react';

export default function LocationCardSkeleton() {
  return (
    <Card className='flex min-h-[160px] min-w-[280px] max-w-[320px] flex-col rounded-md md:min-w-[480px] md:max-w-[640px]'>
      <Skeleton className='rounded-lg'>
        <div className='h-24 rounded-lg bg-default-300'></div>
      </Skeleton>
      <div className='flex h-full flex-col justify-around space-y-3'>
        <Skeleton className='w-3/5 rounded-lg'>
          <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
        </Skeleton>
        <Skeleton className='w-4/5 rounded-lg'>
          <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
        </Skeleton>
        <Skeleton className='w-2/5 rounded-lg'>
          <div className='h-3 w-2/5 rounded-lg bg-default-300'></div>
        </Skeleton>
      </div>
    </Card>
  );
}
