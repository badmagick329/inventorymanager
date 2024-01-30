'use client';
import Navbar from '@/components/ui/navbar/Navbar';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex min-h-full w-full flex-col items-center'>
      <Navbar />
      {children}
    </div>
  );
}
