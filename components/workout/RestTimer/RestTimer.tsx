'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTimerStore } from '@/lib/stores/timerStore';
import { TimerDisplay } from './TimerDisplay';
import { TimerControls } from './TimerControls';

interface RestTimerProps {
  presets?: { id: number; name: string; duration: number }[];
  onTimerComplete?: (duration: number) => void;
  exerciseId?: number;
  setId?: number;
}

export function RestTimer({ presets = [], onTimerComplete, exerciseId, setId }: RestTimerProps) {
  const {
    isActive,
    isPaused,
    timeRemaining,
    totalDuration,
    start,
    pause,
    resume,
    stop,
    reset,
    addTime,
    tick,
    setDuration,
  } = useTimerStore();

  const [customDuration, setCustomDuration] = useState('90');
  const [lastTimeRemaining, setLastTimeRemaining] = useState(timeRemaining);

  // Setup tick interval
  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, tick]);

  // Detect timer completion
  useEffect(() => {
    if (isActive && timeRemaining === 0 && lastTimeRemaining > 0) {
      // Timer just completed
      if (onTimerComplete) {
        onTimerComplete(totalDuration);
      }
    }
    setLastTimeRemaining(timeRemaining);
  }, [timeRemaining, isActive]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      // Only activate if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isActive) {
          handleStart();
        } else if (isPaused) {
          resume();
        } else {
          pause();
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, isPaused]);

  const handlePresetClick = (duration: number) => {
    if (isActive) {
      stop();
    }
    start(duration, exerciseId, setId);
  };

  const handleStart = () => {
    const duration = parseInt(customDuration) || 90;
    start(duration, exerciseId, setId);
  };

  const handleStop = () => {
    stop();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Rest Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex justify-center">
          <TimerDisplay
            timeRemaining={timeRemaining}
            totalDuration={totalDuration}
            isActive={isActive}
          />
        </div>

        {/* Timer Controls */}
        <TimerControls
          isActive={isActive}
          isPaused={isPaused}
          onStart={handleStart}
          onPause={pause}
          onResume={resume}
          onStop={handleStop}
          onReset={reset}
          onAddTime={addTime}
        />

        {/* Preset Buttons */}
        {!isActive && presets.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Quick Start:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePresetClick(preset.duration)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Duration Input */}
        {!isActive && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
              Custom Duration:
            </p>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="600"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                placeholder="Seconds"
                className="text-center"
              />
              <span className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                seconds
              </span>
            </div>
          </div>
        )}

        {/* Timer info when active */}
        {isActive && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isPaused ? (
              <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                ⏸ Timer Paused
              </span>
            ) : (
              <span>
                Rest period: {Math.floor(totalDuration / 60)}:
                {(totalDuration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
