'use client';
import { useRouter } from 'next/navigation';
import { Location } from '@/types';
import UserNavBar from '@/components/UserNavBar/NavBar';
import Spinner from '@/components/Spinner';
import useLocations from '@/hooks/useLocations';
import { useQueryClient } from '@tanstack/react-query';

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuccess, isError, isLoading, data } = useLocations();

  if (isError) {
    router.push('/login');
    return null;
  }

  const locations =
    data?.data?.locations || queryClient.getQueryData(['locations']);
  if (locations) {
    return (
      <div className='flex flex-col foreground min-h-full items-center'>
        <UserNavBar />
        {locations.map((l: Location, idx: number) => (
          <span className='text-xl' key={idx}>
            {l.name}
          </span>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }
}
