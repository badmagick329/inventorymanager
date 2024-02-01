import React from 'react';
import LoginForm from '@/app/_components/login-form';
import Image from 'next/image';
import { FadeIn, MoveUp } from '@/transitions';

export const metadata = {
  title: 'Inventory Manager',
};

export default function LoginPage() {
  return (
    <main className='flex min-h-screen flex-col items-center gap-4 px-2 py-24 xs:px-24'>
      <div className='flex w-72 items-end justify-center'>
        <MoveUp>
          <Image
            width={80}
            height={80}
            src='images/warehouse-sm.png'
            alt='Warehouse'
            unoptimized
          />
        </MoveUp>
        <FadeIn>
          <h1 className='p-2 text-xl font-semibold'>Inventory Manager</h1>
        </FadeIn>
      </div>
      <LoginForm />
    </main>
  );
}
