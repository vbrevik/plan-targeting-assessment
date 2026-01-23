import {
    Brain,
    Coffee,
    Users,
    Clock,
    FileText,
    Lightbulb,
    Zap,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionSupportProps {
    cognitiveLoad?: {
        timeOnDuty: number; // minutes
        fatigueLevel: 'low' | 'medium' | 'high' | 'critical';
        recommendConsultation: boolean;
        recommendBreak: boolean;
    };
    precedents: {
        decisionId: string;
        title: string;
        date: string;
        chosenOption: string;
        outcome: string;
    }[];
    aiConfidence: number; // 0-1
}

export function DecisionSupport({
    cognitiveLoad,
    precedents,
    aiConfidence
}: DecisionSupportProps) {
    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const getFatigueColor = (level: string) => {
        switch (level) {
            case 'critical':
                return 'text-red-500';
            case 'high':
                return 'text-amber-500';
            case 'medium':
                return 'text-blue-400';
            default:
                return 'text-emerald-500';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <Lightbulb size={16} />
                Decision Support
            </h3>

            {/* Cognitive Load Warning */}
            {cognitiveLoad && cognitiveLoad.fatigueLevel !== 'low' && (
                <div className={cn(
                    "p-6 rounded-lg border-2",
                    cognitiveLoad.fatigueLevel === 'critical' && "bg-red-950/30 border-red-500",
                    cognitiveLoad.fatigueLevel === 'high' && "bg-amber-950/30 border-amber-500",
                    cognitiveLoad.fatigueLevel === 'medium' && "bg-blue-950/30 border-blue-500"
                )}>
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "p-3 rounded-lg",
                            cognitiveLoad.fatigueLevel === 'critical' && "bg-red-500/20",
                            cognitiveLoad.fatigueLevel === 'high' && "bg-amber-500/20",
                            cognitiveLoad.fatigueLevel === 'medium' && "bg-blue-500/20"
                        )}>
                            <Brain size={24} className={getFatigueColor(cognitiveLoad.fatigueLevel)} />
                        </div>
                        <div className="flex-1">
                            <h4 className={cn(
                                "text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2",
                                getFatigueColor(cognitiveLoad.fatigueLevel)
                            )}>
                                <AlertTriangle size={14} />
                                Cognitive Load Warning
                            </h4>
                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-slate-500" />
                                    <span>
                                        Time on duty: <span className="font-bold text-white">{formatDuration(cognitiveLoad.timeOnDuty)}</span>
                                        <span className={cn(
                                            "ml-2 text-xs font-black uppercase",
                                            getFatigueColor(cognitiveLoad.fatigueLevel)
                                        )}>
                                            ({cognitiveLoad.fatigueLevel} fatigue)
                                        </span>
                                    </span>
                                </div>

                                {cognitiveLoad.recommendConsultation && (
                                    <div className="flex items-start gap-2 mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                                        <Users size={14} className="text-blue-400 mt-0.5" />
                                        <div>
                                            <span className="text-xs font-bold text-blue-400">RECOMMENDED:</span>
                                            <span className="text-xs text-slate-300 ml-2">
                                                Consider consulting Deputy Commander (available now)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {cognitiveLoad.recommendBreak && (
                                    <div className="flex items-start gap-2 mt-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
                                        <Coffee size={14} className="text-emerald-400 mt-0.5" />
                                        <div>
                                            <span className="text-xs font-bold text-emerald-400">SUGGESTED:</span>
                                            <span className="text-xs text-slate-300 ml-2">
                                                Take 20-minute break before deciding (improves quality 25%)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Precedents */}
            {precedents.length > 0 && (
                <div className="p-6 bg-slate-900/40 rounded-lg border border-slate-700">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                        <FileText size={14} />
                        Similar Past Decisions ({precedents.length} precedents found)
                    </h4>
                    <div className="space-y-3">
                        {precedents.map((precedent) => (
                            <div
                                key={precedent.decisionId}
                                className="p-4 bg-slate-950/60 rounded border border-slate-800 hover:border-blue-500/40 transition-colors cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h5 className="text-sm font-bold text-white mb-1">
                                            {precedent.title}
                                        </h5>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span>{new Date(precedent.date).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span className="text-blue-400 font-bold">
                                                {precedent.chosenOption}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-slate-400 pl-3 border-l-2 border-slate-700">
                                    <span className="font-bold">Outcome:</span> {precedent.outcome}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Confidence */}
            <div className="p-4 bg-blue-950/20 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap size={16} className="text-blue-400" />
                        <div>
                            <span className="text-xs font-black uppercase tracking-widest text-blue-400">
                                AI Analysis Confidence
                            </span>
                            <div className="text-xs text-slate-400 mt-0.5">
                                Based on historical decisions, environmental factors, and current metrics
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${aiConfidence * 100}%` }}
                            />
                        </div>
                        <span className="text-2xl font-black text-white">
                            {Math.round(aiConfidence * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Research Note */}
            <div className="text-xs text-slate-600 italic text-center pt-4 border-t border-slate-800">
                Decision support based on scenario analysis, trade-off modeling, and historical precedent matching
            </div>
        </div>
    );
}
