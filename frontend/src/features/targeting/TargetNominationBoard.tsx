// NATO COPD Component 2: Target Nomination & Prioritization Board
// F3EAD cycle visualization, Dynamic Target List, TST countdown

import { useState, useEffect } from 'react';
import { 
  Search, 
  Crosshair, 
  Target, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Flame,
  Activity
} from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi, type DtlEntry } from '@/lib/smartops/api/targeting.api';
import { LoadingSkeleton, ListItemSkeleton } from '../shared/LoadingSkeleton';

interface F3EADStage {
  name: string;
  code: 'FIND' | 'FIX' | 'FINISH' | 'EXPLOIT' | 'ANALYZE' | 'DISSEMINATE';
  count: number;
  icon: React.ReactNode;
}

interface DynamicTargetListEntry {
  id: string;
  name: string;
  priorityScore: number;
  feasibilityScore: number;
  combinedScore: number;
  agingHours: number;
  status: string;
  classification: string;
}

interface TSTAlert {
  id: string;
  name: string;
  deadline: string;
  minutesRemaining: number;
  priority: 'CRITICAL' | 'HIGH';
}

interface TargetNominationBoardProps {
  filters?: {
    status?: string;
    priority?: string[];
    f3ead_stage?: string[];
  };
}

export function TargetNominationBoard({ filters }: TargetNominationBoardProps = {}) {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [dtlEntries, setDtlEntries] = useState<DynamicTargetListEntry[]>([]);
  const [tstAlerts, setTstAlerts] = useState<TSTAlert[]>([]);
  const [f3eadPipeline, setF3eadPipeline] = useState<F3EADStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Build query params from filters
        const queryParams: { status?: string; priority?: string; limit?: number } = {
          limit: 1000,
        };
        if (filters?.status) {
          queryParams.status = filters.status;
        }
        if (filters?.priority && filters.priority.length > 0) {
          // For now, use first priority (API supports single priority)
          queryParams.priority = filters.priority[0];
        }

        const [dtl, tsts, allTargets] = await Promise.all([
          targetingApi.getDtlEntries({ limit: 10 }).catch(() => []),
          targetingApi.getActiveTsts().catch(() => []),
          targetingApi.getTargets(queryParams).catch(() => []), // Fetch targets for F3EAD counts
        ]);

        // Transform DTL entries to match component interface - fetch target details
        const transformedDtl: DynamicTargetListEntry[] = await Promise.all(
          dtl.map(async (entry) => {
            try {
              const target = await targetingApi.getTarget(entry.target_id);
              return {
                id: entry.id,
                name: target.name,
                priorityScore: entry.priority_score,
                feasibilityScore: entry.feasibility_score,
                combinedScore: entry.combined_score || (entry.priority_score + entry.feasibility_score) / 2,
                agingHours: entry.aging_hours,
                status: target.target_status,
                classification: 'SECRET', // Classification not in Target model, default to SECRET
              };
            } catch {
              // Fallback if target fetch fails
              return {
                id: entry.id,
                name: `Target ${entry.target_id.substring(0, 8)}`,
                priorityScore: entry.priority_score,
                feasibilityScore: entry.feasibility_score,
                combinedScore: entry.combined_score || (entry.priority_score + entry.feasibility_score) / 2,
                agingHours: entry.aging_hours,
                status: 'NOMINATED',
                classification: 'SECRET',
              };
            }
          })
        );

        // Transform TST alerts - fetch target names
        const transformedTsts: TSTAlert[] = await Promise.all(
          tsts
            .filter((tst) => tst.is_tst && tst.tst_deadline)
            .map(async (tst) => {
              const deadline = new Date(tst.tst_deadline!);
              const now = new Date();
              const minutesRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 60000));
              
              // Fetch target name
              let targetName = `TST ${tst.target_id.substring(0, 8)}`;
              try {
                const target = await targetingApi.getTarget(tst.target_id);
                targetName = target.name;
              } catch {
                // Use fallback name
              }
              
              return {
                id: tst.id,
                name: targetName,
                deadline: tst.tst_deadline!,
                minutesRemaining,
                priority: minutesRemaining < 60 ? 'CRITICAL' : 'HIGH' as 'CRITICAL' | 'HIGH',
              };
            })
        );

        setDtlEntries(transformedDtl);
        setTstAlerts(transformedTsts);

        // Calculate F3EAD pipeline counts from actual targets
        const f3eadCounts: Record<string, number> = {
          FIND: 0,
          FIX: 0,
          FINISH: 0,
          EXPLOIT: 0,
          ANALYZE: 0,
          DISSEMINATE: 0,
        };
        
        // Apply client-side filters (F3EAD stage, priority multiselect)
        let filteredTargets = allTargets;
        
        // Apply F3EAD stage filter if specified
        if (filters?.f3ead_stage && filters.f3ead_stage.length > 0) {
          filteredTargets = filteredTargets.filter((t: any) => 
            filters.f3ead_stage!.includes((t.f3ead_stage || 'FIND').toUpperCase())
          );
        }
        
        // Apply priority filter if specified (client-side for multiselect)
        if (filters?.priority && filters.priority.length > 0) {
          filteredTargets = filteredTargets.filter((t: any) => 
            filters.priority!.includes(t.priority)
          );
        }
        
        // Filter by selected stage if one is selected
        if (selectedStage) {
          filteredTargets = filteredTargets.filter((t: any) => 
            (t.f3ead_stage || 'FIND').toUpperCase() === selectedStage
          );
        }

        // Calculate F3EAD counts from filtered targets
        filteredTargets.forEach((target: any) => {
          const stage = (target.f3ead_stage || 'FIND').toUpperCase();
          if (f3eadCounts.hasOwnProperty(stage)) {
            f3eadCounts[stage]++;
          } else {
            f3eadCounts.FIND++; // Default to FIND if unknown
          }
        });
        
        setF3eadPipeline([
          { name: 'Find', code: 'FIND', count: f3eadCounts.FIND, icon: <Search size={14} /> },
          { name: 'Fix', code: 'FIX', count: f3eadCounts.FIX, icon: <Crosshair size={14} /> },
          { name: 'Finish', code: 'FINISH', count: f3eadCounts.FINISH, icon: <Target size={14} /> },
          { name: 'Exploit', code: 'EXPLOIT', count: f3eadCounts.EXPLOIT, icon: <TrendingUp size={14} /> },
          { name: 'Analyze', code: 'ANALYZE', count: f3eadCounts.ANALYZE, icon: <Activity size={14} /> },
          { name: 'Disseminate', code: 'DISSEMINATE', count: f3eadCounts.DISSEMINATE, icon: <ChevronRight size={14} /> },
        ]);
      } catch (err) {
        console.error('Failed to fetch target nomination data:', err);
        // Fallback to empty arrays
        setDtlEntries([]);
        setTstAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(interval);
  }, [selectedStage, filters]);

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-950/30 border border-green-800 rounded-lg">
            <Target className="text-green-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Target Nomination & Prioritization
            </h2>
            <p className="text-xs text-slate-400">
              Dynamic Target List • F3EAD Pipeline • Time-Sensitive Targets
            </p>
          </div>
        </div>
        <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
      </div>

      {/* Time-Sensitive Target Alerts - CRITICAL Section */}
      {tstAlerts.length > 0 && (
        <div className="mb-4 p-4 bg-red-950/20 border-2 border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-red-400 animate-pulse" size={20} />
            <h3 className="text-sm font-black text-red-400 uppercase">
              Time-Sensitive Targets ({tstAlerts.length})
            </h3>
          </div>
          <div className="space-y-2">
            {tstAlerts.map((tst) => (
              <div key={tst.id} className="flex items-center justify-between p-3 bg-slate-900/50 border border-red-800 rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-red-900/50 border border-red-700 rounded text-xs font-black text-red-300">
                      {tst.id}
                    </span>
                    <span className="text-sm font-bold text-white">{tst.name}</span>
                    {tst.priority === 'CRITICAL' && (
                      <span className="px-2 py-0.5 bg-red-600 rounded text-xs font-black text-white">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Deadline: {tst.deadline}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black ${tst.minutesRemaining < 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                    {tst.minutesRemaining}
                  </div>
                  <div className="text-xs text-slate-500 uppercase">Minutes</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F3EAD Pipeline Funnel */}
      <div className="mb-4 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
        <div className="text-xs font-bold text-slate-400 uppercase mb-3">F3EAD Target Pipeline</div>
        <div className="flex items-center gap-2">
          {f3eadPipeline.map((stage, idx) => (
            <div key={stage.code} className="flex items-center flex-1">
              <button
                onClick={() => setSelectedStage(stage.code)}
                className={`flex-1 px-3 py-2 rounded transition-colors ${
                  selectedStage === stage.code
                    ? 'bg-blue-900 border-2 border-blue-600'
                    : 'bg-slate-800 border border-slate-700 hover:border-blue-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 mb-1">
                  {stage.icon}
                  <span className="text-xs font-bold text-white uppercase">{stage.name}</span>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-blue-400">{stage.count}</div>
                </div>
              </button>
              {idx < f3eadPipeline.length - 1 && (
                <ChevronRight className="text-slate-600 mx-1" size={16} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Priority Matrix Heat Map */}
      <div className="mb-4 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
        <div className="text-xs font-bold text-slate-400 uppercase mb-3">
          Target Priority Matrix (Priority vs. Feasibility)
        </div>
        <div className="grid grid-cols-5 gap-1">
          {/* Y-axis label (Priority) */}
          <div className="flex flex-col justify-between text-[10px] text-slate-500 pr-2">
            <span>HIGH</span>
            <span>MED</span>
            <span>LOW</span>
          </div>
          
          {/* Matrix Grid */}
          <div className="col-span-4 grid grid-cols-4 gap-1">
            {/* High Priority Row */}
            <div className="aspect-square bg-green-900/40 border border-green-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-green-400">12</span>
            </div>
            <div className="aspect-square bg-green-800/50 border border-green-600 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-green-300">8</span>
            </div>
            <div className="aspect-square bg-amber-900/40 border border-amber-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-amber-400">4</span>
            </div>
            <div className="aspect-square bg-red-900/30 border border-red-800 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-red-400">2</span>
            </div>
            
            {/* Medium Priority Row */}
            <div className="aspect-square bg-green-800/40 border border-green-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-green-400">7</span>
            </div>
            <div className="aspect-square bg-amber-900/40 border border-amber-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-amber-400">11</span>
            </div>
            <div className="aspect-square bg-amber-900/50 border border-amber-600 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-amber-300">6</span>
            </div>
            <div className="aspect-square bg-slate-800/50 border border-slate-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-slate-400">3</span>
            </div>
            
            {/* Low Priority Row */}
            <div className="aspect-square bg-amber-900/30 border border-amber-800 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-amber-400">5</span>
            </div>
            <div className="aspect-square bg-slate-800/50 border border-slate-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-slate-400">9</span>
            </div>
            <div className="aspect-square bg-slate-800/40 border border-slate-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-slate-500">12</span>
            </div>
            <div className="aspect-square bg-slate-900/50 border border-slate-700 rounded flex items-center justify-center">
              <span className="text-sm font-bold text-slate-600">15</span>
            </div>
          </div>
        </div>
        {/* X-axis label (Feasibility) */}
        <div className="grid grid-cols-5 gap-1 mt-1">
          <div></div>
          <div className="text-center text-[10px] text-slate-500">LOW</div>
          <div className="text-center text-[10px] text-slate-500">MED</div>
          <div className="text-center text-[10px] text-slate-500">HIGH</div>
          <div className="text-center text-[10px] text-slate-500">VERY HIGH</div>
        </div>
        <div className="text-[10px] text-slate-500 text-center mt-1 uppercase">Feasibility</div>
      </div>

      {/* Dynamic Target List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase">
            Dynamic Target List (Top 3 by Combined Score)
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-slate-500" size={12} />
            <span className="text-xs text-slate-500">Sorted by aging + priority</span>
          </div>
        </div>

        <div className="space-y-2">
          {dtlEntries.map((entry) => (
            <div key={entry.id} className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs font-black text-white">
                      {entry.id}
                    </span>
                    <span className="text-sm font-bold text-white">{entry.name}</span>
                    <SecurityBadge level={entry.classification as any} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Priority:</span>
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${entry.priorityScore * 100}%` }} />
                      </div>
                      <span className="text-blue-400 font-bold">{(entry.priorityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Feasibility:</span>
                      <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${entry.feasibilityScore * 100}%` }} />
                      </div>
                      <span className="text-green-400 font-bold">{(entry.feasibilityScore * 100).toFixed(0)}%</span>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                      entry.status === 'APPROVED' ? 'bg-green-950/50 border border-green-800 text-green-400' :
                      entry.status === 'VALIDATED' ? 'bg-amber-950/50 border border-amber-800 text-amber-400' :
                      'bg-slate-800 border border-slate-700 text-slate-400'
                    }`}>
                      {entry.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Combined Score</div>
                    <div className="text-xl font-black text-cyan-400">
                      {(entry.combinedScore * 100).toFixed(0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Aging</div>
                    <div className={`text-lg font-bold ${
                      entry.agingHours > 48 ? 'text-red-400' :
                      entry.agingHours > 24 ? 'text-amber-400' :
                      'text-slate-400'
                    }`}>
                      {entry.agingHours}h
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && dtlEntries.length > 0 && (
          <div className="mt-3 text-center">
            <button 
              className="text-xs text-blue-400 hover:text-blue-300 font-medium uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              aria-label="View all targets in Dynamic Target List"
            >
              View All Targets in DTL →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
