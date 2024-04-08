import { APP_ITEMS } from '@/consts/urls';
import { Button, Link } from '@nextui-org/react';

type LocationLinkProps = {
  id: number | undefined;
  name: string;
};

export default function LocationLink({ id, name }: LocationLinkProps) {
  return (
    <Button
      data-testid='home-locations-button'
      as={Link}
      href={`${APP_ITEMS}/${id}`}
      variant='light'
      color='primary'
      radius='sm'
      className='text-xl font-semibold'
    >
      {name}
    </Button>
  );
}
