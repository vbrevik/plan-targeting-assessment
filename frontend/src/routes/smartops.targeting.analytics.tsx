// Analytics Dashboard Route
// Dedicated analytics page with charts and metrics

import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsDashboard } from '@/features/shared/AnalyticsDashboard';
import { SecurityBanner } from '@/components/SecurityBadge';
import { TargetingBreadcrumbs } from '@/components/layout/TargetingBreadcrumbs';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/smartops/targeting/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="h-full overflow-y-auto bg-slate-950" id="main-content">
      <SecurityBanner level="SECRET" caveats={['NOFORN']} position="top" />
      
      <TargetingBreadcrumbs />
      
      <div className="max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Link
              to="/smartops/targeting-cell-dashboard"
              className="p-2 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors touch-manipulation flex-shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Analytics Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Performance metrics, trends, and historical analysis
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard Component */}
        <AnalyticsDashboard />
      </div>
      
      <SecurityBanner level="SECRET" caveats={['NOFORN']} position="bottom" />
    </div>
  );
}
