'use client';
import { useState } from 'react';
import { useLogout } from '@/hooks';
import { Button } from '@nextui-org/react';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const logout = useLogout();

  async function unauthUser() {
    setIsLoading(true);
    logout.mutate();
    if (logout.isError) {
      setIsLoading(false);
    }
  }

  return (
    <Button
      className='rounded-md border-foreground-500'
      isLoading={isLoading}
      onClick={unauthUser}
      variant='ghost'
      color='default'
    >
      Logout
    </Button>
  );
}
