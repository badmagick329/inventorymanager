'use client';
import { CircularProgress } from '@nextui-org/react';
import { Loader2 as Loader } from 'lucide-react';

export function GlobalLoader(props: { isLoading?: boolean | undefined }) {
  const isLoading = props.isLoading ?? true;
  if (!isLoading) {
    return null;
  }
  return (
    <div className='fixed right-8 top-8 z-50 flex w-full items-end justify-end'>
      <Loader className='h-6 w-6 animate-spin' />
    </div>
  );
}

export function Spinner() {
  return (
    <div className='flex h-full flex-col items-center'>
      <CircularProgress
        className='mt-24'
        color='primary'
        label='Loading'
        size='lg'
        aria-label='Loading...'
      />
    </div>
  );
}
