// Analytics Dashboard Component
// Comprehensive analytics view with charts and metrics

import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, Target, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PipelineChart } from './charts/PipelineChart';
import { StatusTimeline } from './charts/StatusTimeline';
import { AssessmentDistribution } from './charts/AssessmentDistribution';
import { EffectivenessTrends } from './charts/EffectivenessTrends';
import { HistoricalView } from './HistoricalView';
import { ExportButton } from './ExportButton';
import { targetingApi } from '@/lib/smartops/api/targeting.api';
import { useCachedQuery } from '@/lib/smartops/hooks/useCachedQuery';
import { LoadingSkeleton, MetricCardSkeleton } from './LoadingSkeleton';
import { MetricCard } from './MetricCard';

interface AnalyticsMetrics {
  avgProcessingTime: number; // hours
  strikeSuccessRate: number; // percentage
  bdaCompletionTime: number; // hours
  targetsProcessed: number;
  decisionsMade: number;
  avgDecisionTime: number; // hours
}

export function AnalyticsDashboard() {
  const [viewMode, setViewMode] = useState<'current' | 'historical'>('current');

  // Fetch analytics metrics
  const { data: metrics, isLoading: metricsLoading } = useCachedQuery<AnalyticsMetrics>({
    queryKey: 'analytics-metrics',
    queryFn: async () => {
      const [targets, decisions, bdaReports] = await Promise.all([
        targetingApi.getTargets({ limit: 1000 }).catch(() => []),
        targetingApi.listDecisions().catch(() => []),
        targetingApi.getReattackRecommendations().catch(() => []),
      ]);

      // Calculate average processing time (simplified)
      const targetsArray = targets as any[];
      const avgProcessingTime = targetsArray.length > 0 ? 24 : 0; // Placeholder

      // Calculate strike success rate (simplified)
      const strikeSuccessRate = 85; // Placeholder

      // Calculate BDA completion time (simplified)
      const bdaCompletionTime = 4; // Placeholder

      return {
        avgProcessingTime,
        strikeSuccessRate,
        bdaCompletionTime,
        targetsProcessed: targetsArray.length,
        decisionsMade: (decisions as any[]).length,
        avgDecisionTime: 2, // Placeholder
      };
    },
    staleTime: 60000, // 1 minute
  });

  // Fetch F3EAD counts for pipeline chart
  const { data: f3eadData, isLoading: f3eadLoading } = useCachedQuery({
    queryKey: 'analytics-f3ead',
    queryFn: async () => {
      const targets = await targetingApi.getTargets({ limit: 1000 }).catch(() => []);
      const f3eadCounts = {
        FIND: 0,
        FIX: 0,
        FINISH: 0,
        EXPLOIT: 0,
        ANALYZE: 0,
        DISSEMINATE: 0,
      };

      (targets as any[]).forEach((target: any) => {
        const stage = (target.f3ead_stage || 'FIND').toUpperCase();
        if (f3eadCounts.hasOwnProperty(stage)) {
          f3eadCounts[stage as keyof typeof f3eadCounts]++;
        }
      });

      return f3eadCounts;
    },
    staleTime: 30000, // 30 seconds
  });

  if (metricsLoading || f3eadLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics || !f3eadData) {
    return <div className="text-slate-400 text-sm">Failed to load analytics data</div>;
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('current')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
              viewMode === 'current'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            aria-pressed={viewMode === 'current'}
          >
            Current Metrics
          </button>
          <button
            onClick={() => setViewMode('historical')}
            className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
              viewMode === 'historical'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            aria-pressed={viewMode === 'historical'}
          >
            Historical View
          </button>
        </div>
        <ExportButton
          filename="analytics-report"
          classification="SECRET"
          caveats={['NOFORN']}
          formats={['json']}
          variant="button"
        />
      </div>

      {viewMode === 'current' ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <MetricCard
              icon={Clock}
              label="Avg Processing Time"
              value={`${metrics.avgProcessingTime}h`}
              color="blue"
            />
            <MetricCard
              icon={Target}
              label="Strike Success Rate"
              value={`${metrics.strikeSuccessRate}%`}
              color="green"
            />
            <MetricCard
              icon={CheckCircle2}
              label="BDA Completion Time"
              value={`${metrics.bdaCompletionTime}h`}
              color="cyan"
            />
            <MetricCard
              icon={BarChart3}
              label="Targets Processed"
              value={metrics.targetsProcessed}
              color="purple"
            />
            <MetricCard
              icon={TrendingUp}
              label="Decisions Made"
              value={metrics.decisionsMade}
              color="amber"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Avg Decision Time"
              value={`${metrics.avgDecisionTime}h`}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PipelineChart data={f3eadData} />
            <StatusTimeline
              data={[
                { date: '2026-01-15', NOMINATED: 5, VALIDATED: 3, APPROVED: 2 },
                { date: '2026-01-16', NOMINATED: 7, VALIDATED: 4, APPROVED: 3 },
                { date: '2026-01-17', NOMINATED: 6, VALIDATED: 5, APPROVED: 4 },
                { date: '2026-01-18', NOMINATED: 8, VALIDATED: 6, APPROVED: 5 },
                { date: '2026-01-19', NOMINATED: 9, VALIDATED: 7, APPROVED: 6 },
              ]}
            />
            <AssessmentDistribution
              data={[
                { outcome: 'EFFECTIVE', count: 45, percentage: 60 },
                { outcome: 'PARTIAL', count: 20, percentage: 27 },
                { outcome: 'INEFFECTIVE', count: 10, percentage: 13 },
              ]}
            />
            <EffectivenessTrends
              data={[
                { period: 'Week 1', effective: 12, partial: 5, ineffective: 2 },
                { period: 'Week 2', effective: 15, partial: 4, ineffective: 3 },
                { period: 'Week 3', effective: 18, partial: 6, ineffective: 1 },
                { period: 'Week 4', effective: 14, partial: 5, ineffective: 4 },
              ]}
            />
          </div>
        </>
      ) : (
        <HistoricalView />
      )}
    </div>
  );
}
