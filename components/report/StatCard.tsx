interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  icon?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ label, value, change, icon, subtitle, trend }: StatCardProps) {
  const getTrendColor = () => {
    if (change === undefined || change === 0) return 'text-gray-500 dark:text-gray-400';
    if (trend === 'up' || (trend === undefined && change > 0)) {
      return 'text-green-600 dark:text-green-400';
    }
    if (trend === 'down' || (trend === undefined && change < 0)) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-500 dark:text-gray-400';
  };

  const getTrendIcon = () => {
    if (change === undefined || change === 0) return '';
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
          {change !== undefined && change !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()} {Math.abs(change)} vs last period
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-3xl opacity-50">{icon}</div>
        )}
      </div>
    </div>
  );
}
