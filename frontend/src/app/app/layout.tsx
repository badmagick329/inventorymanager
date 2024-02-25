'use client';
import Navbar from '@/app/app/_components/navbar';
import { AdminProvider } from '../context/adminProvider';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex w-full flex-col items-center'>
      <AdminProvider>
        <Navbar />
        {children}
      </AdminProvider>
    </div>
  );
}
