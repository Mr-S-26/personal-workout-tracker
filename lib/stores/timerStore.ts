import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  // State
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  startTime: number | null; // timestamp when timer started
  lastTickTime: number | null; // for accurate timing
  targetExerciseId: number | null; // which exercise is resting
  targetSetId: number | null; // which set just completed

  // Actions
  start: (duration: number, exerciseId?: number, setId?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  addTime: (seconds: number) => void;
  tick: () => void;
  setDuration: (duration: number) => void;
}

// Sound and notification functions
function playCompletionSound() {
  try {
    const audio = new Audio('/sounds/timer-done.mp3');
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.log('Could not play sound:', error);
    });
  } catch (error) {
    console.log('Sound not available:', error);
  }
}

function showNotification() {
  if (typeof window === 'undefined') return;

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification('Rest Complete! 💪', {
        body: 'Time for your next set',
        icon: '/icon.png',
        badge: '/icon.png',
        tag: 'rest-timer',
        requireInteraction: false,
      });
    } catch (error) {
      console.log('Could not show notification:', error);
    }
  }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      isPaused: false,
      timeRemaining: 0,
      totalDuration: 0,
      startTime: null,
      lastTickTime: null,
      targetExerciseId: null,
      targetSetId: null,

      // Start timer with duration in seconds
      start: (duration, exerciseId, setId) => {
        const now = Date.now();
        set({
          isActive: true,
          isPaused: false,
          timeRemaining: duration,
          totalDuration: duration,
          startTime: now,
          lastTickTime: now,
          targetExerciseId: exerciseId || null,
          targetSetId: setId || null,
        });
      },

      // Pause timer
      pause: () => {
        set({ isPaused: true });
      },

      // Resume timer
      resume: () => {
        set((state) => ({
          isPaused: false,
          lastTickTime: Date.now(),
        }));
      },

      // Stop timer and reset
      stop: () => {
        set({
          isActive: false,
          isPaused: false,
          timeRemaining: 0,
          totalDuration: 0,
          startTime: null,
          lastTickTime: null,
          targetExerciseId: null,
          targetSetId: null,
        });
      },

      // Reset timer to initial duration
      reset: () => {
        const { totalDuration } = get();
        const now = Date.now();
        set({
          timeRemaining: totalDuration,
          startTime: now,
          lastTickTime: now,
          isPaused: false,
        });
      },

      // Add extra time (e.g., +30 seconds)
      addTime: (seconds) => {
        set((state) => ({
          timeRemaining: Math.max(0, state.timeRemaining + seconds),
          totalDuration: state.totalDuration + seconds,
        }));
      },

      // Set new duration while timer is not active
      setDuration: (duration) => {
        set({ totalDuration: duration, timeRemaining: duration });
      },

      // Tick function called every second
      tick: () => {
        const { isPaused, timeRemaining, isActive } = get();

        if (!isActive || isPaused) return;

        const newTime = Math.max(0, timeRemaining - 1);

        set({
          timeRemaining: newTime,
          lastTickTime: Date.now(),
        });

        // Timer complete
        if (newTime === 0) {
          playCompletionSound();
          showNotification();

          // Optional: Auto-stop or keep showing 0:00
          // For now, stop the timer
          setTimeout(() => {
            get().stop();
          }, 100);
        }
      },
    }),
    {
      name: 'rest-timer-storage',
      // Only persist certain fields
      partialize: (state) => ({
        isActive: state.isActive,
        isPaused: state.isPaused,
        timeRemaining: state.timeRemaining,
        totalDuration: state.totalDuration,
        startTime: state.startTime,
        lastTickTime: state.lastTickTime,
        targetExerciseId: state.targetExerciseId,
        targetSetId: state.targetSetId,
      }),
    }
  )
);

// Custom hook that handles the interval
export function useTimer() {
  const store = useTimerStore();

  // Setup interval for ticking
  if (typeof window !== 'undefined') {
    React.useEffect(() => {
      if (!store.isActive || store.isPaused) return;

      const interval = setInterval(() => {
        store.tick();
      }, 1000);

      return () => clearInterval(interval);
    }, [store.isActive, store.isPaused]);
  }

  return store;
}

// Re-export for convenience
import React from 'react';
