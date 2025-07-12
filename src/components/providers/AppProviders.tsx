import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from './QueryProvider';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/layout/ScrollToTop';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <QueryProvider>
        <ThemeProvider defaultTheme="system" enableSystem>
          <ScrollToTop />
          <Toaster position="top-right" />
          {children}
        </ThemeProvider>
      </QueryProvider>
    </BrowserRouter>
  );
};