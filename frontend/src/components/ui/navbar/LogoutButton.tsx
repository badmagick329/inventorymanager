'use client';
import { useState } from 'react';
import { Loader2 as Loader } from 'lucide-react';
import { useLogout } from '@/hooks';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useLogout();

  async function unauthUser() {
    setIsLoading(true);
    logout.mutate();
    if (logout.isError) {
      setIsLoading(false);
    }
  }

  return (
    <button
      className='rounded-md border-2 border-default-500 px-4 py-2 text-default-500 hover:bg-default-500 hover:text-white'
      onClick={unauthUser}
      disabled={isLoading}
    >
      <LogoutButtonText isLoading={isLoading} />
    </button>
  );
}

function LogoutButtonText({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className='flex items-center gap-1'>
        <Loader className='icon-sm animate-spin' />
        <span>Logout</span>
      </div>
    );
  }
  return <span>Logout</span>;
}
