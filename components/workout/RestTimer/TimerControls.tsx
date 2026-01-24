'use client';

import { Button } from '@/components/ui/Button';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
  onAddTime: (seconds: number) => void;
}

export function TimerControls({
  isActive,
  isPaused,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
  onAddTime,
}: TimerControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Primary controls */}
      <div className="flex gap-2 justify-center">
        {!isActive ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onStart}
            className="min-w-32"
          >
            Start Timer
          </Button>
        ) : isPaused ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={onResume}
              className="min-w-32"
            >
              Resume
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={onStop}
            >
              Stop
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              size="lg"
              onClick={onPause}
              className="min-w-32"
            >
              Pause
            </Button>
            <Button
              variant="danger"
              size="lg"
              onClick={onStop}
            >
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Secondary controls */}
      {isActive && (
        <div className="flex gap-2 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
          >
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTime(30)}
          >
            +30s
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddTime(-30)}
          >
            -30s
          </Button>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
        {!isActive
          ? 'Press Space to start'
          : isPaused
          ? 'Press Space to resume'
          : 'Press Space to pause'}
      </p>
    </div>
  );
}
