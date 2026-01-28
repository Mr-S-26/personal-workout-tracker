'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/templates', label: 'Templates', icon: '📋' },
  { href: '/workouts', label: 'Workouts', icon: '💪' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/macros', label: 'Macros', icon: '🍎' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage and system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <>
      {/* Theme Toggle - Mobile (Floating Button) */}
      <button
        onClick={toggleTheme}
        className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg active:scale-95 transition-transform"
        aria-label="Toggle theme"
      >
        <span className="text-xl">{isDark ? '☀️' : '🌙'}</span>
      </button>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-zinc-800 z-50 safe-area-bottom">
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-white bg-blue-50 dark:bg-zinc-900'
                    : 'text-gray-600 dark:text-zinc-400 active:bg-gray-100 dark:active:bg-zinc-900'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 dark:text-white">
                FitTrack
              </Link>
            </div>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white dark:bg-white dark:text-black'
                        : 'text-gray-700 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/reports"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/reports'
                    ? 'bg-blue-600 text-white dark:bg-white dark:text-black'
                    : 'text-gray-700 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
              >
                Reports
              </Link>
              <Link
                href="/personal-records"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/personal-records'
                    ? 'bg-blue-600 text-white dark:bg-white dark:text-black'
                    : 'text-gray-700 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900'
                }`}
              >
                PRs
              </Link>

              {/* Theme Toggle - Desktop */}
              <button
                onClick={toggleTheme}
                className="ml-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
                aria-label="Toggle theme"
              >
                <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
