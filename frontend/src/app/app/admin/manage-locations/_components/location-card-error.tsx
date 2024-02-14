import { Button } from '@nextui-org/react';

export default function LocationCardError({
  message,
  refetcher,
}: {
  message: string;
  refetcher: () => void;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <span>{message}</span>
      <Button color='danger' variant='solid' onClick={refetcher}>
        Retry?
      </Button>
    </div>
  );
}
