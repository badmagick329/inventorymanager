import { APP_LOCATIONS } from '@/consts/urls';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/app/app/_components/theme-switcher';
import LogoutButton from '@/app/app/_components/logout-button';
import AdminItem from '@/app/app/_components/admin-item';

export default function Navbar() {
  return (
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
          <div className='flex h-full items-center gap-2'>
            <ThemeSwitcher />
            <LogoutButton />
          </div>
        </li>
      </ul>
    </div>
  );
}
