'use client';
import Navbar from '@/app/app/_components/navbar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex w-full flex-col items-center'>
      <Navbar />
      {children}
    </div>
  );
}
