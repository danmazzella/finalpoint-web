import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ConditionalLayout from '@/components/ConditionalLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

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
        <AuthProvider>
          <ToastProvider>
            <ConditionalLayout>
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </ConditionalLayout>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
