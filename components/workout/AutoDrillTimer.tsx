'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Drill {
  id: number;
  name: string;
  duration: number; // seconds
}

interface AutoDrillTimerProps {
  drills: Drill[];
  onComplete: () => void;
  onExit: () => void;
}

export function AutoDrillTimer({ drills, onComplete, onExit }: AutoDrillTimerProps) {
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'drill' | 'complete'>('ready');
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null); // Timestamp when current phase should end
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentDrill = drills[currentDrillIndex];
  const progress = ((currentDrillIndex + 1) / drills.length) * 100;

  // Play beep sound
  const playBeep = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  };

  // Calculate time remaining based on endTime timestamp
  const updateTimeRemaining = () => {
    if (!endTime || isPaused) return;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

    setTimeRemaining(remaining);

    // Check if time is up
    if (remaining <= 0) {
      playBeep();

      if (phase === 'countdown') {
        // Countdown finished, start first drill
        setPhase('drill');
        const newEndTime = Date.now() + (currentDrill.duration * 1000);
        setEndTime(newEndTime);
      } else if (phase === 'drill') {
        // Drill finished, move to next or complete
        if (currentDrillIndex < drills.length - 1) {
          const nextIndex = currentDrillIndex + 1;
          setCurrentDrillIndex(nextIndex);
          const newEndTime = Date.now() + (drills[nextIndex].duration * 1000);
          setEndTime(newEndTime);
        } else {
          setPhase('complete');
          setEndTime(null);
        }
      }
    }
  };

  // Timer effect - updates every 100ms for smooth display
  useEffect(() => {
    if (phase === 'ready' || phase === 'complete' || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Update immediately
    updateTimeRemaining();

    // Then update every 100ms
    intervalRef.current = setInterval(() => {
      updateTimeRemaining();
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, endTime, isPaused, currentDrillIndex]);

  // Handle visibility change (app goes to background/foreground)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('App went to background, timer continues...');
      } else {
        console.log('App returned to foreground, recalculating time...');
        // When coming back, immediately recalculate based on endTime
        if (endTime && !isPaused) {
          updateTimeRemaining();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [endTime, isPaused]);

  const handleStart = () => {
    setPhase('countdown');
    const newEndTime = Date.now() + 5000; // 5 seconds from now
    setEndTime(newEndTime);
    setTimeRemaining(5);
  };

  const handlePause = () => {
    if (isPaused) {
      // Resume - set new end time based on remaining time
      const newEndTime = Date.now() + (pausedTimeRemaining! * 1000);
      setEndTime(newEndTime);
      setIsPaused(false);
      setPausedTimeRemaining(null);
    } else {
      // Pause - store current remaining time
      setPausedTimeRemaining(timeRemaining);
      setIsPaused(true);
    }
  };

  const handleSkip = () => {
    playBeep();
    if (currentDrillIndex < drills.length - 1) {
      const nextIndex = currentDrillIndex + 1;
      setCurrentDrillIndex(nextIndex);
      const newEndTime = Date.now() + (drills[nextIndex].duration * 1000);
      setEndTime(newEndTime);
      setPhase('drill');
      setIsPaused(false);
    } else {
      setPhase('complete');
      setEndTime(null);
    }
  };

  const handleExit = () => {
    if (confirm('Are you sure you want to exit the auto-timer?')) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      onExit();
    }
  };

  const handleComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onComplete();
  };

  // Ready screen
  if (phase === 'ready') {
    return (
      <Card className="border-2 border-blue-500 dark:border-white">
        <CardHeader>
          <CardTitle>Auto Drill Timer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">⏱️</div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Ready to start {drills.length} dribbling drills?
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              • 5 second countdown before first drill<br />
              • {currentDrill?.duration}s per drill<br />
              • Automatic progression<br />
              • Continues even when app is closed<br />
              • Sound alerts between drills
            </p>
          </div>

          <div className="space-y-3">
            {drills.map((drill, index) => (
              <div
                key={drill.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-900 dark:text-white">{drill.name}</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{drill.duration}s</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExit} className="flex-1">
              Exit
            </Button>
            <Button onClick={handleStart} className="flex-1">
              Start Timer
            </Button>
          </div>
        </CardContent>

        {/* Hidden audio element for beep */}
        <audio ref={audioRef}>
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZQQ0RXK/n77BdGAo9mN3yvnMkBi6B0PLaizsIGGS57OihUBELTaXh8bllHQU2jdXyzn0pBSt+zfDajj0JF2K37OqmVBMKSpzd8r9zJQUvgdDy2Ys6CBdkuuzopVIRC0uj4PG8bSAFMorU8tGALgYldc/w3I8+CRZftu3qp1YUCkaZ2/K9cigFLIHO8tiIOggZaLvt559NFAE=" type="audio/wav" />
        </audio>
      </Card>
    );
  }

  // Complete screen
  if (phase === 'complete') {
    return (
      <Card className="border-2 border-green-500 dark:border-green-400">
        <CardHeader>
          <CardTitle>All Drills Complete! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Great job! You completed all {drills.length} dribbling drills.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExit} className="flex-1">
              Exit Timer
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Continue Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active timer screen
  return (
    <Card className="border-2 border-blue-500 dark:border-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {phase === 'countdown' ? 'Get Ready!' : `Drill ${currentDrillIndex + 1} of ${drills.length}`}
          </CardTitle>
          <Button variant="secondary" size="sm" onClick={handleExit}>
            Exit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-zinc-800 rounded-full h-2">
            <div
              className="bg-blue-500 dark:bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer display */}
        <div className="text-center space-y-4">
          {phase === 'countdown' ? (
            <>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                Starting in...
              </p>
              <div className="text-9xl font-bold text-blue-600 dark:text-white animate-pulse">
                {timeRemaining}
              </div>
            </>
          ) : (
            <>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {currentDrill.name}
              </div>
              <div className="text-9xl font-bold text-blue-600 dark:text-white">
                {timeRemaining}
              </div>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                seconds remaining
              </p>
            </>
          )}
        </div>

        {/* Controls */}
        {phase === 'drill' && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handlePause} className="flex-1">
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="secondary" onClick={handleSkip} className="flex-1">
              Skip →
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
