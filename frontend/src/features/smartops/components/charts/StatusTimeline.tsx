// Target Status Timeline Chart
// Shows target status changes over time

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';

interface StatusTimelineData {
  date: string;
  [status: string]: string | number;
}

interface StatusTimelineProps {
  data: StatusTimelineData[];
  className?: string;
}

const STATUS_COLORS: Record<string, string> = {
  NOMINATED: '#3b82f6', // blue
  VALIDATED: '#8b5cf6', // purple
  APPROVED: '#10b981', // green
  ENGAGED: '#ef4444', // red
  ASSESSED: '#f59e0b', // amber
  ARCHIVED: '#64748b', // slate
};

export function StatusTimeline({ data, className = '' }: StatusTimelineProps) {
  // Extract status keys from data (excluding 'date')
  const statusKeys = useMemo(() => {
    if (data.length === 0) return [];
    const keys = Object.keys(data[0]).filter((key) => key !== 'date');
    return keys;
  }, [data]);

  return (
    <div className={cn('bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">
          Target Status Over Time
        </h3>
        <p className="text-xs text-slate-400">Status distribution by date</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Legend
            wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }}
            iconType="line"
          />
          {statusKeys.map((status) => (
            <Line
              key={status}
              type="monotone"
              dataKey={status}
              stroke={STATUS_COLORS[status] || '#64748b'}
              strokeWidth={2}
              dot={{ r: 4 }}
              name={status}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
