import { APP_ITEMS } from '@/consts/urls';
import { Link } from '@heroui/react';

type LocationLinkProps = {
  id: number | undefined;
  name: string;
};

export default function LocationLink({ id, name }: LocationLinkProps) {
  return (
    <Link
      data-testid='home-locations-button'
      href={`${APP_ITEMS}/${id}`}
      color='primary'
      className='text-lg font-semibold underline-offset-4 hover:underline focus-visible:underline'
    >
      {name}
    </Link>
  );
}
