'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Location } from '../utils/types';
import { useQuery } from '@tanstack/react-query';
import UserNavBar from '../components/UserNavBar';
import Spinner from '../components/Spinner';

export default function Home() {
  const router = useRouter();
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get('/fetch/locations'),
    throwOnError: false,
  });

  if (locationsQuery.isError) {
    router.push('/');
    return null;
  }
  if (locationsQuery.isLoading || !locationsQuery.data) {
    return <Spinner />;
  }

  if (locationsQuery.isSuccess) {
    return (
      <div className='flex flex-col foreground min-h-full items-center'>
        <UserNavBar />
        {locationsQuery.data.data.map((l: Location, idx: number) => (
          <span className='text-xl' key={idx}>
            {l.name}
          </span>
        ))}
      </div>
    );
  }
}
