'use client';

interface MacroProgressBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: 'red' | 'blue' | 'yellow' | 'purple';
}

export function MacroProgressBar({ label, current, target, unit, color }: MacroProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const isWithinRange = percentage >= 95 && percentage <= 105;
  const isClose = percentage >= 85 && percentage <= 115;

  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  const bgColorClasses = {
    red: 'bg-red-100 dark:bg-red-900/20',
    blue: 'bg-blue-100 dark:bg-blue-900/20',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20',
    purple: 'bg-purple-100 dark:bg-purple-900/20',
  };

  const getStatusColor = () => {
    if (isWithinRange) return 'text-green-600 dark:text-green-400';
    if (isClose) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const difference = current - target;
  const differenceText = difference > 0 ? `+${difference}` : difference;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {current} / {target} {unit}
          </span>
          {difference !== 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({differenceText} {unit})
            </span>
          )}
        </div>
      </div>

      <div className={`w-full h-3 rounded-full overflow-hidden ${bgColorClasses[color]}`}>
        <div
          className={`h-full ${colorClasses[color]} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{Math.round(percentage)}% of target</span>
        {isWithinRange && <span className="text-green-600 dark:text-green-400">✓ On target</span>}
        {!isWithinRange && isClose && (
          <span className="text-yellow-600 dark:text-yellow-400">Close</span>
        )}
        {!isWithinRange && !isClose && (
          <span className="text-red-600 dark:text-red-400">
            {percentage < 85 ? 'Under target' : 'Over target'}
          </span>
        )}
      </div>
    </div>
  );
}
