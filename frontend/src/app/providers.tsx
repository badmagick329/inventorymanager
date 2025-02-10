'use client';

import { HeroUIProvider } from "@heroui/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute='class'
          defaultTheme='dark'
          themes={['dark', 'light', 'modern']}
        >
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
