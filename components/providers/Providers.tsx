'use client';

import { ReactNode, useState } from 'react';
import { ToastProvider } from '@/lib/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/Toast';
import { HelpModal } from '@/components/ui/HelpModal';
import { useGlobalShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function KeyboardShortcutsHandler() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  useGlobalShortcuts(() => setHelpModalOpen(true));

  return <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        {children}
        <ToastContainer />
        <KeyboardShortcutsHandler />
      </ToastProvider>
    </ErrorBoundary>
  );
}
