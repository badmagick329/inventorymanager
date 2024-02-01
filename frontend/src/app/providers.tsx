'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { NextUIProvider } from '@nextui-org/react';
import { useState } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  return (
    <NextUIProvider navigate={router.push}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute='class'
          defaultTheme='dark'
          themes={['dark', 'light', 'modern']}
        >
          <ReactQueryDevtools initialIsOpen={false} />
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </NextUIProvider>
  );
}
