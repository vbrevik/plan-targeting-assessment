import React from 'react';
import { Target, Shield, Clock, AlertTriangle } from 'lucide-react';
import { SecurityBadge, type ClassificationLevel } from '@/components/SecurityBadge';

/**
 * Mission Context Data Interface
 */
export interface MissionContextData {
    phase: {
        name: string;
        classification: ClassificationLevel;
        description: string;
    };
    priorityTargets: {
        classification: ClassificationLevel;
        categories: Array<{ name: string; priority: number }>;
    };
    constraints: {
        classification: ClassificationLevel;
        cdeLimit: number;
        noStrikeWindows: string[];
        restrictedAreas: string[];
    };
    commandersIntent: {
        classification: ClassificationLevel;
        summary: string;
    };
}

/**
 * MissionContextPanel Component
 * 
 * Displays operational context that frames all targeting decisions.
 * Answers: "Why are we doing this? What are the constraints?"
 * 
 * Mixed classification levels:
 * - Phase: CUI (unclassified operation name)
 * - Priority Targets: SECRET (target categories)
 * - Constraints: SECRET (operational limits)
 * - Commander's Intent: CUI (general guidance)
 * 
 * Follows targeting doctrine:
 * - Context drives decisions
 * - Constraints prevent violations
 * - Commander's intent guides priorities
 * 
 * @example
 * <MissionContextPanel />
 */
export function MissionContextPanel() {
    const [contextData] = React.useState<MissionContextData>({
        phase: {
            name: 'DECISIVE OPERATIONS',
            classification: 'CUI',
            description: 'Phase 3 of 3 - Degradation of enemy combat power',
        },
        priorityTargets: {
            classification: 'SECRET',
            categories: [
                { name: 'Enemy C2 nodes', priority: 1 },
                { name: 'A2/AD systems', priority: 2 },
                { name: 'Logistics hubs', priority: 3 },
                { name: 'Reserve formations', priority: 4 },
            ],
        },
        constraints: {
            classification: 'SECRET',
            cdeLimit: 50,
            noStrikeWindows: ['22:00-06:00 local', 'Friday prayer times'],
            restrictedAreas: ['Within 2km of cultural sites', 'Hospital buffer zones'],
        },
        commandersIntent: {
            classification: 'CUI',
            summary: 'Degrade enemy command and control while minimizing collateral damage. Priority: disrupt their decision cycle.',
        },
    });

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-blue-400" />
                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                        Mission Context
                    </h2>
                </div>
                <SecurityBadge level="SECRET" size="sm" />
            </div>

            <div className="p-6 space-y-4">
                {/* Operation Phase */}
                <div className="bg-blue-950/30 border border-blue-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-400 uppercase">
                            Current Phase
                        </span>
                        <SecurityBadge level={contextData.phase.classification} size="sm" />
                    </div>
                    <div className="text-lg font-black text-white mb-1">
                        {contextData.phase.name}
                    </div>
                    <div className="text-xs text-slate-400">
                        {contextData.phase.description}
                    </div>
                </div>

                {/* Priority Target Categories */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            Priority Targets
                        </span>
                        <SecurityBadge level={contextData.priorityTargets.classification} size="sm" />
                    </div>
                    <div className="space-y-2">
                        {contextData.priorityTargets.categories.map((category, index) => (
                            <div 
                                key={index}
                                className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded p-2"
                            >
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-950/50 text-red-400 border border-red-900 text-xs font-black">
                                    {category.priority}
                                </span>
                                <span className="text-xs font-semibold text-slate-300">
                                    {category.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Operational Constraints */}
                <div className="border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                Constraints
                            </span>
                        </div>
                        <SecurityBadge level={contextData.constraints.classification} size="sm" />
                    </div>
                    
                    <div className="space-y-3">
                        {/* CDE Limit */}
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-slate-300">
                                    CDE Limit: <span className="text-amber-400">{contextData.constraints.cdeLimit} casualties</span>
                                </div>
                            </div>
                        </div>

                        {/* No-Strike Windows */}
                        <div className="flex items-start gap-2">
                            <Clock className="w-3 h-3 text-slate-500 mt-0.5" />
                            <div className="flex-1">
                                <div className="text-xs font-semibold text-slate-300 mb-1">
                                    No-Strike Windows:
                                </div>
                                <div className="space-y-0.5">
                                    {contextData.constraints.noStrikeWindows.map((window, index) => (
                                        <div key={index} className="text-xs text-slate-400 pl-2">
                                            • {window}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Restricted Areas */}
                        {contextData.constraints.restrictedAreas.length > 0 && (
                            <div className="flex items-start gap-2">
                                <Shield className="w-3 h-3 text-slate-500 mt-0.5" />
                                <div className="flex-1">
                                    <div className="text-xs font-semibold text-slate-300 mb-1">
                                        Restricted Areas:
                                    </div>
                                    <div className="space-y-0.5">
                                        {contextData.constraints.restrictedAreas.map((area, index) => (
                                            <div key={index} className="text-xs text-slate-400 pl-2">
                                                • {area}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Commander's Intent */}
                <div className="border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">
                            Commander's Intent
                        </span>
                        <SecurityBadge level={contextData.commandersIntent.classification} size="sm" />
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                            "{contextData.commandersIntent.summary}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
