import React from 'react';
import LoginForm from '@/components/Main/LoginForm';
import Image from 'next/image';
import { FadeIn, MoveUp } from '@/transitions';

export const metadata = {
  title: 'Inventory Manager',
};

export default function LoginPage() {
  return (
    <main className='flex min-h-screen flex-col items-center gap-4 p-24'>
      <div className='flex items-end'>
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
          <h1 className='p-2 text-xl font-semibold md:text-2xl'>
            Inventory Manager
          </h1>
        </FadeIn>
      </div>
      <LoginForm />
    </main>
  );
}
