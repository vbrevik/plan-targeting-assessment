// F3EAD Pipeline Flow Chart
// Visualizes target flow through F3EAD stages

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface PipelineData {
  stage: string;
  count: number;
  code: 'FIND' | 'FIX' | 'FINISH' | 'EXPLOIT' | 'ANALYZE' | 'DISSEMINATE';
}

interface PipelineChartProps {
  data: {
    FIND: number;
    FIX: number;
    FINISH: number;
    EXPLOIT: number;
    ANALYZE: number;
    DISSEMINATE: number;
  };
  className?: string;
}

const STAGE_COLORS: Record<string, string> = {
  FIND: '#3b82f6', // blue
  FIX: '#8b5cf6', // purple
  FINISH: '#ef4444', // red
  EXPLOIT: '#f59e0b', // amber
  ANALYZE: '#10b981', // green
  DISSEMINATE: '#06b6d4', // cyan
};

export function PipelineChart({ data, className = '' }: PipelineChartProps) {
  const chartData: PipelineData[] = useMemo(
    () => [
      { stage: 'Find', count: data.FIND, code: 'FIND' },
      { stage: 'Fix', count: data.FIX, code: 'FIX' },
      { stage: 'Finish', count: data.FINISH, code: 'FINISH' },
      { stage: 'Exploit', count: data.EXPLOIT, code: 'EXPLOIT' },
      { stage: 'Analyze', count: data.ANALYZE, code: 'ANALYZE' },
      { stage: 'Disseminate', count: data.DISSEMINATE, code: 'DISSEMINATE' },
    ],
    [data]
  );

  const total = useMemo(
    () => Object.values(data).reduce((a, b) => a + b, 0),
    [data]
  );

  return (
    <div className={cn('bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6', className)}>
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">
          F3EAD Pipeline Flow
        </h3>
        <p className="text-xs text-slate-400">Total targets: {total}</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="stage"
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
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STAGE_COLORS[entry.code]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {chartData.map((entry) => (
          <div key={entry.code} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: STAGE_COLORS[entry.code] }}
            />
            <span className="text-xs text-slate-400">
              {entry.stage}: {entry.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
