'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { APP_LOGIN, API_LOGOUT } from '@/consts/urls';
import { useState } from 'react';
import { Loader2 as Loader } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  function unauthUser() {
    setIsLoading(true);
    console.log('attempting to log out');
    const response = axios.post(API_LOGOUT);
    response
      .catch(() => {
        console.error('Error logging out. Clearing cookies anyway');
      })
      .finally(() => {
        queryClient.removeQueries();
        setIsLoading(false);
        router.push(APP_LOGIN);
        return;
      });
  }

  return (
    <button
      className='rounded-md border-2 border-default-400 px-4 py-2 text-default-400 hover:bg-default-400 hover:text-white'
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
        <Loader className='h-4 w-4 animate-spin' />
        <span>Logout</span>
      </div>
    );
  }
  return <span>Logout</span>;
}
