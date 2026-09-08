'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * attribute="data-theme" (sáng/tối) trên <html>
 * (`:root[data-theme="dark"]`), không dùng class mặc định của next-themes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
