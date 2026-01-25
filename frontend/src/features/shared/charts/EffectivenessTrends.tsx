// Strike Effectiveness Trends Chart
// Bar chart showing effectiveness trends over time

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

interface EffectivenessData {
  period: string;
  effective: number;
  partial: number;
  ineffective: number;
}

interface EffectivenessTrendsProps {
  data: EffectivenessData[];
  className?: string;
}

const EFFECTIVENESS_COLORS = {
  effective: '#10b981', // green
  partial: '#f59e0b', // amber
  ineffective: '#ef4444', // red
};

export function EffectivenessTrends({
  data,
  className = '',
}: EffectivenessTrendsProps) {
  const totalEffective = useMemo(
    () => data.reduce((sum, item) => sum + item.effective, 0),
    [data]
  );
  const totalPartial = useMemo(
    () => data.reduce((sum, item) => sum + item.partial, 0),
    [data]
  );
  const totalIneffective = useMemo(
    () => data.reduce((sum, item) => sum + item.ineffective, 0),
    [data]
  );
  const total = totalEffective + totalPartial + totalIneffective;
  const effectivenessRate =
    total > 0 ? ((totalEffective / total) * 100).toFixed(1) : '0';

  return (
    <div className={cn('bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6', className)}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-black uppercase tracking-tight text-white">
            Strike Effectiveness Trends
          </h3>
          <div className="text-right">
            <div className="text-xs text-slate-400">Effectiveness Rate</div>
            <div className="text-lg font-black text-green-400">{effectivenessRate}%</div>
          </div>
        </div>
        <p className="text-xs text-slate-400">Effectiveness by time period</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="period"
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
          <Bar dataKey="effective" stackId="a" fill={EFFECTIVENESS_COLORS.effective} name="Effective" />
          <Bar dataKey="partial" stackId="a" fill={EFFECTIVENESS_COLORS.partial} name="Partial" />
          <Bar
            dataKey="ineffective"
            stackId="a"
            fill={EFFECTIVENESS_COLORS.ineffective}
            name="Ineffective"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EFFECTIVENESS_COLORS.effective }}
          />
          <span className="text-slate-400">Effective: {totalEffective}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EFFECTIVENESS_COLORS.partial }}
          />
          <span className="text-slate-400">Partial: {totalPartial}</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: EFFECTIVENESS_COLORS.ineffective }}
          />
          <span className="text-slate-400">Ineffective: {totalIneffective}</span>
        </div>
      </div>
    </div>
  );
}
