'use client';

import { GlobalContextProvider } from '@/app/context/global-context-provider';
import { Navbar } from '@/components';
import AssistantChat from '@/components/assistant-chat';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='foreground flex min-h-screen w-full flex-col items-center'>
      <GlobalContextProvider>
        <Navbar />
        <main className='flex w-full flex-1 flex-col items-center pb-24'>
          {children}
        </main>
        <AssistantChat />
      </GlobalContextProvider>
    </div>
  );
}
