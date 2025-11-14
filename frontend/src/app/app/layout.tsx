'use client';

import { GlobalContextProvider } from '@/app/context/global-context-provider';
import { Navbar } from '@/components';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex min-h-screen w-full flex-col items-center'>
      <GlobalContextProvider>
        <Navbar />
        {children}
      </GlobalContextProvider>
    </div>
  );
}
