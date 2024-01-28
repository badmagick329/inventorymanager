import React from 'react';
import LoginForm from '@/components/Main/LoginForm';
import Image from 'next/image';
import { FadeIn, MoveUp } from '@/transitions';

export const metadata = {
  title: 'Inventory Manager',
};

export default function LoginPage() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24 gap-4'>
      <div className='flex items-end'>
        <MoveUp>
          <Image
            width={80}
            height={80}
            src='images/warehouse.png'
            alt='Picture of a warehouse'
            unoptimized
          />
        </MoveUp>
        <FadeIn>
          <h1 className='text-2xl font-semibold p-2'>Inventory Manager</h1>
        </FadeIn>
      </div>
      <LoginForm />
    </main>
  );
}
