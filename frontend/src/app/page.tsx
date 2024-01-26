import React from 'react';
import LoginForm from './LoginForm';
import Image from 'next/image';
import FadeIn from './utils/transitions/FadeIn';
import MoveUp from './utils/transitions/MoveUp';

export const metadata = {
  title: 'Inventory Manager',
};

export default function App() {
  return (
    <main className='flex min-h-screen flex-col items-center p-24 gap-4'>
      <div className='flex items-end'>
        <MoveUp>
          <Image
            className='max-h-24 w-auto'
            src='images/warehouse.png'
            alt='Picture of a warehouse'
            unoptimized
          />
        </MoveUp>
        <FadeIn>
          <h1 className='text-4xl font-semibold py-2'>Inventory Manager</h1>
        </FadeIn>
      </div>
      <LoginForm />
    </main>
  );
}
