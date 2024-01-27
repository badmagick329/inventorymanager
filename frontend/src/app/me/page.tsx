'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function MePage() {
  const router = useRouter();

  function unauthUser() {
    const url = '/fetch/auth/logout';
    console.log('attempting to log out');
    const response = axios.post(url);
    response
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.error(`Couldn't log out`);
        return;
      });
  }

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-2xl'>Super secret page</span>
      <button
        className='p-2 text-white bg-gray-800 rounded-md w-24'
        onClick={unauthUser}
      >
        Logout
      </button>
    </div>
  );
}
