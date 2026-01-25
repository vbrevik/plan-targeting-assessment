// Targets Detail Page
// Full view of F3EAD Pipeline, DTL, and TST

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { TargetNominationBoard } from '@/features/targeting/TargetNominationBoard';
import { targetingApi } from '@/lib/smartops/api/targeting.api';
import { SecurityBadge, SecurityBanner } from '@/components/SecurityBadge';
import { TargetingBreadcrumbs } from '@/components/layout/TargetingBreadcrumbs';
import { FilterPanel, type FilterConfig, type FilterState } from '@/features/shared/FilterPanel';
import { useFilterPresets } from '@/features/shared/hooks/useFilterPresets';
import { ExportButton } from '@/features/shared/ExportButton';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/smartops/targeting/targets')({
  component: TargetsDetailPage,
});

// Dynamic Schema State
function TargetsDetailPage() {
  const [filters, setFilters] = useState<FilterState>({});
  const { presets, savePreset } = useFilterPresets('targets');
  const [targetStatuses, setTargetStatuses] = useState<string[]>(['NOMINATED', 'VALIDATED', 'APPROVED', 'ENGAGED', 'ASSESSED']);

  useEffect(() => {
    targetingApi.getOntologySchema().then(schema => {
      // Map backend values to filter format (keeping uppercase value convention if needed)
      setTargetStatuses(schema.target_statuses.map(s => s.toUpperCase()));
    }).catch(err => console.error("Failed to fetch ontology filters", err));
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: targetStatuses.map(status => ({
        id: status.toLowerCase(),
        label: status.charAt(0) + status.slice(1).toLowerCase(), // Title Case
        value: status
      })),
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'multiselect',
      options: [
        { id: 'critical', label: 'Critical', value: 'CRITICAL' },
        { id: 'high', label: 'High', value: 'HIGH' },
        { id: 'medium', label: 'Medium', value: 'MEDIUM' },
        { id: 'low', label: 'Low', value: 'LOW' },
      ],
    },
    {
      id: 'f3ead_stage',
      label: 'F3EAD Stage',
      type: 'multiselect',
      options: [
        { id: 'find', label: 'Find', value: 'FIND' },
        { id: 'fix', label: 'Fix', value: 'FIX' },
        { id: 'finish', label: 'Finish', value: 'FINISH' },
        { id: 'exploit', label: 'Exploit', value: 'EXPLOIT' },
        { id: 'analyze', label: 'Analyze', value: 'ANALYZE' },
        { id: 'disseminate', label: 'Disseminate', value: 'DISSEMINATE' },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-950">
      <SecurityBanner level="SECRET" caveats={['NOFORN']} position="top" />

      <TargetingBreadcrumbs />

      <div className="max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <Link
              to="/smartops/targeting-cell-dashboard"
              className="p-2 hover:bg-slate-800 active:bg-slate-700 rounded-lg transition-colors touch-manipulation flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Target Management
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                F3EAD Pipeline • Dynamic Target List • Time-Sensitive Targets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm font-bold text-white hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation no-print"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <ExportButton
              filename="targets"
              classification="SECRET"
              caveats={['NOFORN']}
              formats={['csv', 'json']}
              variant="button"
              className="no-print"
            />
            <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          configs={filterConfigs}
          filters={filters}
          onFiltersChange={setFilters}
          onSavePreset={(name, filters) => savePreset(name, filters)}
          savedPresets={presets}
        />

        {/* Full Component View */}
        <TargetNominationBoard filters={filters} />
      </div>

      <SecurityBanner level="SECRET" caveats={['NOFORN']} position="bottom" />
    </div>
  );
}
