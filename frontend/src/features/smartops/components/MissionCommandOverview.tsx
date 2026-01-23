// NATO COPD Component 1: Mission Command Overview Panel
// Displays commander's intent, targeting guidance, decision authority matrix, and operational tempo
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Target, Users, Gauge, AlertTriangle, CheckCircle2, Crosshair, Activity, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi, type MissionIntent, type TargetingGuidance, type DecisionAuthority, type OperationalTempo } from '@/lib/smartops/api/targeting.api';

// Local components use types from targetingApi

interface MissionCommandProps {
  isEmbedded?: boolean;
}

export function MissionCommandOverview({ isEmbedded = false }: MissionCommandProps) {
  const navigate = useNavigate();
  const [commanderIntent, setCommanderIntent] = useState<MissionIntent | null>(null);
  const [targetingGuidance, setTargetingGuidance] = useState<TargetingGuidance | null>(null);
  const [decisionAuthority, setDecisionAuthority] = useState<DecisionAuthority | null>(null);
  const [operationalTempo, setOperationalTempo] = useState<OperationalTempo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [intent, guidance, authority, tempo] = await Promise.all([
          targetingApi.getMissionIntent().catch(() => null),
          targetingApi.getTargetingGuidance().catch(() => null),
          targetingApi.getAuthorityMatrix().catch(() => null),
          targetingApi.getOperationalTempo().catch(() => null),
        ]);

        if (intent) setCommanderIntent(intent);
        if (guidance) setTargetingGuidance(guidance);
        if (authority) setDecisionAuthority(authority);
        if (tempo) setOperationalTempo(tempo);
      } catch (err) {
        console.error('Failed to fetch mission command data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fallback mock data if API fails
  const fallbackIntent: MissionIntent = {
    phase: "Phase 2: Hostile Force Degradation",
    priorityEffects: [
      "Disrupt enemy C2 networks",
      "Attrit enemy armor by 30%",
      "Deny enemy freedom of movement in AO-North"
    ],
    endstate: "Enemy unable to conduct coordinated operations in AO-North",
    endstateMetrics: [
      { name: "Enemy C2 Nodes Destroyed", current: 12, target: 18, status: 'at-risk' },
      { name: "Armor Attrition %", current: 22, target: 30, status: 'at-risk' },
      { name: "Movement Denial Coverage %", current: 87, target: 90, status: 'on-track' }
    ]
  };

  const fallbackGuidance: TargetingGuidance = {
    roeLevel: "WEAPON FREE - Authorized Zones",
    collateralThreshold: "CDE < 50 civilian casualties per strike",
    approvedTargetSets: [
      "Category 1: C2 Nodes (High Priority)",
      "Category 2: Armor Formations (Medium Priority)",
      "Category 3: Logistics Hubs (Low Priority)"
    ],
    restrictions: [
      "NO STRIKE: Cultural/religious sites",
      "NO STRIKE: Medical facilities",
      "RESTRICTED: Dual-use infrastructure (Commander approval required)"
    ]
  };

  const fallbackAuthority: DecisionAuthority = {
    level: "OPERATIONAL",
    authority: "Commander, Joint Task Force",
    canApprove: [
      "Category 1-2 targets (CDE < 50)",
      "Time-sensitive targets (CDE < 20)",
      "ROE modifications within authority"
    ],
    mustEscalate: [
      "Category 1-2 targets (CDE ≥ 50)",
      "All Category 3 targets",
      "Strategic targets",
      "Cross-border strikes"
    ]
  };

  const fallbackTempo: OperationalTempo = {
    currentPhase: "Day 12 of 21 - Phase 2",
    hoursIntoPhase: 276,
    criticalDecisionPoints: [
      { name: "JTB Session", time: "14:00Z", status: 'upcoming' },
      { name: "Strike Window Opens", time: "16:00Z", status: 'upcoming' },
      { name: "BDA Review", time: "20:00Z", status: 'upcoming' },
      { name: "Phase 3 Transition Decision", time: "D+15", status: 'upcoming' }
    ]
  };

  // Use API data or fallback
  const intent = commanderIntent || fallbackIntent;
  const guidance = targetingGuidance || fallbackGuidance;
  const authority = decisionAuthority || fallbackAuthority;
  const tempo = operationalTempo || fallbackTempo;

  const missionHistory = [
    { time: '13:45Z', event: 'Guidance Update', details: 'Category 1 priority increased', actor: 'CDR JTF' },
    { time: '10:30Z', event: 'Targeting Shift', details: 'Logistics hubs added to JTL', actor: 'J3 Ops' },
    { time: '08:00Z', event: 'Phase Transition', details: 'Advanced to Phase 2: Degradation', actor: 'Commander' },
  ];

  if (loading && !commanderIntent) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", isEmbedded ? "" : "p-0")}>
      {!isEmbedded && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Command Node: Link-16 Active</span>
          </div>
          <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
        </div>
      )}

      {/* 4-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Commander's Intent Tracker */}
        <button
          onClick={() => !isEmbedded && navigate({ to: '/smartops/targeting/mission-command' })}
          className={cn(
            "bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-left transition-all group relative overflow-hidden",
            !isEmbedded && "hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Target size={60} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="text-blue-400 group-hover:scale-110 transition-transform" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">Commander's Intent</h3>
            </div>
            <Activity size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Current Phase</div>
            <div className="text-sm font-bold text-blue-400">{intent.phase}</div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Priority Effects</div>
            <div className="space-y-1">
              {intent.priorityEffects.map((effect: string, idx: number) => (
                <div key={idx} className="flex items-start gap-1">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span className="text-xs text-slate-300 flex-1">{effect}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase mb-1">Endstate</div>
            <div className="text-xs text-slate-300 italic">{intent.endstate}</div>
          </div>

          {/* Endstate Metrics */}
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="text-xs text-slate-500 uppercase mb-2">Progress to Endstate</div>
            {intent.endstateMetrics.map((metric: any, idx: number) => (
              <div key={idx} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{metric.name}</span>
                  <span className="text-xs font-bold text-white">{metric.current}/{metric.target}</span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.status === 'on-track' ? 'bg-green-500' :
                      metric.status === 'at-risk' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    style={{ width: `${(metric.current / metric.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </button>

        {/* 2. Targeting Guidance Status */}
        <button
          onClick={() => !isEmbedded && navigate({ to: '/smartops/targeting/mission-command' })}
          className={cn(
            "bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-left transition-all group relative overflow-hidden",
            !isEmbedded && "hover:border-green-500/50 hover:bg-slate-800/60 cursor-pointer"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Crosshair size={60} />
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="text-green-400 group-hover:scale-110 transition-transform" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">Targeting Guidance</h3>
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">ROE Status</div>
            <div className="px-2 py-1 bg-green-950/50 border border-green-800 rounded text-xs font-bold text-green-400 inline-block font-mono">
              {guidance.roeLevel}
            </div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Collateral Damage</div>
            <div className="text-xs text-slate-300">{guidance.collateralThreshold}</div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Approved Target Sets</div>
            <div className="space-y-1">
              {guidance.approvedTargetSets.map((set: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  <CheckCircle2 className="text-green-400" size={12} />
                  <span className="text-xs text-slate-300">{set}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase mb-1">Restrictions</div>
            <div className="space-y-1">
              {guidance.restrictions.map((restriction: string, idx: number) => (
                <div key={idx} className="flex items-center gap-1">
                  <AlertTriangle className="text-red-400" size={12} />
                  <span className="text-xs text-slate-300">{restriction}</span>
                </div>
              ))}
            </div>
          </div>
        </button>

        {/* 3. Decision Authority Matrix */}
        <button
          onClick={() => !isEmbedded && navigate({ to: '/smartops/targeting/mission-command' })}
          className={cn(
            "bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-left transition-all group relative overflow-hidden",
            !isEmbedded && "hover:border-purple-500/50 hover:bg-slate-800/60 cursor-pointer"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Users size={60} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-purple-400 group-hover:scale-110 transition-transform" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Decision Authority</h3>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Authority Level</div>
            <div className="text-sm font-bold text-purple-400 font-mono">{authority.level}</div>
            <div className="text-xs text-slate-400 mt-1">{authority.authority}</div>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-green-400" />
              <span>Can Approve</span>
            </div>
            <div className="space-y-1">
              {authority.canApprove.map((item: string, idx: number) => (
                <div key={idx} className="text-xs text-slate-300 pl-4">• {item}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase mb-1 flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-400" />
              <span>Must Escalate</span>
            </div>
            <div className="space-y-1">
              {authority.mustEscalate.map((item: string, idx: number) => (
                <div key={idx} className="text-xs text-slate-300 pl-4">• {item}</div>
              ))}
            </div>
          </div>
        </button>

        {/* 4. Operational Tempo Gauge */}
        <button
          onClick={() => !isEmbedded && navigate({ to: '/smartops/targeting/mission-command' })}
          className={cn(
            "bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-left transition-all group relative overflow-hidden",
            !isEmbedded && "hover:border-cyan-500/50 hover:bg-slate-800/60 cursor-pointer"
          )}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Gauge size={60} />
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="text-cyan-400 group-hover:scale-110 transition-transform" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Operational Tempo</h3>
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 uppercase mb-1">Mission Timeline</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">{tempo.currentPhase}</div>
            <div className="text-xs text-slate-400 mt-1">
              {tempo.hoursIntoPhase}h into current phase
            </div>
          </div>

          {/* Progress Ring */}
          <div className="flex items-center justify-center mb-3">
            <div className="relative w-20 h-20">
              <svg className="transform -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-slate-700"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-cyan-500"
                  strokeWidth="2"
                  strokeDasharray={`${(276 / 504) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-black text-cyan-400">57%</div>
                <div className="text-[8px] text-slate-500 uppercase">Complete</div>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase mb-2">Critical Decision Points</div>
            <div className="space-y-1.5">
              {tempo.criticalDecisionPoints.map((point: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <Activity
                    size={12}
                    className={
                      point.status === 'current' ? 'text-green-400' :
                        point.status === 'upcoming' ? 'text-amber-400' :
                          'text-slate-600'
                    }
                  />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-300">{point.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{point.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </button>
      </div>

      {/* History and Updates (Only shown when not embedded or explicitly requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-slate-900/40 border border-slate-800 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-slate-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Guidance & Intent History</h3>
          </div>
          <div className="space-y-3">
            {missionHistory.map((item: { time: string; event: string; details: string; actor: string }, idx: number) => (
              <div key={idx} className="flex items-start gap-4 p-3 bg-slate-950/50 border border-slate-800/50 rounded-lg hover:bg-slate-900/50 transition-colors">
                <div className="text-[10px] font-mono text-slate-500 w-12 pt-0.5">{item.time}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-400 uppercase">{item.event}</span>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Actor: {item.actor}</span>
                  </div>
                  <div className="text-xs text-slate-300">{item.details}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 bg-amber-950/10 border border-amber-900/30 rounded-xl flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-500 animate-pulse" size={20} />
            <div className="flex-1">
              <div className="text-xs font-black text-amber-500 uppercase tracking-widest">
                Latest CDR Directive
              </div>
              <div className="text-[10px] text-slate-500 font-mono">13:45Z UPDATED</div>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-amber-600/50 pl-3">
            "Priority shift: Category 1 targets now take precedence over Category 2. All TSTs require CG approval if CDE ≥ 30."
          </p>
          <button
            onClick={() => !isEmbedded && navigate({ to: '/smartops/targeting/mission-command' })}
            className="mt-6 w-full py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 rounded text-[10px] font-black text-amber-300 uppercase transition-colors"
          >
            Acknowledge Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
