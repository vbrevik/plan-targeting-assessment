import { AlertOctagon, AlertTriangle, Shield, FileWarning } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskFactor } from '@/lib/smartops/types';

interface RiskFactorsSectionProps {
    factors: RiskFactor[];
}

export function RiskFactorsSection({ factors }: RiskFactorsSectionProps) {
    if (factors.length === 0) return null;

    const criticalFactors = factors.filter(f => f.severity === 'critical');
    const highFactors = factors.filter(f => f.severity === 'high');
    const mediumFactors = factors.filter(f => f.severity === 'medium');
    const lowFactors = factors.filter(f => f.severity === 'low');

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertOctagon size={16} className="text-red-500" />;
            case 'high':
                return <AlertTriangle size={16} className="text-amber-500" />;
            case 'medium':
                return <AlertTriangle size={16} className="text-blue-400" />;
            default:
                return <FileWarning size={16} className="text-slate-500" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'border-l-red-500 bg-red-950/20';
            case 'high':
                return 'border-l-amber-500 bg-amber-950/20';
            case 'medium':
                return 'border-l-blue-400 bg-blue-950/20';
            default:
                return 'border-l-slate-500 bg-slate-900/20';
        }
    };

    return (
        <div className="p-6 border-b-2 border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={18} />
                    Risk Factors Detected
                </h3>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30 rounded-full">
                    {factors.length} TOTAL
                </span>
            </div>

            <div className="space-y-3">
                {/* Critical Risks */}
                {criticalFactors.map((factor) => (
                    <div
                        key={factor.id}
                        className={cn(
                            "p-4 rounded-lg border-l-4 border border-slate-700",
                            getSeverityColor('critical')
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {getSeverityIcon('critical')}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black uppercase tracking-widest text-red-500">
                                        CRITICAL
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase">
                                        {factor.category}
                                    </span>
                                </div>
                                <p className="text-sm text-white font-bold leading-relaxed">
                                    {factor.description}
                                </p>
                                {factor.mitigation && (
                                    <div className="mt-2 text-xs text-slate-400 pl-3 border-l-2 border-slate-700">
                                        <span className="font-bold text-emerald-400">Mitigation:</span> {factor.mitigation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* High Risks */}
                {highFactors.map((factor) => (
                    <div
                        key={factor.id}
                        className={cn(
                            "p-4 rounded-lg border-l-4 border border-slate-700",
                            getSeverityColor('high')
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {getSeverityIcon('high')}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black uppercase tracking-widest text-amber-500">
                                        HIGH
                                    </span>
                                    <span className="text-xs text-slate-500 uppercase">
                                        {factor.category}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-200 leading-relaxed">
                                    {factor.description}
                                </p>
                                {factor.mitigation && (
                                    <div className="mt-2 text-xs text-slate-400 pl-3 border-l-2 border-slate-700">
                                        <span className="font-bold text-emerald-400">Mitigation:</span> {factor.mitigation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Medium & Low Risks (Collapsed) */}
                {(mediumFactors.length > 0 || lowFactors.length > 0) && (
                    <details className="group">
                        <summary className="cursor-pointer p-3 bg-slate-900/40 rounded border border-slate-700 hover:border-slate-600 transition-colors">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                Show {mediumFactors.length + lowFactors.length} additional risk{mediumFactors.length + lowFactors.length > 1 ? 's' : ''} (Medium/Low)
                            </span>
                        </summary>
                        <div className="mt-2 space-y-2 pl-4">
                            {mediumFactors.map((factor) => (
                                <div key={factor.id} className="p-3 rounded border-l-2 border-blue-400 bg-slate-900/20">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-black uppercase text-blue-400">MEDIUM:</span>
                                        <span className="text-xs text-slate-300 flex-1">{factor.description}</span>
                                    </div>
                                    {factor.mitigation && (
                                        <div className="text-xs text-slate-500 mt-1 ml-14">
                                            Mitigation: {factor.mitigation}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {lowFactors.map((factor) => (
                                <div key={factor.id} className="p-3 rounded border-l-2 border-slate-600 bg-slate-900/20">
                                    <div className="flex items-start gap-2">
                                        <span className="text-xs font-black uppercase text-slate-500">LOW:</span>
                                        <span className="text-xs text-slate-400 flex-1">{factor.description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </div>
    );
}
