import { APP_ADMIN } from '@/consts/urls';
import useIsAdmin from '@/hooks/useIsAdmin';
import { Button, Link } from '@nextui-org/react';

export default function AdminItem() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Button
      as={Link}
      href={APP_ADMIN}
      className='rounded-md'
      color='secondary'
      variant='ghost'
    >
      Admin
    </Button>
  );
}
