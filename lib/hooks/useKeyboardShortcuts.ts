import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
          // Prevent default browser behavior for our shortcuts
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Global shortcuts hook
export function useGlobalShortcuts(helpModalOpen: () => void) {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      ctrl: false,
      description: 'Open help menu',
      action: helpModalOpen,
      category: 'General',
    },
    {
      key: '?',
      shift: true,
      description: 'Open help menu',
      action: helpModalOpen,
      category: 'General',
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to dashboard',
      action: () => router.push('/'),
      category: 'Navigation',
    },
    {
      key: 'w',
      ctrl: true,
      description: 'Go to workouts',
      action: () => router.push('/workouts'),
      category: 'Navigation',
    },
    {
      key: 'm',
      ctrl: true,
      description: 'Go to macros',
      action: () => router.push('/macros'),
      category: 'Navigation',
    },
    {
      key: 'r',
      ctrl: true,
      description: 'Go to reports',
      action: () => router.push('/reports'),
      category: 'Navigation',
    },
    {
      key: 't',
      ctrl: true,
      description: 'Go to templates',
      action: () => router.push('/templates'),
      category: 'Navigation',
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Go to personal records',
      action: () => router.push('/personal-records'),
      category: 'Navigation',
    },
    {
      key: 's',
      ctrl: true,
      description: 'Go to settings',
      action: () => router.push('/settings'),
      category: 'Navigation',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
