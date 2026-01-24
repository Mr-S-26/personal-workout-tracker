'use client';

import { Modal } from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['/', '?'], description: 'Open help menu' },
        { keys: ['Esc'], description: 'Close modals/dialogs' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['Ctrl', 'H'], description: 'Go to dashboard' },
        { keys: ['Ctrl', 'W'], description: 'Go to workouts' },
        { keys: ['Ctrl', 'M'], description: 'Go to macros' },
        { keys: ['Ctrl', 'R'], description: 'Go to reports' },
        { keys: ['Ctrl', 'T'], description: 'Go to templates' },
        { keys: ['Ctrl', 'P'], description: 'Go to personal records' },
        { keys: ['Ctrl', 'S'], description: 'Go to settings' },
      ],
    },
    {
      category: 'Rest Timer',
      items: [
        { keys: ['Space'], description: 'Start/Pause timer' },
        { keys: ['R'], description: 'Reset timer' },
        { keys: ['1'], description: 'Set 30 second timer' },
        { keys: ['2'], description: 'Set 60 second timer' },
        { keys: ['3'], description: 'Set 90 second timer' },
        { keys: ['4'], description: 'Set 2 minute timer' },
        { keys: ['5'], description: 'Set 3 minute timer' },
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use these keyboard shortcuts to navigate and control the app more efficiently.
        </p>

        {shortcuts.map((section) => (
          <div key={section.category}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded bg-gray-50 dark:bg-gray-800"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.description}
                  </span>
                  <div className="flex items-center gap-1">
                    {item.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
                          {key}
                        </kbd>
                        {keyIndex < item.keys.length - 1 && (
                          <span className="text-gray-500 dark:text-gray-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>Note:</strong> On Mac, use <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Cmd</kbd> instead of <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Ctrl</kbd>
          </p>
        </div>
      </div>
    </Modal>
  );
}
