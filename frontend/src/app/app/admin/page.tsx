'use client';
import { Link, Button } from '@nextui-org/react';
import { APP_MANAGE_LOCATIONS } from '@/consts/urls';

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
