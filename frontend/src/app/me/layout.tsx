'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  useEffect(() => {
    const fetcher = async () => {
      const url = '/api/me';
      const response = await fetch(url);
      if (response.status !== 200) {
        router.push('/');
        return;
      }
      const responseJson = await response.json();
      setUsername(responseJson.message);
    };
    fetcher();
  }, [router]);
  if (!username) {
    return <span className='text-2xl'>Loading...</span>;
  }
  return (
    <main className='flex flex-col'>
      <span className='text-2xl'>{username}</span>
      {children}
    </main>
  );
}
