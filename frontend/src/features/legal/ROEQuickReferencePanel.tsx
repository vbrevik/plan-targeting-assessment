import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, AlertCircle } from 'lucide-react';
import { SecurityBadge, type ClassificationLevel, type Caveat } from '@/components/SecurityBadge';
import { Link } from '@tanstack/react-router';

/**
 * ROE Level Interface
 */
export interface ROELevel {
    level: number;
    name: string;
    color: 'green' | 'amber' | 'red';
    active: boolean;
    rules: string[];
}

/**
 * ROE Data Interface
 */
export interface ROEData {
    classification: ClassificationLevel;
    caveats?: Caveat[];
    currentLevel: number;
    levels: ROELevel[];
    prohibitedTargets: string[];
    restrictedTargets: string[];
    issuingAuthority: string;
    effectiveDate: string;
    lastUpdated: string;
}

/**
 * ROEQuickReferencePanel Component
 * 
 * Always-visible ROE reference panel for the right column.
 * Critical for targeting operations - ROE governs EVERY decision.
 * 
 * Design Philosophy:
 * - Always visible, never hidden
 * - Current ROE level prominently displayed
 * - Color-coded for instant recognition (Green/Yellow/Red)
 * - Quick reference bullet points
 * - Link to full ROE card
 * - Prohibited targets list (can't miss this)
 * 
 * Follows J3 dashboard style:
 * - Dark background, clean borders
 * - Status indicators with colors
 * - Compact but readable
 * - Classification badge in header
 * 
 * @example
 * <ROEQuickReferencePanel />
 */
export function ROEQuickReferencePanel() {
    const [roeData, setRoeData] = useState<ROEData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchROEData();
        // Refresh every 60 seconds (ROE can change)
        const interval = setInterval(fetchROEData, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchROEData = async () => {
        try {
            // Get ROE status from decision gates
            const { targetingApi } = await import('@/lib/mshnctrl/api/targeting.api');
            const gates = await targetingApi.getDecisionGates().catch(() => null);
            
            if (gates && gates.roe) {
                // Map decision gate ROE status to ROE data structure
                const roeStatus = gates.roe.value.toUpperCase();
                let currentLevel = 2; // Default to WEAPON RESTRICTED
                let activeLevel = 2;
                
                if (roeStatus.includes('WEAPON FREE') || roeStatus.includes('FREE')) {
                    currentLevel = 3;
                    activeLevel = 3;
                } else if (roeStatus.includes('WEAPON TIGHT') || roeStatus.includes('TIGHT')) {
                    currentLevel = 1;
                    activeLevel = 1;
                }
                
                const roeData: ROEData = {
                    classification: gates.roe.classification,
                    caveats: gates.roe.caveats || ['NOFORN'],
                    currentLevel,
                    levels: [
                        {
                            level: 3,
                            name: 'WEAPON FREE',
                            color: 'green',
                            active: activeLevel === 3,
                            rules: [
                                'Self-defense authorized',
                                'Attack approved targets',
                                'No additional clearance needed',
                                'Report all engagements',
                            ],
                        },
                        {
                            level: 2,
                            name: 'WEAPON RESTRICTED',
                            color: 'amber',
                            active: activeLevel === 2,
                            rules: [
                                'Command approval required',
                                'Positive target ID mandatory',
                                'CDE analysis required',
                            ],
                        },
                        {
                            level: 1,
                            name: 'WEAPON TIGHT',
                            color: 'red',
                            active: activeLevel === 1,
                            rules: [
                                'Fire only in self-defense',
                                'All strikes require CDR approval',
                                'Immediate reporting required',
                            ],
                        },
                    ],
                    prohibitedTargets: [
                        'Cultural heritage sites',
                        'Medical facilities',
                        'Religious structures',
                        'Civilian infrastructure (unless dual-use)',
                    ],
                    restrictedTargets: [
                        'Dual-use infrastructure',
                        'Urban targets with CDE > 50',
                        'Targets within 500m of hospitals',
                    ],
                    issuingAuthority: 'CENTCOM J3',
                    effectiveDate: new Date().toISOString().split('T')[0],
                    lastUpdated: new Date().toISOString(),
                };
                
                setRoeData(roeData);
                setLoading(false);
                return;
            }
            
            // Fallback to mock data if API fails
            const mockData: ROEData = {
                classification: 'SECRET',
                caveats: ['NOFORN'],
                currentLevel: 3,
                levels: [
                    {
                        level: 3,
                        name: 'WEAPON FREE',
                        color: 'green',
                        active: true,
                        rules: [
                            'Self-defense authorized',
                            'Attack approved targets',
                            'No additional clearance needed',
                            'Report all engagements',
                        ],
                    },
                    {
                        level: 2,
                        name: 'WEAPON RESTRICTED',
                        color: 'amber',
                        active: false,
                        rules: [
                            'Command approval required',
                            'Positive target ID mandatory',
                            'CDE analysis required',
                        ],
                    },
                    {
                        level: 1,
                        name: 'WEAPON TIGHT',
                        color: 'red',
                        active: false,
                        rules: [
                            'Fire only in self-defense',
                            'All strikes require CDR approval',
                            'Immediate reporting required',
                        ],
                    },
                ],
                prohibitedTargets: [
                    'Cultural heritage sites',
                    'Medical facilities',
                    'Religious structures',
                    'Civilian infrastructure (unless dual-use)',
                ],
                restrictedTargets: [
                    'Dual-use infrastructure',
                    'Urban targets with CDE > 50',
                    'Targets within 500m of hospitals',
                ],
                issuingAuthority: 'CENTCOM J3',
                effectiveDate: '2026-01-15',
                lastUpdated: '2026-01-20 08:00Z',
            };
            
            setRoeData(mockData);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch ROE data:', error);
            setLoading(false);
        }
    };

    if (loading || !roeData) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center">
                <div className="text-slate-500">Loading ROE data...</div>
            </div>
        );
    }

    const activeLevelConfig = {
        green: {
            bg: 'bg-green-950/50',
            text: 'text-green-400',
            border: 'border-green-900',
            dot: 'bg-green-500',
        },
        amber: {
            bg: 'bg-amber-950/50',
            text: 'text-amber-400',
            border: 'border-amber-900',
            dot: 'bg-amber-500',
        },
        red: {
            bg: 'bg-red-950/50',
            text: 'text-red-400',
            border: 'border-red-900',
            dot: 'bg-red-500',
        },
    };

    const activeLevel = roeData.levels.find(l => l.active);
    const config = activeLevel ? activeLevelConfig[activeLevel.color] : activeLevelConfig.amber;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h2 className="font-black uppercase text-sm text-white tracking-tight">
                        ROE Quick Reference
                    </h2>
                </div>
                <SecurityBadge 
                    level={roeData.classification}
                    caveats={roeData.caveats}
                    size="sm"
                />
            </div>

            <div className="p-6 space-y-4">
                {/* Current ROE Level */}
                <div className={`border rounded-lg p-4 ${config.bg} ${config.border}`}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.dot} animate-pulse`}></div>
                            <span className={`text-lg font-black uppercase ${config.text}`}>
                                {activeLevel?.name || 'UNKNOWN'}
                            </span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${config.bg} ${config.text} ${config.border}`}>
                            LEVEL {roeData.currentLevel}
                        </span>
                    </div>
                    
                    {/* Rules for current level */}
                    <div className="space-y-1.5">
                        {activeLevel?.rules.map((rule, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <span className={`${config.text} font-bold`}>•</span>
                                <span className="text-xs text-slate-300">{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other ROE Levels (collapsed) */}
                <div className="space-y-2">
                    {roeData.levels.filter(l => !l.active).map(level => {
                        const levelConfig = activeLevelConfig[level.color];
                        return (
                            <div key={level.level} className="border border-slate-700 rounded p-3 bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${levelConfig.dot} opacity-50`}></div>
                                    <span className={`text-xs font-bold uppercase ${levelConfig.text} opacity-70`}>
                                        {level.name}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        (Level {level.level})
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Prohibited Targets */}
                <div className="border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-black text-red-400 uppercase">
                            Prohibited Targets
                        </span>
                    </div>
                    <div className="space-y-1">
                        {roeData.prohibitedTargets.map((target, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <span className="text-red-500 font-bold text-xs">✗</span>
                                <span className="text-xs text-slate-400">{target}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Restricted Targets */}
                {roeData.restrictedTargets.length > 0 && (
                    <div className="border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-black text-amber-400 uppercase">
                                Restricted (Approval Required)
                            </span>
                        </div>
                        <div className="space-y-1">
                            {roeData.restrictedTargets.map((target, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <span className="text-amber-500 font-bold text-xs">⚠</span>
                                    <span className="text-xs text-slate-400">{target}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer - Authority & Link */}
                <div className="border-t border-slate-800 pt-4">
                    <div className="flex items-center justify-between text-xs">
                        <div>
                            <div className="text-slate-500 mb-0.5">Authority</div>
                            <div className="text-slate-300 font-semibold">{roeData.issuingAuthority}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-slate-500 mb-0.5">Updated</div>
                            <div className="text-slate-300 font-semibold">{roeData.lastUpdated}</div>
                        </div>
                    </div>
                    
                    <Link
                        to="/mshnctrl/roe"
                        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded hover:border-blue-600 hover:bg-blue-950/20 transition-colors group"
                    >
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white uppercase">
                            Full ROE Card
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
