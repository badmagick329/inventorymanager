'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Location } from '@/types';
import { useQuery } from '@tanstack/react-query';
import UserNavBar from '@/components/UserNavBar/NavBar';
import Spinner from '@/components/Spinner';
import { LOCATIONS } from '@/consts/urls';

export default function Home() {
  const router = useRouter();
  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get(LOCATIONS),
    throwOnError: false,
    retry: false,
  });

  if (locationsQuery.isError) {
    router.push('/login');
    return null;
  }
  if (locationsQuery.isLoading || !locationsQuery.data) {
    return <Spinner />;
  }

  const locations = locationsQuery.data.data?.locations;
  if (locationsQuery.isSuccess && locations) {
    return (
      <div className='flex flex-col foreground min-h-full items-center'>
        <UserNavBar />
        {locationsQuery.data.data.locations.map((l: Location, idx: number) => (
          <span className='text-xl' key={idx}>
            {l.name}
          </span>
        ))}
      </div>
    );
  }
}
