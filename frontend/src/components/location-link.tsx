import { Link } from '@nextui-org/react';
import { APP_ITEMS } from '@/consts/urls';
import { Button } from '@nextui-org/react';

type LocationLinkProps = {
  id: number | undefined;
  name: string;
};

export default function LocationLink({ id, name }: LocationLinkProps) {
  if (id === undefined) {
    <>
      <span className='justify-center self-center p-2 md:text-xl'>{name}</span>
    </>;
  }
  return (
    <Button
      as={Link}
      href={`${APP_ITEMS}/${id}`}
      variant='light'
      color='primary'
      className='text-xl font-semibold'
    >
      {name}
    </Button>
  );
}
