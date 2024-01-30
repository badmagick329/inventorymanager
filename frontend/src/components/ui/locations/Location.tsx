import { Button } from '@nextui-org/react';

export default function Location({ name }: { name: string }) {
  return (
    <>
      <Button
        className='rounded-md text-xs xs:hidden xs:text-sm'
        color='primary'
        variant='light'
      >
        {name.length > 25 ? `${name.slice(0, 25)}...` : name}
      </Button>
      <Button
        className='hidden rounded-md xs:block'
        color='primary'
        variant='light'
      >
        {name}
      </Button>
    </>
  );
}
