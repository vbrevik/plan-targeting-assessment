import { useState } from 'react';
import {
    X,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Clock,
    Users,
    FileText,
    Download,
    Share2,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Target,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Decision, DecisionAnalysis, ROEStatus } from '@/lib/mshnctrl/types';
import { OptionCard } from './OptionCard';
import { RiskFactorsSection } from './RiskFactorsSection';
import { DecisionSupport } from './DecisionSupport';
import { AssumptionService } from '@/lib/mshnctrl/services/AssumptionService';
import { AlertCircle } from 'lucide-react';

interface DecisionAnalysisPanelProps {
    decision: Decision;
    analysis: DecisionAnalysis;
    onClose: () => void;
    onSelectOption: (optionId: string) => void;
}

function getROEStatusDisplay(roeStatus: ROEStatus) {
    const statusMap = {
        within_approved_roe: {
            label: 'WITHIN APPROVED ROE',
            description: 'Can proceed under current Rules of Engagement',
            color: 'bg-emerald-950/50 border-emerald-500/60',
            textColor: 'text-emerald-400',
            icon: ShieldCheck,
            iconColor: 'text-emerald-400',
            severity: 'safe'
        },
        requires_roe_release: {
            label: 'REQUIRES NEW ROE',
            description: 'Requires new ROE authorization before proceeding',
            color: 'bg-red-950/50 border-red-500/60',
            textColor: 'text-red-400',
            icon: ShieldAlert,
            iconColor: 'text-red-400',
            severity: 'critical'
        },
        roe_pending_approval: {
            label: 'ROE RELEASE PENDING',
            description: 'ROE authorization request submitted, awaiting approval',
            color: 'bg-amber-950/50 border-amber-500/60',
            textColor: 'text-amber-400',
            icon: ShieldAlert,
            iconColor: 'text-amber-400',
            severity: 'warning'
        },
        roe_approved: {
            label: 'NEW ROE APPROVED',
            description: 'New ROE authorization approved, can now proceed',
            color: 'bg-blue-950/50 border-blue-500/60',
            textColor: 'text-blue-400',
            icon: ShieldCheck,
            iconColor: 'text-blue-400',
            severity: 'info'
        },
        roe_rejected: {
            label: 'ROE REQUEST REJECTED',
            description: 'ROE authorization rejected, cannot proceed',
            color: 'bg-red-950/50 border-red-500/60',
            textColor: 'text-red-400',
            icon: ShieldAlert,
            iconColor: 'text-red-400',
            severity: 'critical'
        }
    };
    return statusMap[roeStatus];
}

export function DecisionAnalysisPanel({
    decision,
    analysis,
    onClose,
    onSelectOption
}: DecisionAnalysisPanelProps) {
    const [showCascades, setShowCascades] = useState(false);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const handleExportPDF = () => {
        console.log('Exporting decision analysis as PDF...');
        // TODO: Implement PDF export
    };

    const handleShareStaff = () => {
        console.log('Sharing with staff...');
        // TODO: Implement staff sharing
    };

    const handleRequestConsultation = () => {
        console.log('Requesting consultation...');
        // TODO: Implement consultation request
    };

    const urgencyColors = {
        critical: 'border-red-500 bg-red-950/30',
        high: 'border-amber-500 bg-amber-950/30',
        medium: 'border-blue-500 bg-blue-950/30',
        low: 'border-slate-500 bg-slate-900/30'
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/98 overflow-y-auto backdrop-blur-sm">
            <div className="min-h-screen p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className={cn(
                        "p-8 rounded-t-2xl border-2",
                        urgencyColors[decision.urgency]
                    )}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <button
                                        onClick={onClose}
                                        className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                    <span className={cn(
                                        "px-3 py-1 text-xs font-black uppercase rounded-full",
                                        decision.urgency === 'critical' && 'bg-red-500/20 text-red-400 border border-red-500/30',
                                        decision.urgency === 'high' && 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
                                        decision.urgency === 'medium' && 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    )}>
                                        {decision.urgency} URGENCY
                                    </span>
                                    <span className="text-xs font-black uppercase text-slate-500 tracking-widest">
                                        DECISION ANALYSIS
                                    </span>
                                </div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
                                    {decision.title}
                                </h1>
                                <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                                    {decision.description}
                                </p>
                            </div>
                            {decision.deadline && (
                                <div className="flex flex-col items-end">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Deadline</span>
                                    <span className="text-2xl font-black text-white">{decision.deadline}</span>
                                </div>
                            )}
                        </div>

                        {/* Metadata Bar */}
                        <div className="flex items-center gap-6 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <Clock size={14} />
                                <span>Created: {new Date(decision.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span>Stakeholders: {decision.context.stakeholders.map(s => s.role).join(', ')}</span>
                            </div>
                            {decision.context.backgroundBriefId && (
                                <div className="flex items-center gap-2">
                                    <FileText size={14} />
                                    <span>Briefing: {decision.context.backgroundBriefId}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ROE Status Section */}
                    {decision.roeStatus && (() => {
                        const roeDisplay = getROEStatusDisplay(decision.roeStatus);
                        const ROEIcon = roeDisplay.icon;
                        return (
                            <div className={cn(
                                "border-x-2 border-2 p-6",
                                roeDisplay.color
                            )}>
                                <div className="flex items-start gap-4">
                                    <div className={cn(
                                        "p-3 rounded-lg",
                                        roeDisplay.severity === 'critical' && 'bg-red-500/20',
                                        roeDisplay.severity === 'warning' && 'bg-amber-500/20',
                                        roeDisplay.severity === 'safe' && 'bg-emerald-500/20',
                                        roeDisplay.severity === 'info' && 'bg-blue-500/20'
                                    )}>
                                        <ROEIcon size={28} className={roeDisplay.iconColor} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className={cn(
                                                "text-lg font-black uppercase tracking-wide",
                                                roeDisplay.textColor
                                            )}>
                                                {roeDisplay.label}
                                            </h3>
                                            {roeDisplay.severity === 'critical' && (
                                                <span className="px-2 py-0.5 bg-red-500/30 text-red-300 text-[9px] font-black uppercase rounded border border-red-500/50">
                                                    AUTHORIZATION REQUIRED
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-300 mb-2">
                                            {roeDisplay.description}
                                        </p>
                                        {decision.roeNotes && (
                                            <div className="mt-3 p-3 bg-slate-950/50 rounded border border-slate-700">
                                                <p className="text-xs text-slate-400">
                                                    <span className="font-bold text-slate-300">ROE Notes:</span>{' '}
                                                    {decision.roeNotes}
                                                </p>
                                            </div>
                                        )}
                                        {roeDisplay.severity === 'critical' && (
                                            <div className="mt-3 flex items-start gap-2 p-3 bg-red-950/30 rounded border border-red-500/30">
                                                <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                                                <p className="text-xs text-red-300">
                                                    <span className="font-bold">Action Required:</span> Submit ROE release request through appropriate channels before execution can be authorized.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Routing Blocking Status */}
                    {decision.routing && !decision.routing.can_proceed && (
                        <div className="border-x-2 border-2 p-6 bg-red-950/50 border-red-500/60">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-red-500/20">
                                    <AlertTriangle size={28} className="text-red-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-black uppercase tracking-wide text-red-400">
                                            ROUTING BLOCKED
                                        </h3>
                                        <span className="px-2 py-0.5 bg-red-500/30 text-red-300 text-[9px] font-black uppercase rounded border border-red-500/50">
                                            CANNOT PROCEED
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2">
                                        This decision cannot be routed to a meeting until ROE authorization is approved.
                                    </p>
                                    {decision.routing.routing_reason && (
                                        <div className="mt-3 p-3 bg-slate-950/50 rounded border border-slate-700">
                                            <p className="text-xs text-slate-400">
                                                <span className="font-bold text-slate-300">Blocking Reason:</span>{' '}
                                                {decision.routing.routing_reason}
                                            </p>
                                        </div>
                                    )}
                                    {decision.routing.venue_name && (
                                        <div className="mt-2 text-xs text-slate-400">
                                            <span className="font-bold text-slate-300">Current Status:</span>{' '}
                                            {decision.routing.venue_name}
                                        </div>
                                    )}
                                    {decision.roeStatus === 'requires_roe_release' && (
                                        <div className="mt-3 flex items-start gap-2 p-3 bg-red-950/30 rounded border border-red-500/30">
                                            <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                                            <p className="text-xs text-red-300">
                                                <span className="font-bold">Next Step:</span> Submit ROE release request. Once approved, this decision can be routed to the appropriate meeting.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Risk Factors Section */}
                    {analysis.riskFactors.length > 0 && (
                        <div className="border-x-2 border-slate-800 bg-slate-900/40">
                            <RiskFactorsSection factors={analysis.riskFactors} />
                        </div>
                    )}

                    {/* Trusted Data Layer: Assumption Linking */}
                    <div className="border-x-2 border-slate-800 bg-slate-900/20 p-6 border-b-2 border-b-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertCircle size={16} className="text-amber-400" />
                            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                                Key Operational Assumptions
                            </h3>
                        </div>

                        <div className="flex items-center gap-4">
                            <select
                                className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full max-w-md"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        // In a real app, this would call the API to link
                                        console.log(`Linking assumption ${e.target.value} to decision ${decision.id}`);
                                        AssumptionService.linkDecision(e.target.value, decision.id);
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Select an assumption to link...</option>
                                <option value="asm-001">Air Superiority maintained in Sector 4 (VALID)</option>
                                <option value="asm-002">MSR Alpha remains passable (CHALLENGED)</option>
                            </select>
                            <span className="text-xs text-slate-500">
                                Linking an assumption ensures this decision is flagged if the assumption changes status.
                            </span>
                        </div>
                    </div>

                    {/* Options Analysis */}
                    <div className="border-x-2 border-slate-800 bg-slate-950/80 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
                                <Target size={20} className="text-blue-400" />
                                Options Analysis
                                <span className="text-sm font-bold text-slate-500">
                                    ({decision.options.length} alternatives)
                                </span>
                            </h2>
                            <button
                                onClick={() => setShowCascades(!showCascades)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition-colors"
                            >
                                {showCascades ? (
                                    <>
                                        <ChevronUp size={14} />
                                        Hide Secondary Consequences
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown size={14} />
                                        Show Secondary Consequences
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="space-y-6">
                            {analysis.analyzedOptions.map((analyzedOption, index) => (
                                <OptionCard
                                    key={analyzedOption.option.id}
                                    analyzedOption={analyzedOption}
                                    recommended={analyzedOption.option.id === analysis.recommendation}
                                    selected={analyzedOption.option.id === selectedOptionId}
                                    onSelect={() => setSelectedOptionId(analyzedOption.option.id)}
                                    showCascades={showCascades}
                                    optionNumber={index + 1}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Decision Support */}
                    <div className="border-x-2 border-slate-800 bg-slate-900/40">
                        <DecisionSupport
                            cognitiveLoad={analysis.cognitiveLoadWarning}
                            precedents={analysis.precedents}
                            aiConfidence={analysis.aiConfidence}
                        />
                    </div>

                    {/* Action Bar */}
                    <div className="p-6 rounded-b-2xl border-2 border-slate-800 bg-slate-950 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleExportPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition-colors"
                            >
                                <Download size={14} />
                                Export as PDF
                            </button>
                            <button
                                onClick={handleShareStaff}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded transition-colors"
                            >
                                <Share2 size={14} />
                                Share with Staff
                            </button>
                            <button
                                onClick={handleRequestConsultation}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded transition-colors"
                            >
                                <MessageCircle size={14} />
                                Request Consultation
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Zap size={14} className="text-blue-400" />
                                <span>
                                    AI Confidence: <span className="text-white font-bold">{Math.round(analysis.aiConfidence * 100)}%</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
