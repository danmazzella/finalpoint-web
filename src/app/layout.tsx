import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import ConditionalLayout from '@/components/ConditionalLayout';
import ServiceWorkerManager from '@/components/ServiceWorkerManager';
import PageViewTracker from '@/components/PageViewTracker';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://finalpoint.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'FinalPoint — F1 Race Prediction Game',
    template: '%s | FinalPoint',
  },
  description:
    'FinalPoint is a free Formula 1 prediction game. Pick driver finishing positions before every Grand Prix, compete in private and public leagues, and track your accuracy across the season.',
  keywords: [
    'F1 prediction game',
    'Formula 1 fantasy',
    'F1 race predictor',
    'Grand Prix picks',
    'F1 fantasy league',
    'formula one predictions',
    'F1 picks game',
    'motorsport fantasy',
  ],
  authors: [{ name: 'FinalPoint' }],
  creator: 'FinalPoint',
  applicationName: 'FinalPoint',
  category: 'sports',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'FinalPoint',
    title: 'FinalPoint — F1 Race Prediction Game',
    description:
      'Pick F1 driver finishing positions before every Grand Prix, compete in leagues, and see how your predictions stack up. Free to play on web, iOS, and Android.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'FinalPoint — F1 Race Prediction Game',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'FinalPoint — F1 Race Prediction Game',
    description:
      'Free F1 prediction game. Pick driver positions, join leagues, track your accuracy. iOS & Android apps available.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <ServiceWorkerManager />
          <ThemeProvider>
            <AuthProvider>
              <FeatureFlagProvider>
                <ToastProvider>
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </ToastProvider>
              </FeatureFlagProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
