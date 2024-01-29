import { APP_LOCATIONS, APP_ADMIN } from '@/consts/appurls';
import Link from 'next/link';
import Image from 'next/image';
import axios from 'axios';
import { ADMIN } from '@/consts/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ThemeSwitcher } from '@/components/Navbar/ThemeSwitcher';
import LogoutButton from '@/components/Navbar/LogoutButton';

export function Header() {
  return (
    // TODO: add theme based backgrounds color
    <div className='foreground flex w-full items-center p-2'>
      <ul className='flex w-full items-center justify-between gap-4'>
        <li>
          <div className='flex items-center gap-2'>
            <Link href={APP_LOCATIONS}>
              <Image
                width={50}
                height={50}
                src='/images/warehouse-sm.png'
                alt='Warehouse'
                unoptimized
              />
            </Link>
            <AdminItem />
          </div>
        </li>
        <li>
          <div className='flex items-center gap-2'>
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </li>
      </ul>
    </div>
  );
}

export function AdminItem() {
  const query = useQuery({
    queryKey: ['isAdmin'],
    queryFn: () => axios.get(ADMIN),
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
