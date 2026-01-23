// NATO COPD Component 8: Collaborative Workspace
// Multi-domain integration, chat/annotations, decision log, shift handover
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MessageSquare, FileText, Clock, Globe, Plane, Ship, Wifi, Satellite, Info, Users } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

interface DecisionLogEntry {
  id: string;
  timestamp: string;
  decisionType: string;
  decisionText: string;
  decisionMaker: string;
  authorityLevel: string;
  classification: string;
}

interface Annotation {
  id: string;
  targetId: string;
  user: string;
  text: string;
  timestamp: string;
  type: 'COMMENT' | 'QUESTION' | 'WARNING';
  isCritical: boolean;
}

interface MultiDomainStatus {
  domain: 'LAND' | 'AIR' | 'MARITIME' | 'CYBER' | 'SPACE' | 'INFO';
  status: 'ACTIVE' | 'STANDBY' | 'DEGRADED';
  operations: number;
  icon: React.ReactNode;
}

interface ShiftHandoverSummary {
  shift: string;
  outgoing: string;
  incoming: string;
  activeTargets: number;
  approvedTargets: number;
  pendingDecisions: number;
  criticalIssues: string[];
  recommendations: string[];
}

export function CollaborativeWorkspace() {
  const navigate = useNavigate();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch recent decisions and handovers
        const [decisions, handovers] = await Promise.all([
          targetingApi.listDecisions({ limit: 10 }).catch(() => []),
          targetingApi.listHandovers({ limit: 5 }).catch(() => []),
        ]);

        // Transform decisions to component format
        const transformedDecisions: DecisionLogEntry[] = decisions.map((d) => ({
          id: d.id,
          timestamp: d.decision_time ? d.decision_time.substring(11, 16) + 'Z' : new Date().toISOString().substring(11, 16) + 'Z',
          decisionType: d.decision_type,
          decisionText: d.decision_text,
          decisionMaker: d.decision_maker,
          authorityLevel: d.authority_level,
          classification: d.classification,
        }));

        setDecisions(transformedDecisions);

        // Note: Annotations require targetId - can be fetched when target is selected
        // Handovers can be displayed from handovers array
      } catch (err) {
        console.error('Failed to fetch annotations:', err);
        setAnnotations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Use real decisions if available, otherwise fallback to mock
  const recentDecisions: DecisionLogEntry[] = decisions.length > 0 ? decisions : [
    {
      id: 'DEC-045',
      timestamp: '13:25Z',
      decisionType: 'TARGET_APPROVAL',
      decisionText: 'Approved T-2401 (Enemy C2 Node) for strike',
      decisionMaker: 'COM JTF',
      authorityLevel: 'OPERATIONAL',
      classification: 'SECRET'
    },
    {
      id: 'DEC-044',
      timestamp: '12:50Z',
      decisionType: 'PRIORITY_CHANGE',
      decisionText: 'Elevated Category 1 targets to critical priority',
      decisionMaker: 'J3',
      authorityLevel: 'TACTICAL',
      classification: 'UNCLASS'
    },
  ];

  const fallbackAnnotations: Annotation[] = [
    {
      id: 'ANN-012',
      targetId: 'T-2401',
      user: 'J2 Analyst',
      text: 'Recent SIGINT indicates target may have mobile backup. Recommend ISR confirmation before strike.',
      timestamp: '13:15Z',
      type: 'WARNING',
      isCritical: true
    },
    {
      id: 'ANN-013',
      targetId: 'T-2402',
      user: 'Targeting Officer',
      text: 'CDE analysis complete. Estimated 5 civilian casualties. Within threshold.',
      timestamp: '12:30Z',
      type: 'COMMENT',
      isCritical: false
    },
  ];

  const multiDomainStatus: MultiDomainStatus[] = [
    { domain: 'LAND', status: 'ACTIVE', operations: 8, icon: <Users size={14} className="text-green-400" /> },
    { domain: 'AIR', status: 'ACTIVE', operations: 12, icon: <Plane size={14} className="text-blue-400" /> },
    { domain: 'MARITIME', status: 'STANDBY', operations: 2, icon: <Ship size={14} className="text-cyan-400" /> },
    { domain: 'CYBER', status: 'ACTIVE', operations: 5, icon: <Wifi size={14} className="text-purple-400" /> },
    { domain: 'SPACE', status: 'ACTIVE', operations: 3, icon: <Satellite size={14} className="text-amber-400" /> },
    { domain: 'INFO', status: 'ACTIVE', operations: 7, icon: <Info size={14} className="text-pink-400" /> },
  ];

  const shiftHandover: ShiftHandoverSummary = {
    shift: 'Day Shift → Night Shift',
    outgoing: 'Maj. Anderson',
    incoming: 'Capt. Rodriguez',
    activeTargets: 23,
    approvedTargets: 12,
    pendingDecisions: 7,
    criticalIssues: [
      'T-2403 has high political sensitivity - awaiting JAG review',
      'ISR-03 (Sentinel satellite) has coverage gap until 20:00Z',
    ],
    recommendations: [
      'Monitor T-2401 for mobile backup C2 node (SIGINT alert)',
      'Expedite legal review for T-2403 before tomorrow\'s JTB',
      'Request additional ISR coverage for AO-North sector',
    ]
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/30 border border-cyan-800 rounded-lg">
            <Globe className="text-cyan-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Collaborative Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Multi-Domain Ops • Decision Log • Shift Handover • Annotations
            </p>
          </div>
        </div>
        <SecurityBadge level="SECRET" size="sm" />
      </div>

      <div className="space-y-4">
        {/* Multi-Domain Integration View */}
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="text-xs font-bold text-slate-400 uppercase mb-3">
            Multi-Domain Operations Status
          </div>
          <div className="grid grid-cols-6 gap-2">
            {multiDomainStatus.map((domain) => (
              <div key={domain.domain} className="p-3 bg-slate-900/50 border border-slate-700 rounded text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  {domain.icon}
                  <span className={`w-2 h-2 rounded-full ${domain.status === 'ACTIVE' ? 'bg-green-500' :
                      domain.status === 'STANDBY' ? 'bg-amber-500' :
                        'bg-red-500'
                    }`} />
                </div>
                <div className="text-[10px] font-bold text-white uppercase mb-1">{domain.domain}</div>
                <div className="text-lg font-black text-blue-400">{domain.operations}</div>
                <div className="text-[9px] text-slate-600 uppercase">Ops</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Log (Recent) */}
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="text-purple-400" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Decision Log (Last 2 Hours)</h3>
          </div>

          <div className="space-y-2">
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="p-3 bg-slate-900/50 border border-slate-700 rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-700 border border-slate-600 rounded text-xs font-black text-white">
                      {decision.id}
                    </span>
                    <span className="text-xs text-slate-500">{decision.timestamp}</span>
                  </div>
                  <SecurityBadge level={decision.classification as any} size="sm" />
                </div>
                <div className="text-xs text-slate-300 mb-1">{decision.decisionText}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-500">By: <span className="text-white font-medium">{decision.decisionMaker}</span></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">Authority: <span className="text-purple-400 font-medium">{decision.authorityLevel}</span></span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate({ to: '/smartops/targeting/collaboration' })}
            className="mt-3 w-full text-xs text-purple-400 hover:text-purple-300 font-medium uppercase transition-colors cursor-pointer"
          >
            View Complete Decision Log →
          </button>
        </div>

        {/* Target Annotations */}
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="text-amber-400" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Recent Annotations</h3>
          </div>

          <div className="space-y-2">
            {(annotations.length > 0 ? annotations : fallbackAnnotations).map((annotation) => (
              <div key={annotation.id} className={`p-3 rounded ${annotation.isCritical
                  ? 'bg-red-950/20 border-2 border-red-800'
                  : 'bg-slate-900/50 border border-slate-700'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${annotation.type === 'WARNING' ? 'bg-red-900/50 text-red-400' :
                        annotation.type === 'QUESTION' ? 'bg-amber-900/50 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                      }`}>
                      {annotation.type}
                    </span>
                    <span className="text-xs text-slate-500">on {annotation.targetId}</span>
                  </div>
                  <span className="text-xs text-slate-600">{annotation.timestamp}</span>
                </div>
                <div className={`text-xs mb-1 ${annotation.isCritical ? 'text-red-300 font-medium' : 'text-slate-300'}`}>
                  {annotation.text}
                </div>
                <div className="text-xs text-slate-500">
                  — {annotation.user}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Handover Summary */}
        <div className="p-4 bg-blue-950/10 border border-blue-900 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="text-blue-400" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Shift Handover Summary</h3>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">{shiftHandover.shift}</span>
              <span className="text-xs text-slate-500">
                {shiftHandover.outgoing} → {shiftHandover.incoming}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 bg-slate-900/50 border border-slate-700 rounded text-center">
                <div className="text-lg font-black text-white">{shiftHandover.activeTargets}</div>
                <div className="text-[10px] text-slate-500 uppercase">Active Targets</div>
              </div>
              <div className="p-2 bg-slate-900/50 border border-green-800 rounded text-center">
                <div className="text-lg font-black text-green-400">{shiftHandover.approvedTargets}</div>
                <div className="text-[10px] text-slate-500 uppercase">Approved</div>
              </div>
              <div className="p-2 bg-slate-900/50 border border-amber-800 rounded text-center">
                <div className="text-lg font-black text-amber-400">{shiftHandover.pendingDecisions}</div>
                <div className="text-[10px] text-slate-500 uppercase">Pending</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs font-bold text-red-400 uppercase mb-2">Critical Issues</div>
              <ul className="space-y-1">
                {shiftHandover.criticalIssues.map((issue, idx) => (
                  <li key={idx} className="text-xs text-slate-300 pl-3">• {issue}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-green-400 uppercase mb-2">Recommendations</div>
              <ul className="space-y-1">
                {shiftHandover.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-300 pl-3">• {rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: '/smartops/targeting/collaboration' })}
            className="w-full px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-700 rounded text-xs font-bold text-blue-300 uppercase transition-colors cursor-pointer"
          >
            Generate Full Handover Report
          </button>
        </div>
      </div>
    </div>
  );
}
