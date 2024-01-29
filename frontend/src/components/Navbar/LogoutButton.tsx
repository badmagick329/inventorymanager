'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { LOGOUT } from '@/consts/urls';
import { APP_LOGIN } from '@/consts/appurls';

export default function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function unauthUser() {
    console.log('attempting to log out');
    const response = axios.post(LOGOUT);
    response
      .catch(() => {
        console.error('Error logging out. Clearing cookies anyway');
      })
      .finally(() => {
        queryClient.removeQueries();
        router.push(APP_LOGIN);
        return;
      });
  }

  return (
    <button
      className='rounded-md border-2 border-default-400 px-4 py-2 text-default-400 hover:bg-default-400 hover:text-white'
      onClick={unauthUser}
    >
      Logout
    </button>
  );
}
