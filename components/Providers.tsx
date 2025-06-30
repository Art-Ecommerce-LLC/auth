// components/Providers.tsx
'use client';
import {HeroUIProvider} from "@heroui/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <HeroUIProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </HeroUIProvider>
  );
}
