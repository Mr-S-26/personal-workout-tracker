import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'FitTrack - Personal Workout Tracker',
  description: 'Track your workouts, macros, and fitness progress',
  applicationName: 'Workout Tracker',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Workout Tracker',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-black">
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
