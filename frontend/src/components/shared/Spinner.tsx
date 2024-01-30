import { CircularProgress } from '@nextui-org/react';

export default function Spinner() {
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
