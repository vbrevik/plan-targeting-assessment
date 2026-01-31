// NATO COPD Component 7: Alternative Analysis Integration
// Assumption challenges, red team perspectives, cognitive bias alerts, devil's advocate questions
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Brain, Users, AlertCircle, HelpCircle, GitBranch, Plus } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import { AssumptionService } from '@/lib/mshnctrl/services/AssumptionService';
import type { Assumption, AssumptionStatus } from '@/lib/mshnctrl/domain/assumption';


import { cn } from '@/lib/utils';
import { ImpactVisualizer } from './ImpactVisualizer';


// Missing Interfaces
interface CognitiveBiasAlert {
  id: string;
  biasType: string;
  description: string;
  evidence: string;
  recommendation: string;
}

interface RedTeamPerspective {
  analysisId: string;
  scenario: string;
  adversaryCOA: string;
  probability: number;
  ourVulnerability: string;
}

interface DevilsAdvocateQuestion {
  id: string;
  question: string;
  context: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}


export function AlternativeAnalysisPanel() {
  const navigate = useNavigate();
  // Legacy or other states
  const [biasAlerts, setBiasAlerts] = useState<CognitiveBiasAlert[]>([]);

  // New Interactive State
  const [interactiveAssumptions, setInteractiveAssumptions] = useState<Assumption[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assumptionsData, alerts] = await Promise.all([
          AssumptionService.getAssumptions(),
          targetingApi.getBiasAlerts().catch(() => []),
        ]);

        setInteractiveAssumptions(assumptionsData);

        // Transform Bias Alerts
        if (alerts && alerts.length > 0) {
          const transformedAlerts: CognitiveBiasAlert[] = alerts.map((b: any) => ({
            id: b.id,
            biasType: b.bias_type,
            description: b.description,
            evidence: b.evidence,
            recommendation: b.recommendation
          }));
          setBiasAlerts(transformedAlerts);
        }
      } catch (err) {
        console.error('Failed to fetch analysis data:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: AssumptionStatus) => {
    const newStatus = currentStatus === 'VALID' ? 'CHALLENGED' :
      currentStatus === 'CHALLENGED' ? 'INVALID' : 'VALID';

    // Optimistic update
    setInteractiveAssumptions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

    await AssumptionService.updateStatus(id, newStatus);
  };



  const redTeam: RedTeamPerspective[] = [
    {
      analysisId: 'RT-2401',
      scenario: 'Strike on C2 Node Alpha',
      adversaryCOA: 'Adversary shifts to decentralized mobile command',
      probability: 65,
      ourVulnerability: 'ISR coverage gaps would allow adversary to operate unobserved'
    },
  ];


  const devilsAdvocate: DevilsAdvocateQuestion[] = [
    {
      id: 'DAQ-01',
      question: 'What if the logistics hub is a decoy to draw out our ISR assets?',
      context: 'Historical adversary pattern of using inflatable decoys with heat signatures',
      priority: 'HIGH'
    },
    {
      id: 'DAQ-02',
      question: 'What happens to the civilian population if the power grid intersection is hit?',
      context: 'Destroying this logistics hub could force enemy to use faster mobile logistics, making them harder to target',
      priority: 'MEDIUM'
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-950/30 border border-amber-800 rounded-lg">
            <Brain className="text-amber-400" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Alternative Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Critical Thinking • Red Team • Bias Detection • Devil's Advocate
            </p>
          </div>
        </div>
        <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
      </div>

      <div className="space-y-4">
        {/* Interactive Assumption Table */}
        <div className="p-4 bg-amber-950/10 border border-amber-900 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-amber-400" size={16} />
              <h3 className="text-sm font-bold text-amber-400 uppercase">Operational Assumptions</h3>
            </div>
            <button className="px-3 py-1 bg-amber-900/20 text-amber-400 border border-amber-900/50 rounded text-xs font-bold uppercase hover:bg-amber-900/40 transition-colors">
              <Plus size={12} className="inline mr-1" /> New Assumption
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-amber-900/30 text-slate-500 uppercase tracking-wider">
                  <th className="pb-2 font-bold pl-2">Assumption</th>
                  <th className="pb-2 font-bold px-4">Category</th>
                  <th className="pb-2 font-bold text-center">Confidence</th>
                  <th className="pb-2 font-bold text-center">Status</th>
                  <th className="pb-2 font-bold text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/10">
                {interactiveAssumptions.map((asm) => (
                  <tr key={asm.id} className="hover:bg-amber-900/5 transition-colors group">
                    <td className="py-3 pl-2 max-w-xs">
                      <div className="font-medium text-slate-200">{asm.text}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Impact if false: <span className="text-red-400 font-bold">{asm.impactIfFalse}</span></div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{asm.category}</td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border",
                        asm.confidence === 'HIGH' ? "bg-green-950/30 text-green-500 border-green-900/30" :
                          asm.confidence === 'MEDIUM' ? "bg-yellow-950/30 text-yellow-500 border-yellow-900/30" :
                            "bg-red-950/30 text-red-500 border-red-900/30"
                      )}>
                        {asm.confidence}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(asm.id, asm.status)}
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold border transition-colors hover:scale-105",
                          asm.status === 'VALID' ? "bg-green-600/20 text-green-400 border-green-600/30" :
                            asm.status === 'CHALLENGED' ? "bg-orange-600/20 text-orange-400 border-orange-600/30" :
                              "bg-red-600/20 text-red-400 border-red-600/30"
                        )}
                        title="Click to toggle status"
                      >
                        {asm.status}
                      </button>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <button className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-white transition-colors">
                        <GitBranch size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {interactiveAssumptions.length === 0 && (
              <div className="py-6 text-center text-slate-500 italic">No active assumptions tracked.</div>
            )}
          </div>
        </div>

        {/* Impact Cascade Analysis */}
        <ImpactVisualizer assumptions={interactiveAssumptions} />

        {/* Red Team Perspectives */}
        <div className="p-4 bg-red-950/10 border border-red-900 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-red-400" size={16} />
            <h3 className="text-sm font-bold text-red-400 uppercase">Red Team Analysis</h3>
          </div>

          {redTeam.map((rt) => (
            <div
              key={rt.analysisId}
              onClick={() => navigate({ to: '/mshnctrl/targeting' })}
              className="p-3 bg-slate-900/50 border border-red-800 rounded hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="mb-2">
                <span className="text-xs font-bold text-white">Scenario: </span>
                <span className="text-xs text-slate-300">{rt.scenario}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold text-red-400">Adversary COA: </span>
                <span className="text-xs text-slate-300">{rt.adversaryCOA}</span>
              </div>
              <div className="mb-2">
                <span className="text-xs font-bold text-amber-400">Our Vulnerability: </span>
                <span className="text-xs text-slate-300">{rt.ourVulnerability}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Probability:</span>
                <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${rt.probability}%` }} />
                </div>
                <span className="text-xs font-bold text-red-400">{rt.probability}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Cognitive Bias Alerts */}
        <div className="p-4 bg-purple-950/10 border border-purple-900 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="text-purple-400" size={16} />
            <h3 className="text-sm font-bold text-purple-400 uppercase">Cognitive Bias Detection</h3>
          </div>

          <div className="space-y-2">
            {biasAlerts.map((bias) => (
              <div key={bias.id} className="p-3 bg-slate-900/50 border border-purple-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-purple-900/50 border border-purple-700 rounded text-xs font-bold text-purple-300">
                    {bias.biasType}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mb-2">
                  <span className="font-bold">Description:</span> {bias.description}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  <span className="font-bold">Evidence:</span> {bias.evidence}
                </div>
                <div className="p-2 bg-purple-950/20 border border-purple-800 rounded">
                  <div className="text-xs text-purple-400">
                    <span className="font-bold">Recommendation:</span> {bias.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Devil's Advocate Questions */}
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="text-cyan-400" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Devil's Advocate Questions</h3>
            <span className="text-xs text-slate-500">(Mandatory critical thinking prompts)</span>
          </div>

          <div className="space-y-2">
            {devilsAdvocate.map((question) => (
              <div key={question.id} className="p-3 bg-slate-900/50 border border-cyan-800 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${question.priority === 'HIGH' ? 'bg-red-900/50 text-red-400' :
                    question.priority === 'MEDIUM' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                    {question.priority}
                  </span>
                </div>
                <div className="text-sm font-bold text-cyan-400 mb-2">{question.question}</div>
                <div className="text-xs text-slate-400">{question.context}</div>
                <button
                  onClick={() => navigate({ to: '/mshnctrl/targeting/analysis' })}
                  className="mt-2 px-3 py-1 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700 rounded text-xs font-bold text-cyan-300 uppercase transition-colors cursor-pointer"
                >
                  Document Response
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Scenarios Widget */}
        <div className="p-4 bg-slate-800/30 border border-green-700 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="text-green-400" size={16} />
            <h3 className="text-sm font-bold text-white uppercase">Scenario Planning</h3>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded">
              <div className="text-xs font-bold text-green-400 mb-1">Branch Plan Alpha</div>
              <div className="text-xs text-slate-400 mb-2">
                If primary C2 strike fails or target relocates
              </div>
              <div className="text-xs text-slate-300">
                → Strike mobile backup node (intelligence confirms 3 likely locations)
              </div>
            </div>

            <div className="p-3 bg-slate-900/50 border border-slate-700 rounded">
              <div className="text-xs font-bold text-green-400 mb-1">Branch Plan Bravo</div>
              <div className="text-xs text-slate-400 mb-2">
                If collateral damage exceeds CDE threshold
              </div>
              <div className="text-xs text-slate-300">
                → Shift to precision munitions + smaller warhead (reduces CDE 70%)
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: '/mshnctrl/targeting/analysis' })}
            className="mt-3 w-full px-3 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded text-xs font-bold text-green-300 uppercase transition-colors cursor-pointer"
          >
            Access Full Scenario Library
          </button>
        </div>
      </div>
    </div>
  );
}
