// Targeting Dashboard Summary Component
// Phase 1: Dashboard-first architecture - Summary view with progressive disclosure

import { useState, useEffect } from 'react';
import {
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Crosshair,
  TrendingUp,
  Activity,
  ChevronRight,
  Shield,
  Brain,
  Zap,
  BarChart3,
  Users,
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { MetricCard } from './MetricCard';
import { CollapsibleSection } from './CollapsibleSection';
import { RecentlyViewed } from './RecentlyViewed';
import { BdaApi } from '@/lib/smartops/api/bda';
import { targetingApi } from '@/lib/smartops/api/targeting.api';
import { useCachedQuery } from '@/lib/smartops/hooks/useCachedQuery';

export function TargetingDashboardSummary() {
  const navigate = useNavigate();

  const { data: dashboardData, isLoading } = useCachedQuery({
    queryKey: ['targeting-summary-data'],
    queryFn: async () => {
      const [
        targets,
        summary,
        highPriorityTargets,
        bdaReports,
        decisions
      ] = await Promise.all([
        targetingApi.getTargets({ limit: 100 }).catch(() => []),
        targetingApi.getSummary().catch(() => ({ total_targets: 0, active_targets: 0, pending_nominations: 0, approved_targets: 0 })),
        targetingApi.getHighRiskTargets().catch(() => []),
        BdaApi.getReports({ limit: 20 }).catch(() => []),
        targetingApi.listDecisions().catch(() => []),
      ]);

      // Calculate F3EAD counts
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
        } else {
          f3eadCounts.FIND++;
        }
      });

      // Get top priority targets from DTL
      const topPriorityTargets = await Promise.all(
        dtlEntries
          .sort((a, b) => (b.combined_score || 0) - (a.combined_score || 0))
          .slice(0, 5)
          .map(async (entry) => {
            try {
              const target = await targetingApi.getTarget(entry.target_id);
              return {
                id: entry.target_id,
                name: target.name,
                priority: target.priority,
                status: target.target_status,
              };
            } catch {
              return {
                id: entry.target_id,
                name: `Target ${entry.target_id.substring(0, 8)}`,
                priority: 'MEDIUM',
                status: 'NOMINATED',
              };
            }
          })
      );

      // Count TST alerts (critical only - < 60 minutes)
      const criticalTsts = tsts.filter((tst: any) => {
        if (!tst.is_tst || !tst.tst_deadline) return false;
        const deadline = new Date(tst.tst_deadline);
        const now = new Date();
        const minutesRemaining = Math.floor((deadline.getTime() - now.getTime()) / 60000);
        return minutesRemaining < 60 && minutesRemaining >= 0;
      });

      // Count pending approvals (targets in DTL with pending status)
      const pendingApprovals = dtlEntries.filter(
        (entry: any) => entry.approval_level && entry.approval_level > 0
      ).length;

      return {
        activeTargets: summary?.active_targets || targets.length,
        pendingApprovals,
        tstAlerts: criticalTsts.length,
        f3eadCounts,
        topPriorityTargets,
        missionPhase: intent?.phase || 'Unknown',
        isrPlatformsActive: (isrPlatforms as any[]).filter((p: any) => p.status === 'ACTIVE').length,
        strikePlatformsReady: (strikePlatforms as any[]).filter((p: any) => p.platform_status === 'READY').length,
        highRiskTargets: highRiskTargets.length,
        recentBdaCount: bdaAssessments.length,
        pendingDecisions: (decisions as any[]).filter((d: any) => !d.decision || d.decision === 'PENDING').length,
      };
    },
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-slate-400 text-sm">Failed to load dashboard metrics</div>;
  }

  const totalF3ead = Object.values(metrics.f3eadCounts).reduce((a, b) => a + b, 0);

  // Get visible widgets from layout
  const visibleWidgets = layoutLoaded ? getVisibleWidgets() : null;
  const showWidget = (widgetId: string) => {
    if (!layoutLoaded) return true; // Show all by default if layout not loaded
    return visibleWidgets?.some((w) => w.id === widgetId && w.visible) ?? true;
  };

  return (
    <div className="space-y-6">
      {/* Critical Metrics Row */}
      {showWidget('critical-metrics') && (
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            icon={Target}
            label="Active Targets"
            value={metrics.activeTargets}
            color="blue"
            href="/smartops/targeting/targets"
          />
          <MetricCard
            icon={CheckCircle2}
            label="Pending Approvals"
            value={metrics.pendingApprovals}
            change={metrics.pendingApprovals > 0 ? `${metrics.pendingApprovals} items` : 'None'}
            changeType={metrics.pendingApprovals > 0 ? 'negative' : 'positive'}
            color="amber"
            href="/smartops/targeting/targets"
          />
          <MetricCard
            icon={Clock}
            label="TST Alerts"
            value={metrics.tstAlerts}
            change={metrics.tstAlerts > 0 ? 'Critical' : 'None'}
            changeType={metrics.tstAlerts > 0 ? 'negative' : 'positive'}
            color={metrics.tstAlerts > 0 ? 'red' : 'green'}
            alert={metrics.tstAlerts > 0}
            href="/smartops/targeting/targets"
          />
        </div>
      )}

      {/* F3EAD Pipeline Summary */}
      {showWidget('f3ead-pipeline') && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-green-950/30 border border-green-800 rounded-lg">
                <Target className="text-green-400" size={18} />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  F3EAD Pipeline
                </h2>
                <p className="text-xs text-slate-400">Total: {totalF3ead} targets</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate({ to: '/smartops/targeting/analytics' })}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase"
                aria-label="View analytics"
              >
                Analytics →
              </button>
              <button
                onClick={() => navigate({ to: '/smartops/targeting/targets' })}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase"
              >
                View Full Pipeline →
              </button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3">
            {Object.entries(metrics.f3eadCounts).map(([stage, count]) => {
              const icons = {
                FIND: Search,
                FIX: Crosshair,
                FINISH: Target,
                EXPLOIT: TrendingUp,
                ANALYZE: Activity,
                DISSEMINATE: ChevronRight,
              };
              const Icon = icons[stage as keyof typeof icons];
              const percentage = totalF3ead > 0 ? (count / totalF3ead) * 100 : 0;

              return (
                <button
                  key={stage}
                  onClick={() => navigate({ to: '/smartops/targeting/targets' })}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-2 sm:p-4 hover:border-slate-600 active:bg-slate-700 transition-colors text-center w-full touch-manipulation"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-2xl font-black text-white mb-0.5 sm:mb-1">{count}</div>
                  <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase">{stage}</div>
                  <div className="mt-1 sm:mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Priority Targets */}
      {showWidget('top-priority-targets') && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Top Priority Targets
            </h2>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/targets' })}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 active:text-blue-200 uppercase touch-manipulation"
            >
              View All →
            </button>
          </div>
          <div className="space-y-2">
            {metrics.topPriorityTargets.map((target) => (
              <button
                key={target.id}
                onClick={() => navigate({ to: `/smartops/targeting/${target.id}` })}
                className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-2 sm:p-3 hover:border-slate-600 active:bg-slate-700 transition-colors touch-manipulation"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{target.name}</div>
                    <div className="text-xs text-slate-400">{target.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded border font-bold uppercase ${target.priority === 'CRITICAL' ? 'bg-red-950/50 text-red-400 border-red-900' :
                      target.priority === 'HIGH' ? 'bg-orange-950/50 text-orange-400 border-orange-900' :
                        'bg-amber-950/50 text-amber-400 border-amber-900'
                      }`}>
                      {target.priority}
                    </span>
                    <span className="text-xs text-slate-500">{target.status}                  </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {showWidget('recently-viewed') && <RecentlyViewed />}

      {/* Mission Context (Collapsible) */}
      {showWidget('mission-context') && (
        <CollapsibleSection
          title="Mission Context"
          defaultExpanded={isLoaded ? !preferences.collapsedSections.missionContext : false}
          icon={<Shield className="w-4 h-4" />}
          onToggle={(expanded) => setCollapsedSection('missionContext', !expanded)}
        >
          <div className="space-y-3">
            <div>
              <div className="text-xs text-slate-500 uppercase mb-1">Current Phase</div>
              <div className="text-sm font-bold text-blue-400">{metrics.missionPhase}</div>
            </div>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/mission-command' })}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 uppercase"
            >
              View Full Mission Command →
            </button>
          </div>
        </CollapsibleSection>
      )}

      {/* Quick Access Panels (Collapsible) */}
      {showWidget('quick-access') && (
        <CollapsibleSection
          title="Quick Access"
          defaultExpanded={isLoaded ? !preferences.collapsedSections.quickAccess : false}
          icon={<Zap className="w-4 h-4" />}
          onToggle={(expanded) => setCollapsedSection('quickAccess', !expanded)}
        >
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={() => navigate({ to: '/smartops/targeting/intelligence' })}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors text-center w-full"
            >
              <Brain className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-lg font-black text-white mb-1">{metrics.isrPlatformsActive}</div>
              <div className="text-xs text-slate-400 uppercase">ISR Platforms</div>
            </button>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/assets' })}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors text-center w-full"
            >
              <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <div className="text-lg font-black text-white mb-1">{metrics.strikePlatformsReady}</div>
              <div className="text-xs text-slate-400 uppercase">Strike Platforms</div>
            </button>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/risk' })}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 sm:p-4 hover:border-slate-600 active:bg-slate-700 transition-colors text-center w-full touch-manipulation"
            >
              <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <div className="text-lg font-black text-white mb-1">{metrics.highRiskTargets}</div>
              <div className="text-xs text-slate-400 uppercase">High Risk</div>
            </button>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/effects' })}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors text-center w-full"
            >
              <BarChart3 className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <div className="text-lg font-black text-white mb-1">{metrics.recentBdaCount}</div>
              <div className="text-xs text-slate-400 uppercase">BDA Reports</div>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate({ to: '/smartops/targeting/analysis' })}
              className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <div className="text-sm font-bold text-white">Alternative Analysis</div>
              </div>
              <div className="text-xs text-slate-400">Assumptions & Bias Alerts</div>
            </button>
            <button
              onClick={() => navigate({ to: '/smartops/targeting/collaboration' })}
              className="w-full text-left bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-400" />
                <div className="text-sm font-bold text-white">Collaboration</div>
              </div>
              <div className="text-xs text-slate-400">
                {metrics.pendingDecisions} pending decisions
              </div>
            </button>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
