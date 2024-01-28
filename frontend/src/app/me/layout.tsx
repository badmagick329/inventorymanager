'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import UserNavBar from '@/components/UserNavBar/NavBar';
import Spinner from '@/components/Spinner';

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userQuery = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => axios.get('/fetch/me'),
    throwOnError: false,
    retry: false,
  });

  if (userQuery.isError) {
    router.push('/login');
    return null;
  }
  if (userQuery.isLoading || !userQuery.data) {
    return <Spinner />;
  }
  if (userQuery.isSuccess && userQuery.data?.data?.message) {
    return (
      <main className='flex flex-col'>
        <UserNavBar />
        <span className='text-2xl'>{userQuery.data.data.message}</span>
        {children}
      </main>
    );
  }
}
