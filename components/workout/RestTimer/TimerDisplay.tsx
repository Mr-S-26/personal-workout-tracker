'use client';

interface TimerDisplayProps {
  timeRemaining: number; // seconds
  totalDuration: number; // seconds
  isActive: boolean;
}

export function TimerDisplay({ timeRemaining, totalDuration, isActive }: TimerDisplayProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const progress = totalDuration > 0 ? (timeRemaining / totalDuration) * 100 : 0;

  // Calculate circle progress
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Animation and color based on state
  const isComplete = isActive && timeRemaining === 0;
  const isLowTime = isActive && timeRemaining <= 10 && timeRemaining > 0;

  return (
    <div className="relative flex items-center justify-center">
      {/* SVG Circle Progress */}
      <svg
        className="transform -rotate-90"
        width="200"
        height="200"
      >
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-linear ${
            isComplete
              ? 'text-green-500 animate-pulse'
              : isLowTime
              ? 'text-red-500 animate-pulse'
              : 'text-blue-600'
          }`}
          strokeLinecap="round"
        />
      </svg>

      {/* Time display in center */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center ${
          isComplete ? 'animate-bounce' : ''
        }`}
      >
        <div className="text-5xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
        {isActive && !isComplete && (
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalDuration > 0 && `${Math.round(progress)}%`}
          </div>
        )}
        {isComplete && (
          <div className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
            Time's Up!
          </div>
        )}
      </div>
    </div>
  );
}
