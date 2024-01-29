'use client';
import { Header } from '@/components/Navbar/Header';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex min-h-full w-full flex-col items-center'>
      <Header />
      {children}
    </div>
  );
}
