'use client';
import { useRouter } from 'next/navigation';

export default function MePage() {
  const router = useRouter();

  function unauthUser() {
    const fetcher = async () => {
      const url = '/api/auth/logout';
      const response = await fetch(url, {
        method: 'POST',
      });
      if (response.status !== 200) {
        console.error(`Couldn't log out. ${response.status}`);
        return;
      }
      router.push('/');
    };
    console.log('attempting to log out');
    fetcher();
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
