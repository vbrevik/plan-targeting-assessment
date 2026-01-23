// NATO COPD Component 6: Risk & Constraints Monitor
// Fratricide risk, political sensitivity, legal review, second/third order effects
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Shield, Users, Building, Scale, AlertTriangle, TrendingUp } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

interface RiskAssessment {
  targetId: string;
  targetName: string;
  fratricideRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  friendlyDistance: number;
  politicalSensitivity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sensitiveSites: string[];
  legalReviewStatus: 'APPROVED' | 'PENDING' | 'IN_REVIEW' | 'REJECTED';
  proportionality: 'PROPORTIONAL' | 'QUESTIONABLE' | 'DISPROPORTIONATE';
  overallRiskScore: number;
}

interface OrderEffect {
  order: 'SECOND' | 'THIRD';
  category: string;
  description: string;
  probability: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function RiskConstraintsMonitor() {
  const navigate = useNavigate();
  const [highRiskTargets, setHighRiskTargets] = useState<RiskAssessment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const risks = await targetingApi.getHighRiskTargets();
        // Transform to component format - fetch target names
        const transformed: RiskAssessment[] = await Promise.all(
          risks.map(async (r) => {
            try {
              const target = await targetingApi.getTarget(r.target_id);

              // Extract friendly distance from risk assessment (already in km, convert to meters for display)
              const friendlyDistance = r.friendly_forces_distance_km
                ? Math.round(r.friendly_forces_distance_km * 1000) // Convert km to meters
                : 0;

              // Parse sensitive sites (if stored as JSON or comma-separated)
              let sensitiveSites: string[] = [];
              if (r.sensitive_sites_nearby) {
                try {
                  sensitiveSites = typeof r.sensitive_sites_nearby === 'string'
                    ? JSON.parse(r.sensitive_sites_nearby)
                    : r.sensitive_sites_nearby;
                } catch {
                  // If not JSON, try comma-separated
                  sensitiveSites = typeof r.sensitive_sites_nearby === 'string'
                    ? r.sensitive_sites_nearby.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : [];
                }
              }

              // Get proportionality (default to PROPORTIONAL if not available)
              const proportionality = r.proportionality_assessment || 'PROPORTIONAL';

              return {
                targetId: r.target_id,
                targetName: target.name,
                fratricideRisk: r.fratricide_risk as any,
                friendlyDistance,
                politicalSensitivity: r.political_sensitivity as any,
                sensitiveSites,
                legalReviewStatus: r.legal_review_status as any,
                proportionality: proportionality as any,
                overallRiskScore: r.overall_risk_score || 0,
              };
            } catch {
              return {
                targetId: r.target_id,
                targetName: `Target ${r.target_id.substring(0, 8)}`,
                fratricideRisk: r.fratricide_risk as any,
                friendlyDistance: r.friendly_forces_distance_km ? Math.round(r.friendly_forces_distance_km * 1000) : 0,
                politicalSensitivity: r.political_sensitivity as any,
                sensitiveSites: r.sensitive_sites_nearby
                  ? (typeof r.sensitive_sites_nearby === 'string'
                    ? r.sensitive_sites_nearby.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : [])
                  : [],
                legalReviewStatus: r.legal_review_status as any,
                proportionality: (r.proportionality_assessment || 'PROPORTIONAL') as any,
                overallRiskScore: r.overall_risk_score || 0,
              };
            }
          })
        );
        setHighRiskTargets(transformed);
      } catch (err) {
        console.error('Failed to fetch risk assessments:', err);
        setHighRiskTargets([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);



  const secondOrderEffects: OrderEffect[] = [
    {
      order: 'SECOND',
      category: 'Infrastructure',
      description: 'Power grid disruption affecting 50,000 civilians',
      probability: 65,
      impact: 'MEDIUM'
    },
    {
      order: 'SECOND',
      category: 'Population',
      description: 'Temporary displacement of 2,000 civilians from strike vicinity',
      probability: 80,
      impact: 'MEDIUM'
    },
  ];

  const thirdOrderEffects: OrderEffect[] = [
    {
      order: 'THIRD',
      category: 'Strategic',
      description: 'Increased regional support for adversary due to civilian impact',
      probability: 40,
      impact: 'HIGH'
    },
    {
      order: 'THIRD',
      category: 'Operational',
      description: 'Enemy disperses remaining assets, harder to locate',
      probability: 75,
      impact: 'MEDIUM'
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/30 border border-red-800 rounded-lg">
            <Shield className="text-red-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Risk & Constraints Monitor
            </h2>
            <p className="text-xs text-slate-400">
              Fratricide • Political Sensitivity • Legal Review • Order Effects
            </p>
          </div>
        </div>
        <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
      </div>

      {/* High-Risk Targets */}
      <div className="mb-4">
        <div className="text-xs font-bold text-slate-400 uppercase mb-3">
          High-Risk Targets Requiring Review
        </div>

        <div className="space-y-3">
          {highRiskTargets.map((risk) => (
            <button
              key={risk.targetId}
              onClick={() => navigate({ to: `/smartops/targeting/${risk.targetId}` })}
              className="w-full text-left p-4 bg-red-950/10 border border-red-900 rounded-lg hover:bg-red-950/20 transition-colors cursor-pointer"
              title={`Click to view ${risk.targetName} details`}
            >
              {/* Target Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs font-black text-white">
                    {risk.targetId}
                  </span>
                  <span className="text-sm font-bold text-white">{risk.targetName}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Overall Risk</div>
                  <div className={`text-lg font-black ${risk.overallRiskScore >= 8 ? 'text-red-400' :
                    risk.overallRiskScore >= 6 ? 'text-amber-400' :
                      'text-green-400'
                    }`}>
                    {risk.overallRiskScore.toFixed(1)}/10
                  </div>
                </div>
              </div>

              {/* Risk Grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Fratricide Risk */}
                <div className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Fratricide Risk</span>
                  </div>
                  <div className={`text-sm font-black ${risk.fratricideRisk === 'CRITICAL' || risk.fratricideRisk === 'HIGH' ? 'text-red-400' :
                    risk.fratricideRisk === 'MEDIUM' ? 'text-amber-400' :
                      'text-green-400'
                    }`}>
                    {risk.fratricideRisk}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Friendly forces {risk.friendlyDistance}km away
                  </div>
                </div>

                {/* Political Sensitivity */}
                <div className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Building size={12} className="text-amber-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Political Sensitivity</span>
                  </div>
                  <div className={`text-sm font-black ${risk.politicalSensitivity === 'CRITICAL' || risk.politicalSensitivity === 'HIGH' ? 'text-red-400' :
                    risk.politicalSensitivity === 'MEDIUM' ? 'text-amber-400' :
                      'text-green-400'
                    }`}>
                    {risk.politicalSensitivity}
                  </div>
                  {risk.sensitiveSites.length > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      {risk.sensitiveSites.join(', ')}
                    </div>
                  )}
                </div>

                {/* Legal Review */}
                <div className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Scale size={12} className="text-purple-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Legal Review (JAG)</span>
                  </div>
                  <div className={`text-sm font-black ${risk.legalReviewStatus === 'APPROVED' ? 'text-green-400' :
                    risk.legalReviewStatus === 'PENDING' || risk.legalReviewStatus === 'IN_REVIEW' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                    {risk.legalReviewStatus}
                  </div>
                </div>

                {/* Proportionality */}
                <div className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center gap-1 mb-1">
                    <Scale size={12} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase">Proportionality</span>
                  </div>
                  <div className={`text-sm font-black ${risk.proportionality === 'PROPORTIONAL' ? 'text-green-400' :
                    risk.proportionality === 'QUESTIONABLE' ? 'text-amber-400' :
                      'text-red-400'
                    }`}>
                    {risk.proportionality}
                  </div>
                </div>
              </div>

              {/* Action Required */}
              {(risk.legalReviewStatus === 'PENDING' || risk.proportionality === 'QUESTIONABLE') && (
                <div className="mt-3 p-2 bg-amber-950/20 border border-amber-800 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-amber-400" size={14} />
                    <span className="text-xs text-amber-400">Requires JAG review before approval</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate({ to: '/smartops/targeting/risk' }); }}
                    className="px-2 py-1 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700 rounded text-xs font-bold text-amber-300 uppercase transition-colors cursor-pointer"
                  >
                    Request Review
                  </button>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Second and Third Order Effects */}
      <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="text-cyan-400" size={16} />
          <h3 className="text-sm font-bold text-white uppercase">Predicted Order Effects</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Second Order */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Second Order</div>
            <div className="space-y-2">
              {secondOrderEffects.map((effect, idx) => (
                <div key={idx} className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{effect.category}</span>
                    <span className={`text-xs font-bold ${effect.impact === 'HIGH' ? 'text-red-400' :
                      effect.impact === 'MEDIUM' ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                      {effect.impact}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{effect.description}</div>
                  <div className="text-[10px] text-slate-600">
                    Probability: {effect.probability}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Third Order */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Third Order</div>
            <div className="space-y-2">
              {thirdOrderEffects.map((effect, idx) => (
                <div key={idx} className="p-2 bg-slate-900/50 border border-slate-700 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{effect.category}</span>
                    <span className={`text-xs font-bold ${effect.impact === 'HIGH' ? 'text-red-400' :
                      effect.impact === 'MEDIUM' ? 'text-amber-400' :
                        'text-green-400'
                      }`}>
                      {effect.impact}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-1">{effect.description}</div>
                  <div className="text-[10px] text-slate-600">
                    Probability: {effect.probability}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
