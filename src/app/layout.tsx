import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ConditionalLayout from '@/components/ConditionalLayout';
import ServiceWorkerManager from '@/components/ServiceWorkerManager';
import PageViewTracker from '@/components/PageViewTracker';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinalPoint - F1 Prediction Game',
  description: 'Predict F1 race outcomes and compete with friends',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <ServiceWorkerManager />
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
