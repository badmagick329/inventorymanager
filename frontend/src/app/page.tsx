import LoginForm from '@/app/_components/login-form';
import { MoveRight, MoveUp } from '@/transitions';
import Image from 'next/image';
import React from 'react';

import WarehouseImage from '../../public/images/warehouse-sm.png';

export const metadata = {
  title: 'Inventory Manager',
};

export default function LoginPage() {
  return (
    <main className='flex min-h-dvh flex-col items-center gap-4 px-2 py-24 xs:px-24'>
      <div className='flex w-72 items-end justify-center'>
        <MoveUp>
          <Image
            width={80}
            height={80}
            src={WarehouseImage}
            alt='Warehouse'
            unoptimized
          />
        </MoveUp>
        <MoveRight>
          <h1 className='p-2 text-xl font-semibold'>Inventory Manager</h1>
        </MoveRight>
      </div>
      <LoginForm />
    </main>
  );
}
