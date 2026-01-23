// NATO COPD Component 3: Intelligence Integration Panel
// Multi-INT fusion, Pattern of Life analytics, ISR collection status, predictive targeting cues
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Brain, Satellite, Radio, Eye, MapPin, Activity, TrendingUp, AlertCircle, Signal, Globe, Users, Clock, Zap } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

interface MultiINTFusion {
  targetId: string;
  targetName: string;
  intTypes: Array<{
    type: 'SIGINT' | 'IMINT' | 'HUMINT' | 'GEOINT' | 'MASINT';
    confidence: number;
    lastUpdate: string;
    sourceReliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  }>;
  fusionScore: number;
  convergenceIndicator: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface PatternOfLife {
  targetId: string;
  targetName: string;
  patterns: Array<{
    description: string;
    frequency: string;
    confidence: number;
  }>;
  nextLikelyActivity: string;
  timeWindow: string;
}

interface ISRPlatform {
  id: string;
  name: string;
  type: string;
  sensor: string;
  status: 'ACTIVE' | 'RTB' | 'STANDBY';
  loiterRemaining: number;
  coverageGap: boolean;
}

export function IntelligenceIntegrationPanel() {
  const navigate = useNavigate();
  const [multiINT, setMultiINT] = useState<MultiINTFusion[]>([]);
  const [pol, setPol] = useState<PatternOfLife | null>(null);
  const [isrPlatforms, setIsrPlatforms] = useState<ISRPlatform[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reports, polReports, isrData] = await Promise.all([
          targetingApi.getIntelReports().catch(() => []),
          targetingApi.getPatternOfLife().catch(() => []),
          targetingApi.listIsrPlatforms().catch(() => []),
        ]);

        // Group reports by target_id and calculate fusion scores
        const targetMap = new Map<string, MultiINTFusion>();

        reports.forEach((report) => {
          const targetId = report.target_id || 'unknown';
          if (!targetMap.has(targetId)) {
            targetMap.set(targetId, {
              targetId,
              targetName: report.report_title,
              intTypes: [],
              fusionScore: report.fusion_score || 0.5,
              convergenceIndicator: 'LOW',
            });
          }

          const fusion = targetMap.get(targetId)!;
          fusion.intTypes.push({
            type: report.int_type as any,
            confidence: report.confidence_level,
            lastUpdate: new Date().toISOString(),
            sourceReliability: (report.source_reliability || 'A') as 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
          });

          // Update fusion score and convergence
          fusion.fusionScore = Math.max(fusion.fusionScore, report.fusion_score || 0.5);
          fusion.convergenceIndicator = fusion.intTypes.length >= 3 ? 'HIGH' : fusion.intTypes.length >= 2 ? 'MEDIUM' : 'LOW';
        });

        setMultiINT(Array.from(targetMap.values()));

        // Transform POL if available
        if (polReports.length > 0) {
          const mainReport = polReports[0];
          setPol({
            targetId: mainReport.target_id || 'T-Unknown',
            targetName: mainReport.report_title,
            patterns: [
              { description: mainReport.report_summary || 'No pattern details', frequency: 'Observed', confidence: mainReport.confidence_level }
            ],
            nextLikelyActivity: 'Indicated from Fusion',
            timeWindow: 'Next 24 Hours'
          });
        }

        // Transform ISR Platforms
        const transformedPlatforms: ISRPlatform[] = isrData.map(p => ({
          id: p.id,
          name: p.platform_name || p.callsign || 'Unknown',
          type: p.platform_type || 'UAV',
          sensor: p.sensor_type || 'EO/IR',
          status: p.status === 'READY' ? 'ACTIVE' : p.status === 'TASKED' ? 'ACTIVE' : 'STANDBY',
          loiterRemaining: (p.loiter_time_remaining || 0) / 60,
          coverageGap: p.status === 'MAINTENANCE'
        }));
        setIsrPlatforms(transformedPlatforms);
      } catch (err) {
        console.error('Failed to fetch intelligence data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);


  // Fallback if no data available
  const activePOL = pol || {
    targetId: 'T-2401',
    targetName: 'Enemy C2 Node Alpha',
    patterns: [
      { description: 'Staff meeting daily at 09:00 local', frequency: 'Daily', confidence: 94 },
      { description: 'Shift change at 18:00 local', frequency: 'Daily', confidence: 89 },
      { description: 'Increased comms activity 21:00-23:00 local', frequency: '4x/week', confidence: 82 },
    ],
    nextLikelyActivity: 'Staff Meeting',
    timeWindow: '09:00-10:30 local (tomorrow)'
  };

  const activePlatforms = isrPlatforms.length > 0 ? isrPlatforms : [
    { id: 'ISR-01', name: 'Reaper-12', type: 'UAV', sensor: 'EO/IR', status: 'ACTIVE', loiterRemaining: 4.2, coverageGap: false },
    { id: 'ISR-02', name: 'Global Hawk-03', type: 'UAV', sensor: 'SAR', status: 'ACTIVE', loiterRemaining: 12.5, coverageGap: false },
    { id: 'ISR-03', name: 'Sentinel-2', type: 'Satellite', sensor: 'Multispectral', status: 'ACTIVE', loiterRemaining: 0, coverageGap: true },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-950/30 border border-purple-800 rounded-lg">
            <Brain className="text-purple-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Intelligence Integration
            </h2>
            <p className="text-xs text-slate-400">
              Multi-INT Fusion • Pattern of Life • ISR Status • Predictive Cues
            </p>
          </div>
        </div>
        <SecurityBadge level="TS_SCI" caveats={['NOFORN', 'ORCON']} size="sm" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Multi-INT Fusion Display */}
          <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="text-purple-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">Multi-INT Fusion</h3>
              <span className="text-xs text-slate-500">(SIGINT • IMINT • HUMINT • GEOINT)</span>
            </div>

            {multiINT.map((fusion) => (
              <button
                key={fusion.targetId}
                onClick={() => navigate({ to: '/smartops/targeting/targets' })}
                className="mb-4 w-full text-left hover:bg-slate-800/50 rounded-lg p-2 -m-2 transition-colors cursor-pointer"
                title={`Click to view target ${fusion.targetName} details`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{fusion.targetName}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${fusion.convergenceIndicator === 'HIGH' ? 'bg-green-900/50 text-green-400' :
                      fusion.convergenceIndicator === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>
                      {fusion.convergenceIndicator} CONVERGENCE
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500">Fusion Score</div>
                    <div className="text-lg font-black text-purple-400">
                      {(fusion.fusionScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* INT Type Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {fusion.intTypes.map((int) => (
                    <div key={int.type} className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                      <div className="flex items-center gap-1 mb-1">
                        {int.type === 'SIGINT' && <Radio size={12} className="text-blue-400" />}
                        {int.type === 'IMINT' && <Eye size={12} className="text-green-400" />}
                        {int.type === 'HUMINT' && <Users size={12} className="text-amber-400" />}
                        {int.type === 'GEOINT' && <MapPin size={12} className="text-cyan-400" />}
                        <span className="text-[10px] font-bold text-white uppercase">{int.type}</span>
                      </div>
                      <div className="text-xs font-black text-white mb-0.5">
                        {int.confidence}%
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${int.sourceReliability === 'A' ? 'bg-green-500' :
                          int.sourceReliability === 'B' ? 'bg-blue-500' :
                            int.sourceReliability === 'C' ? 'bg-amber-500' :
                              'bg-red-500'
                          }`} />
                        <span className="text-[9px] text-slate-500">{int.sourceReliability}</span>
                      </div>
                      <div className="text-[9px] text-slate-600 mt-1">{int.lastUpdate}</div>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Pattern of Life Analytics */}
          <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-green-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">Pattern of Life</h3>
            </div>

            <div className="mb-3">
              <div className="text-sm font-bold text-white mb-1">{activePOL.targetName}</div>
              <div className="text-xs text-slate-400">High Payoff Target (HPT)</div>
            </div>

            <div className="space-y-2 mb-3">
              {activePOL.patterns.map((pattern: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-slate-900/50 rounded">
                  <TrendingUp className="text-green-400 mt-0.5" size={14} />
                  <div className="flex-1">
                    <div className="text-xs text-slate-300 font-medium">{pattern.description}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-500">{pattern.frequency}</span>
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${pattern.confidence}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-green-400">{pattern.confidence}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Predictive Targeting Cue */}
            <div className="p-3 bg-green-950/20 border border-green-800 rounded">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="text-green-400" size={14} />
                <span className="text-xs font-bold text-green-400 uppercase">Predictive Targeting Window</span>
              </div>
              <div className="text-sm font-bold text-white">{activePOL.nextLikelyActivity}</div>
              <div className="text-xs text-slate-400">{activePOL.timeWindow}</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* ISR Collection Status */}
          <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Satellite className="text-cyan-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">ISR Collection Status</h3>
            </div>

            <div className="space-y-2">
              {activePlatforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => navigate({ to: '/smartops/targeting/assets' })}
                  className="w-full text-left p-2 bg-slate-900/50 border border-slate-700 rounded hover:bg-slate-800/50 transition-colors cursor-pointer"
                  title={`Click to view ${platform.name} details`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${platform.status === 'ACTIVE' ? 'bg-green-500' :
                        platform.status === 'RTB' ? 'bg-amber-500' :
                          'bg-slate-600'
                        }`} />
                      <span className="text-sm font-bold text-white">{platform.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">{platform.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Signal size={12} className="text-blue-400" />
                      <span className="text-slate-400">{platform.sensor}</span>
                    </div>
                    {platform.loiterRemaining > 0 && (
                      <div className={`flex items-center gap-1 ${platform.loiterRemaining < 2 ? 'text-red-400' :
                        platform.loiterRemaining < 4 ? 'text-amber-400' :
                          'text-green-400'
                        }`}>
                        <Clock size={12} />
                        <span className="font-bold">{platform.loiterRemaining.toFixed(1)}h</span>
                      </div>
                    )}
                  </div>
                  {platform.coverageGap && (
                    <div className="mt-2 px-2 py-1 bg-amber-950/30 border border-amber-800 rounded text-xs text-amber-400">
                      ⚠️ Coverage gap detected - Next pass in 4h
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Coverage Summary */}
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Active Platforms:</span>
                  <span className="ml-2 font-bold text-green-400">2/3</span>
                </div>
                <div>
                  <span className="text-slate-500">Coverage Gaps:</span>
                  <span className="ml-2 font-bold text-amber-400">1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Analysis Alerts */}
          <div className="p-4 bg-red-950/10 border border-red-900 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="text-red-400" size={16} />
              <h3 className="text-sm font-bold text-red-400 uppercase">Alternative Analysis Alerts</h3>
            </div>

            <div className="space-y-2">
              {/* Red Team Finding */}
              <div className="p-3 bg-slate-900/50 border border-red-800 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-red-900/50 border border-red-700 rounded text-xs font-bold text-red-300">
                    RED TEAM
                  </span>
                  <span className="text-xs text-slate-400">13:20Z</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold">Assumption Challenge:</span> Intel assumes C2 node is stationary.
                  Red team identifies pattern suggesting mobile backup node exists.
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-slate-500">Impact:</span>
                  <span className="ml-1 text-amber-400">Strike may not achieve desired effect if mobile backup takes over</span>
                </div>
              </div>

              {/* Cognitive Bias Alert */}
              <div className="p-3 bg-slate-900/50 border border-amber-800 rounded">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-amber-900/50 border border-amber-700 rounded text-xs font-bold text-amber-300">
                    COGNITIVE BIAS
                  </span>
                  <span className="text-xs text-slate-400">12:55Z</span>
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold">Confirmation Bias Detected:</span> 3 analysts focusing on SIGINT data
                  that confirms target location. Contradictory HUMINT report from yesterday being dismissed.
                </div>
                <button
                  onClick={() => navigate({ to: '/smartops/targeting/analysis' })}
                  className="mt-2 text-xs text-amber-400 hover:text-amber-300 font-medium uppercase transition-colors cursor-pointer"
                >
                  Review HUMINT Report →
                </button>
              </div>
            </div>
          </div>

          {/* Predictive Targeting Cues (AI/ML) */}
          <div className="p-4 bg-slate-800/30 border border-purple-700 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="text-purple-400" size={16} />
              <h3 className="text-sm font-bold text-white uppercase">AI/ML Predictive Cues</h3>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-purple-950/20 border border-purple-800 rounded">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400">HVT Appearance Window</span>
                  <span className="text-xs text-slate-400">87% confidence</span>
                </div>
                <div className="text-xs text-slate-300 mb-1">
                  Target: <span className="font-bold">Enemy Brigade Commander</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-purple-400" size={12} />
                  <span className="text-xs text-slate-400">
                    Predicted window: Tomorrow 09:00-10:30 local
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Based on: 47 historical patterns, current SIGINT, vehicle tracking
                </div>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-700 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Next update in:</span>
                  <span className="text-xs font-bold text-purple-400">23 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
