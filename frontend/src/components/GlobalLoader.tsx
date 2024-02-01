'use client';
import { Loader2 as Loader } from 'lucide-react';

type Props = {
  isLoading?: boolean | undefined;
};

export default function GlobalLoader(props: Props) {
  const isLoading = props.isLoading ?? true;
  if (!isLoading) {
    return null;
  }
  console.log('GlobalLoader Loading');
  return (
    <div className='fixed right-8 top-8 z-50 flex w-full items-end justify-end'>
      <Loader className='h-6 w-6 animate-spin' />
    </div>
  );
}
