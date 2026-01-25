// BDA Assessment Distribution Chart
// Pie chart showing distribution of assessment outcomes

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

interface AssessmentData {
  outcome: string;
  count: number;
  percentage: number;
}

interface AssessmentDistributionProps {
  data: AssessmentData[];
  className?: string;
}

const OUTCOME_COLORS: Record<string, string> = {
  EFFECTIVE: '#10b981', // green
  PARTIAL: '#f59e0b', // amber
  INEFFECTIVE: '#ef4444', // red
  PENDING: '#64748b', // slate
  UNKNOWN: '#8b5cf6', // purple
};

export function AssessmentDistribution({
  data,
  className = '',
}: AssessmentDistributionProps) {
  const chartData = useMemo(
    () =>
      data.map((item) => ({
        name: item.outcome,
        value: item.count,
        percentage: item.percentage,
      })),
    [data]
  );

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data]
  );

  return (
    <div className={cn('bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">
          BDA Assessment Distribution
        </h3>
        <p className="text-xs text-slate-400">Total assessments: {total}</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={OUTCOME_COLORS[entry.name] || '#64748b'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#cbd5e1' }}
            formatter={(value: number) => [`${value} assessments`, 'Count']}
          />
          <Legend
            wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {data.map((item) => (
          <div
            key={item.outcome}
            className="bg-slate-800/50 border border-slate-700 rounded p-2 text-center"
          >
            <div
              className="w-3 h-3 rounded mx-auto mb-1"
              style={{ backgroundColor: OUTCOME_COLORS[item.outcome] || '#64748b' }}
            />
            <div className="text-xs font-bold text-white">{item.outcome}</div>
            <div className="text-xs text-slate-400">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
