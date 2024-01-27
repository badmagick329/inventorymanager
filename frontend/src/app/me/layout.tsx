'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [serverMessage, setServerMessage] = useState('');
  useEffect(() => {
    const response = axios.get('/fetch/me');
    console.log('fetching user');
    response
      .then((resp) => {
        setServerMessage(resp.data?.message);
      })
      .catch(() => {
        router.push('/');
        return;
      });
  }, [router]);

  if (!serverMessage) {
    return <span className='text-2xl'>Loading...</span>;
  }
  return (
    <main className='flex flex-col'>
      <span className='text-2xl'>{serverMessage}</span>
      {children}
    </main>
  );
}
