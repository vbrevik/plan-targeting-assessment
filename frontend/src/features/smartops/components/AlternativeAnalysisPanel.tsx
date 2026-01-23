// NATO COPD Component 7: Alternative Analysis Integration
// Assumption challenges, red team perspectives, cognitive bias alerts, devil's advocate questions
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Brain, Users, AlertCircle, HelpCircle, GitBranch, CheckCircle2 } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

interface AssumptionChallenge {
  id: string;
  assumption: string;
  confidenceLevel: number;
  alternativeHypothesis: string;
  evidenceSupporting: string[];
  evidenceContradicting: string[];
  status: 'VALID' | 'MONITORING' | 'CHALLENGED' | 'INVALIDATED';
}

interface RedTeamPerspective {
  analysisId: string;
  scenario: string;
  adversaryCOA: string;
  probability: number;
  ourVulnerability: string;
}

interface CognitiveBiasAlert {
  id: string;
  biasType: 'CONFIRMATION' | 'ANCHORING' | 'GROUPTHINK' | 'AVAILABILITY';
  description: string;
  evidence: string;
  recommendation: string;
}

interface DevilsAdvocateQuestion {
  id: string;
  question: string;
  context: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export function AlternativeAnalysisPanel() {
  const navigate = useNavigate();
  const [assumptions, setAssumptions] = useState<AssumptionChallenge[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challenges] = await Promise.all([
          targetingApi.getAssumptions().catch(() => []),
          targetingApi.getBiasAlerts().catch(() => []),
        ]);

        // Transform to component format
        const transformed: AssumptionChallenge[] = challenges.map((a) => ({
          id: a.id,
          assumption: a.assumption_text,
          confidenceLevel: a.confidence_level,
          alternativeHypothesis: a.alternative_hypothesis || '',
          evidenceSupporting: [],
          evidenceContradicting: [],
          status: a.validation_status as 'VALID' | 'CHALLENGED' | 'INVALIDATED' | 'MONITORING',
        }));
        setAssumptions(transformed);

        // Note: biasAlerts can be used for cognitive bias alerts section
      } catch (err) {
        console.error('Failed to fetch assumption challenges:', err);
        setAssumptions([]);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);


  const redTeam: RedTeamPerspective[] = [
    {
      analysisId: 'RT-2401',
      scenario: 'Strike on C2 Node Alpha',
      adversaryCOA: 'Adversary shifts to decentralized mobile command',
      probability: 65,
      ourVulnerability: 'ISR coverage gaps would allow adversary to operate unobserved'
    },
  ];

  const biasAlerts: CognitiveBiasAlert[] = [
    {
      id: 'BIAS-01',
      biasType: 'CONFIRMATION',
      description: 'Focusing only on SIGINT that supports target location while ignoring HUMINT warnings',
      evidence: '3 recent SIGINT reports favored over 1 contradictory HUMINT report',
      recommendation: 'Perform Double-Blind review of target location evidence'
    }
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
        {/* Assumption Challenge Board */}
        <div className="p-4 bg-amber-950/10 border border-amber-900 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="text-amber-400" size={16} />
            <h3 className="text-sm font-bold text-amber-400 uppercase">Assumption Challenges</h3>
          </div>

          {assumptions.map((assumption) => (
            <div
              key={assumption.id}
              onClick={() => navigate({ to: '/smartops/targeting' })}
              className="p-3 bg-slate-900/50 border border-amber-800 rounded hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${assumption.status === 'VALID' ? 'bg-green-900/50 text-green-400' :
                  assumption.status === 'MONITORING' ? 'bg-amber-900/50 text-amber-400' :
                    'bg-red-900/50 text-red-400'
                  }`}>
                  {assumption.status}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Confidence:</span>
                  <span className="text-sm font-bold text-white">{assumption.confidenceLevel}%</span>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-xs font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">Current Assumption:</div>
                <div className="text-xs text-slate-300">{assumption.assumption}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs font-bold text-amber-400 mb-1">Alternative Hypothesis:</div>
                <div className="text-xs text-slate-300">{assumption.alternativeHypothesis}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-green-400" />
                    <span>Supporting Evidence</span>
                  </div>
                  <ul className="space-y-1">
                    {assumption.evidenceSupporting.map((evidence, idx) => (
                      <li key={idx} className="text-xs text-slate-400 pl-3">• {evidence}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                    <AlertCircle size={10} className="text-red-400" />
                    <span>Contradicting Evidence</span>
                  </div>
                  <ul className="space-y-1">
                    {assumption.evidenceContradicting.map((evidence, idx) => (
                      <li key={idx} className="text-xs text-slate-400 pl-3">• {evidence}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Red Team Perspectives */}
        <div className="p-4 bg-red-950/10 border border-red-900 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Users className="text-red-400" size={16} />
            <h3 className="text-sm font-bold text-red-400 uppercase">Red Team Analysis</h3>
          </div>

          {redTeam.map((rt) => (
            <div
              key={rt.analysisId}
              onClick={() => navigate({ to: '/smartops/targeting' })}
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
                  onClick={() => navigate({ to: '/smartops/targeting/analysis' })}
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
            onClick={() => navigate({ to: '/smartops/targeting/analysis' })}
            className="mt-3 w-full px-3 py-2 bg-green-900/30 hover:bg-green-900/50 border border-green-700 rounded text-xs font-bold text-green-300 uppercase transition-colors cursor-pointer"
          >
            Access Full Scenario Library
          </button>
        </div>
      </div>
    </div>
  );
}
