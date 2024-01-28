'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@nextui-org/react';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function unauthUser() {
    const url = '/fetch/auth/logout';
    console.log('attempting to log out');
    const response = axios.post(url);
    setLoading(true);
    response
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.error(`Couldn't log out`);
        return;
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <Button
      color='primary'
      variant='flat'
      onClick={unauthUser}
      isLoading={loading}
    >
      Logout
    </Button>
  );
}