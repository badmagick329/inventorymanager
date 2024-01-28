'use client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Button } from '@nextui-org/react';

export default function LogoutButton() {
  const router = useRouter();

  function unauthUser() {
    const url = '/fetch/auth/logout';
    console.log('attempting to log out');
    const response = axios.post(url);
    response
      .then(() => {
        router.push('/');
      })
      .catch((error) => {
        console.error(`Couldn't log out`);
        return;
      });
  }

  return (
    <Button color='primary' variant='bordered' onClick={unauthUser}>
      Logout
    </Button>
  );
}
