'use client';
import { Button } from '@nextui-org/react';
import { useIsAdmin, useLogout } from '@/hooks';

export default function AdminPage() {
  const isAdmin = useIsAdmin();
  const logout = useLogout();

  if (!isAdmin) {
    logout.mutate();
    return null;
  }

  return (
    <div className='flex w-full flex-col items-center gap-4 px-6 md:w-2/3 2xl:w-1/3'>
      <div className='mb-8 mt-4 text-2xl font-semibold'>Admin Panel</div>
      <Button
        className='w-64 rounded-md text-xl'
        color='secondary'
        variant='ghost'
        size='lg'
      >
        Manage Locations
      </Button>
      <Button
        className='w-64 rounded-md text-xl'
        color='secondary'
        variant='ghost'
        size='lg'
      >
        Manage Users
      </Button>
    </div>
  );
}
