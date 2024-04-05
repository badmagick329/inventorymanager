'use client';

import { APP_MANAGE_LOCATIONS, APP_MANAGE_USERS } from '@/consts/urls';
import { Button, Link } from '@nextui-org/react';

export default function AdminPage() {
  return (
    <div className='flex w-full flex-col items-center gap-4 px-6 md:w-2/3 2xl:w-1/3'>
      <div className='mb-8 mt-4 text-2xl font-semibold'>Admin Panel</div>
      <Button
        as={Link}
        href={APP_MANAGE_LOCATIONS}
        className='w-64 rounded-md font-semibold'
        color='secondary'
        variant='ghost'
        size='lg'
      >
        Manage Locations
      </Button>
      <Button
        as={Link}
        href={APP_MANAGE_USERS}
        className='w-64 rounded-md font-semibold'
        color='secondary'
        variant='ghost'
        size='lg'
      >
        Manage Users
      </Button>
    </div>
  );
}
