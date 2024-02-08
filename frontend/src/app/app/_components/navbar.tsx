import { APP_LOCATIONS } from '@/consts/urls';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeSwitcher } from '@/app/app/_components/theme-switcher';
import LogoutButton from '@/app/app/_components/logout-button';
import AdminItem from '@/app/app/_components/admin-item';
import { Button } from '@nextui-org/react';

export default function Navbar() {
  return (
    <nav className='foreground flex w-full items-center bg-neutral-200 p-2 dark:bg-neutral-950'>
      <ul className='flex w-full items-center justify-between gap-4'>
        <li>
          <div className='flex items-center gap-2'>
            <Button
              className='rounded-md border-foreground p-2'
              variant='bordered'
              as={Link}
              href={APP_LOCATIONS}
              isIconOnly
            >
              <Image
                width={30}
                height={30}
                src='/images/warehouse-sm.png'
                alt='Warehouse'
                unoptimized
              />
            </Button>
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
    </nav>
  );
}
