import { APP_ADMIN } from '@/consts/urls';
import Link from 'next/link';
import useIsAdmin from '@/hooks/useIsAdmin';

export default function AdminItem() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href={APP_ADMIN}>
      <button className='rounded-md border-2 border-secondary-500 px-4 py-2 text-secondary-500 hover:bg-secondary-500 hover:text-white'>
        Admin
      </button>
    </Link>
  );
}
