import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/layout/Navigation';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'FitTrack - Personal Workout Tracker',
  description: 'Track your workouts, macros, and fitness progress',
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
