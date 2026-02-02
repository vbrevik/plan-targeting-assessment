// NATO COPD Component 4: Effects Assessment Dashboard
// BDA tracking, desired vs. achieved effects, collateral damage, re-attack recommendations
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Target, CheckCircle2, AlertCircle, RefreshCw, Users, Building2 } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import { BdaApi } from '@/lib/mshnctrl/api/bda';

interface BDAAssessment {
  strikeId: string;
  targetId: string;
  targetName: string;
  strikeTime: string;
  assessmentTime: string;
  bdaStatus: 'DESTROYED' | 'DAMAGED' | 'INTACT' | 'PENDING';
  effectivenessPercentage: number;
  desiredEffects: string[];
  achievedEffects: Array<{
    effect: string;
    achieved: boolean;
    percentage: number;
  }>;
  collateralDamage: {
    estimated: { civilians: number; infrastructure: string };
    actual: { civilians: number; infrastructure: string };
  };
  reAttackRecommended: boolean;
  reAttackReason?: string;
}

export function EffectsAssessmentDashboard() {
  const navigate = useNavigate();
  const [recentBDA, setRecentBDA] = useState<BDAAssessment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assessments, stats] = await Promise.all([
          BdaApi.getQueue().catch(() => []),
          BdaApi.getStatistics().catch(() => null),
        ]);

        // Transform to component format - fetch target names
        const transformed: BDAAssessment[] = await Promise.all(
          assessments.map(async (bda) => {
            try {
              const target = await targetingApi.getTarget(bda.properties.target_id);
              return {
                strikeId: `STR-${bda.id}`,
                targetId: bda.properties.target_id,
                targetName: target.name,
                strikeTime: new Date().toISOString(),
                assessmentTime: new Date().toISOString(),
                bdaStatus: bda.properties.physical_damage === 'D' ? 'DESTROYED' : bda.properties.physical_damage === 'SVD' ? 'DAMAGED' : 'INTACT',
                effectivenessPercentage: Math.round((bda.confidence || 0) * 100),
                desiredEffects: [],
                achievedEffects: [],
                collateralDamage: { estimated: { civilians: 0, infrastructure: 'None' }, actual: { civilians: 0, infrastructure: 'None' } },
                reAttackRecommended: bda.properties.recommendation === 're_attack' || (stats?.by_recommendation.re_attack || 0) > 0,
              };
            } catch {
              return {
                strikeId: `STR-${bda.id}`,
                targetId: bda.properties.target_id,
                targetName: `Target ${bda.properties.target_id.substring(0, 8)}`,
                strikeTime: new Date().toISOString(),
                assessmentTime: new Date().toISOString(),
                bdaStatus: bda.properties.physical_damage === 'D' ? 'DESTROYED' : bda.properties.physical_damage === 'SVD' ? 'DAMAGED' : 'INTACT',
                effectivenessPercentage: Math.round((bda.confidence || 0) * 100),
                desiredEffects: [],
                achievedEffects: [],
                collateralDamage: { estimated: { civilians: 0, infrastructure: 'None' }, actual: { civilians: 0, infrastructure: 'None' } },
                reAttackRecommended: bda.properties.recommendation === 're_attack',
              };
            }
          })
        );

        setRecentBDA(transformed);
      } catch (err) {
        console.error('Failed to fetch BDA data:', err);
        setRecentBDA([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Use real assessments if available, otherwise fallback to mock including non-kinetic
  const activeBDA: BDAAssessment[] = recentBDA.length > 0 ? recentBDA : [
    {
      strikeId: 'STR-901',
      targetId: 'T-2401',
      targetName: 'Enemy C2 Node Alpha',
      strikeTime: '13:00Z',
      assessmentTime: '13:45Z',
      bdaStatus: 'DESTROYED',
      effectivenessPercentage: 95,
      desiredEffects: ['Physical Destruction', 'C2 Disruption'],
      achievedEffects: [
        { effect: 'Structure Leveled', achieved: true, percentage: 100 },
        { effect: 'C2 Silence', achieved: true, percentage: 90 },
      ],
      collateralDamage: { estimated: { civilians: 0, infrastructure: 'None' }, actual: { civilians: 0, infrastructure: 'None' } },
      reAttackRecommended: false
    },
    {
      strikeId: 'CYB-004',
      targetId: 'T-Cyber-08',
      targetName: 'Power Grid Control Network',
      strikeTime: '10:30Z',
      assessmentTime: '12:00Z',
      bdaStatus: 'DAMAGED',
      effectivenessPercentage: 78,
      desiredEffects: ['Service Disruption', 'Network Access'],
      achievedEffects: [
        { effect: 'Persistent Access Gained', achieved: true, percentage: 85 },
        { effect: 'Command Injection Successful', achieved: true, percentage: 70 },
        { effect: 'Load Balancer Shutdown', achieved: false, percentage: 20 },
      ],
      collateralDamage: { estimated: { civilians: 0, infrastructure: 'Grid Instability' }, actual: { civilians: 0, infrastructure: 'Local Brownout' } },
      reAttackRecommended: true,
      reAttackReason: 'Load balancer remains functional; primary disruption objective not fully met.'
    }
  ];


  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/30 border border-red-800 rounded-lg">
            <Target className="text-red-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Effects Assessment
            </h2>
            <p className="text-xs text-slate-400">
              Battle Damage Assessment • Desired vs. Achieved • Re-Attack Recommendations
            </p>
          </div>
        </div>
        <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => navigate({ to: '/mshnctrl/targeting/effects' })}
          className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer text-left"
        >
          <div className="text-xs text-slate-500 uppercase mb-1">Today's Strikes</div>
          <div className="text-2xl font-black text-white">12</div>
        </button>
        <div className="p-3 bg-green-950/30 border border-green-800 rounded-lg">
          <div className="text-xs text-slate-500 uppercase mb-1">Destroyed</div>
          <div className="text-2xl font-black text-green-400">8</div>
        </div>
        <div className="p-3 bg-amber-950/30 border border-amber-800 rounded-lg">
          <div className="text-xs text-slate-500 uppercase mb-1">Damaged</div>
          <div className="text-2xl font-black text-amber-400">3</div>
        </div>
        <div className="p-3 bg-red-950/30 border border-red-800 rounded-lg">
          <div className="text-xs text-slate-500 uppercase mb-1">Re-Attack Req</div>
          <div className="text-2xl font-black text-red-400">1</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Second Order Effects</div>
          <div className="text-sm font-bold text-slate-300">Collateral infrastructure disruption confirmed</div>
        </div>
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="text-[10px] text-slate-500 uppercase mb-1">Third Order Effects</div>
          <div className="text-sm font-bold text-slate-300">Economic impact analysis pending</div>
        </div>
      </div>

      {/* BDA Assessments */}
      <div className="space-y-4">
        {activeBDA.map((bda) => (
          <div
            key={bda.strikeId}
            onClick={() => navigate({ to: '/mshnctrl/targeting' })}
            className={`p-4 bg-slate-800/30 border rounded-lg transition-all hover:bg-slate-800/50 cursor-pointer group ${bda.reAttackRecommended
              ? 'border-red-700 bg-red-950/10'
              : 'border-slate-700'
              }`}
          >
            {/* BDA Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-black text-white">
                  {bda.strikeId}
                </span>
                <span className="text-sm font-bold text-white">{bda.targetName}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${bda.bdaStatus === 'DESTROYED' ? 'bg-green-900/50 text-green-400' :
                  bda.bdaStatus === 'DAMAGED' ? 'bg-amber-900/50 text-amber-400' :
                    bda.bdaStatus === 'INTACT' ? 'bg-red-900/50 text-red-400' :
                      'bg-slate-800 text-slate-400'
                  }`}>
                  {bda.strikeId.startsWith('CYB') ? (bda.bdaStatus === 'DESTROYED' ? 'NEUTRALIZED' : bda.bdaStatus) : bda.bdaStatus}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Effectiveness</div>
                <div className={`text-xl font-black ${bda.effectivenessPercentage >= 80 ? 'text-green-400' :
                  bda.effectivenessPercentage >= 50 ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                  {bda.effectivenessPercentage}%
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="flex items-center gap-4 mb-3 text-xs text-slate-400">
              <span>Strike: {bda.strikeTime}</span>
              <span>•</span>
              <span>BDA: {bda.assessmentTime}</span>
            </div>

            {/* Desired vs. Achieved Effects */}
            <div className="mb-3">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Effects Assessment</div>
              <div className="space-y-1.5">
                {bda.achievedEffects.map((effect, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {effect.achieved ? (
                      <CheckCircle2 className="text-green-400" size={14} />
                    ) : (
                      <AlertCircle className="text-red-400" size={14} />
                    )}
                    <div className="flex-1">
                      <div className="text-xs text-slate-300">{effect.effect}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${effect.percentage >= 80 ? 'bg-green-500' :
                              effect.percentage >= 50 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}
                            style={{ width: `${effect.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-white w-10 text-right">
                          {effect.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collateral Damage Tracking */}
            <div className="mb-3 p-3 bg-slate-900/50 border border-slate-700 rounded">
              <div className="text-xs font-bold text-slate-400 uppercase mb-2">Collateral Damage</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Estimated</div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users size={12} className="text-slate-500" />
                    <span className="text-slate-300">{bda.collateralDamage.estimated.civilians} civilians</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <Building2 size={12} className="text-slate-500" />
                    <span className="text-slate-300">{bda.collateralDamage.estimated.infrastructure}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase mb-1">Actual</div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users size={12} className={bda.collateralDamage.actual.civilians > bda.collateralDamage.estimated.civilians ? 'text-red-400' : 'text-green-400'} />
                    <span className="text-slate-300">{bda.collateralDamage.actual.civilians} civilians</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <Building2 size={12} className="text-slate-500" />
                    <span className="text-slate-300">{bda.collateralDamage.actual.infrastructure}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Re-Attack Recommendation */}
            {bda.reAttackRecommended && bda.reAttackReason && (
              <div className="p-3 bg-red-950/20 border border-red-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="text-red-400" size={14} />
                  <span className="text-xs font-bold text-red-400 uppercase">Re-Attack Recommended</span>
                </div>
                <div className="text-xs text-slate-300 mb-3">{bda.reAttackReason}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); navigate({ to: '/mshnctrl/targeting/targets' }); }}
                  className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700 rounded text-xs font-bold text-red-300 uppercase transition-colors cursor-pointer"
                >
                  Nominate Re-Attack
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div >
  );
}
