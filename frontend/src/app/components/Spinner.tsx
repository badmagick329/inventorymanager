import { CircularProgress } from '@nextui-org/react';

export default function Spinner() {
  return (
    <div className='flex flex-col items-center h-screen'>
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
