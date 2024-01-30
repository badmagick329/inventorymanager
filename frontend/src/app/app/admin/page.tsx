'use client';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@nextui-org/react';
import { APP_LOGIN, API_ADMIN } from '@/consts/urls';
import axios from 'axios';

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isError, isLoading, data, isSuccess } = useQuery({
    queryKey: ['manage'],
    queryFn: () => axios.get(API_ADMIN),
  });

  if (isError) {
    // TODO: Clear cookies
    router.push(APP_LOGIN);
    return null;
  }

  return (
    <div className='foreground flex min-h-full w-full flex-col items-center gap-y-4'>
      <div className='flex w-full justify-between px-6 md:w-2/3 2xl:w-1/3'>
        <Button className='rounded-md' color='warning' variant='ghost'>
          Important Button
        </Button>
      </div>
    </div>
  );
}
