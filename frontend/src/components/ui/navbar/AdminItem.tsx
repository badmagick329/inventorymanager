import axios from 'axios';
import { APP_ADMIN, API_ADMIN } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export default function AdminItem() {
  const query = useQuery({
    queryKey: ['isAdmin'],
    queryFn: () => axios.get(API_ADMIN),
    placeholderData: keepPreviousData,
  });
  const isAdmin = query.isSuccess;

  if (!isAdmin) {
    return null;
  }

  return (
    <Link href={APP_ADMIN}>
      <button className='rounded-md border-2 border-secondary-400 px-4 py-2 text-secondary-400 hover:bg-secondary-400 hover:text-white'>
        Admin
      </button>
    </Link>
  );
}
