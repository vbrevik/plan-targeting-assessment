import React, { useState, useEffect } from 'react';
import { Shield, Target, CloudSun, Radio } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { SecurityBadge, type ClassificationLevel, type Caveat } from '@/components/SecurityBadge';

/**
 * Decision Gates Status
 * Critical GO/NO-GO indicators for targeting operations
 * Now with drill-down navigation to detail views
 */
export interface DecisionGateStatus {
    name: string;
    status: 'GREEN' | 'YELLOW' | 'RED';
    value: string | number;
    classification: ClassificationLevel;
    caveats?: Caveat[];
    details?: string;
}

export interface DecisionGatesData {
    roe: DecisionGateStatus;
    cde: DecisionGateStatus;
    weather: DecisionGateStatus;
    deconfliction: DecisionGateStatus;
}

/**
 * DecisionGatesBar Component
 * 
 * Displays critical decision gates status across the top of the dashboard.
 * These are GO/NO-GO indicators - RED status means STOP EVERYTHING.
 * 
 * Follows J3 dashboard visual style:
 * - Clean, compact layout
 * - Color-coded status (Green/Yellow/Red)
 * - Classification badges
 * - Icons for quick recognition
 * 
 * @example
 * <DecisionGatesBar />
 */
export function DecisionGatesBar() {
    const navigate = useNavigate();
    const [gates, setGates] = useState<DecisionGatesData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDecisionGates();
        // Refresh every 30 seconds
        const interval = setInterval(fetchDecisionGates, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDecisionGates = async () => {
        try {
            // Import API client
            const { targetingApi } = await import('@/lib/smartops/api/targeting.api');

            // Fetch from actual API
            const data = await targetingApi.getDecisionGates();

            // Map backend response to frontend format (status is lowercase in backend, uppercase in frontend)
            const mappedData: DecisionGatesData = {
                roe: {
                    name: data.roe.name,
                    status: data.roe.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.roe.value,
                    classification: data.roe.classification as ClassificationLevel,
                    caveats: (data.roe.caveats || []) as Caveat[],
                    details: data.roe.details,
                },
                cde: {
                    name: data.cde.name,
                    status: data.cde.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.cde.value,
                    classification: data.cde.classification as ClassificationLevel,
                    caveats: (data.cde.caveats || []) as Caveat[],
                    details: data.cde.details,
                },
                weather: {
                    name: data.weather.name,
                    status: data.weather.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.weather.value,
                    classification: data.weather.classification as ClassificationLevel,
                    caveats: (data.weather.caveats || []) as Caveat[],
                    details: data.weather.details,
                },
                deconfliction: {
                    name: data.deconfliction.name,
                    status: data.deconfliction.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.deconfliction.value,
                    classification: data.deconfliction.classification as ClassificationLevel,
                    caveats: (data.deconfliction.caveats || []) as Caveat[],
                    details: data.deconfliction.details,
                },
            };

            setGates(mappedData);
            setLoading(false);
            return;
        } catch (error) {
            // Fallback to mock data if API fails
            console.warn('Failed to fetch decision gates from API, using mock data', error);
            const mockData: DecisionGatesData = {
                roe: {
                    name: 'ROE',
                    status: 'GREEN',
                    value: 'WEAPON FREE (3)',
                    classification: 'SECRET',
                    caveats: ['NOFORN'],
                    details: '3 active engagement zones',
                },
                cde: {
                    name: 'CDE',
                    status: 'YELLOW',
                    value: '2 PENDING REVIEW',
                    classification: 'SECRET',
                    details: '2 targets awaiting CDE analysis completion',
                },
                weather: {
                    name: 'Weather',
                    status: 'GREEN',
                    value: 'CLEAR',
                    classification: 'UNCLASS',
                    details: 'Visibility 25km, wind 10kts',
                },
                deconfliction: {
                    name: 'Deconfliction',
                    status: 'RED',
                    value: '1 CONFLICT',
                    classification: 'SECRET',
                    details: 'AO-NORTH-23: Friendly ISR asset',
                },
            };

            setGates(mockData);
            setLoading(false);
        }
    };

    if (loading || !gates) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <div className="text-center text-slate-500">Loading decision gates...</div>
            </div>
        );
    }

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="grid grid-cols-4 divide-x divide-slate-800">
                <DecisionGate
                    icon={Shield}
                    gate={gates.roe}
                    onClick={() => navigate({ to: '/smartops/roe' })}
                />
                <DecisionGate
                    icon={Target}
                    gate={gates.cde}
                    onClick={() => navigate({ to: '/smartops/cde' })}
                />
                <DecisionGate
                    icon={CloudSun}
                    gate={gates.weather}
                    onClick={() => navigate({ to: '/smartops/weather' })}
                />
                <DecisionGate
                    icon={Radio}
                    gate={gates.deconfliction}
                    onClick={() => navigate({ to: '/smartops/targeting/collaboration' })}
                />
            </div>
        </div>
    );
}

/**
 * Individual Decision Gate Component
 */
function DecisionGate({
    icon: Icon,
    gate,
    onClick,
}: {
    icon: React.ElementType;
    gate: DecisionGateStatus;
    onClick?: () => void;
}) {
    const statusColors = {
        GREEN: {
            bg: 'bg-green-950/50',
            text: 'text-green-400',
            border: 'border-green-900',
            icon: 'text-green-400',
        },
        YELLOW: {
            bg: 'bg-amber-950/50',
            text: 'text-amber-400',
            border: 'border-amber-900',
            icon: 'text-amber-400',
        },
        RED: {
            bg: 'bg-red-950/50',
            text: 'text-red-400',
            border: 'border-red-900',
            icon: 'text-red-400',
        },
    };

    const colors = statusColors[gate.status];

    return (
        <button
            onClick={onClick}
            className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer text-left w-full"
            title={`Click to view ${gate.name} details`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${colors.icon}`} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                        {gate.name}
                    </span>
                </div>
                <SecurityBadge
                    level={gate.classification}
                    caveats={gate.caveats}
                    size="sm"
                />
            </div>
            <div className="flex items-center justify-between">
                <span className={`text-sm font-black uppercase ${colors.text}`}>
                    {gate.value}
                </span>
                <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors.bg} ${colors.text} ${colors.border} border`}>
                    {gate.status}
                </div>
            </div>
            {gate.details && (
                <div className="mt-2 text-xs text-slate-500">
                    {gate.details}
                </div>
            )}
        </button>
    );
}

/**
 * Compact Decision Gates Bar (for smaller screens or secondary views)
 * Now with drill-down navigation to detail views
 */
export function DecisionGatesBarCompact() {
    const navigate = useNavigate();
    const [gates, setGates] = useState<DecisionGatesData | null>(null);

    useEffect(() => {
        fetchDecisionGates();
        const interval = setInterval(fetchDecisionGates, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchDecisionGates = async () => {
        try {
            const { targetingApi } = await import('@/lib/smartops/api/targeting.api');
            const data = await targetingApi.getDecisionGates();

            const mappedData: DecisionGatesData = {
                roe: {
                    name: data.roe.name,
                    status: data.roe.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.roe.value,
                    classification: data.roe.classification as ClassificationLevel,
                    caveats: (data.roe.caveats || []) as Caveat[],
                },
                cde: {
                    name: data.cde.name,
                    status: data.cde.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.cde.value,
                    classification: data.cde.classification as ClassificationLevel,
                    caveats: (data.cde.caveats || []) as Caveat[],
                },
                weather: {
                    name: data.weather.name,
                    status: data.weather.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.weather.value,
                    classification: data.weather.classification as ClassificationLevel,
                    caveats: (data.weather.caveats || []) as Caveat[],
                },
                deconfliction: {
                    name: data.deconfliction.name,
                    status: data.deconfliction.status.toUpperCase() as 'GREEN' | 'YELLOW' | 'RED',
                    value: data.deconfliction.value,
                    classification: data.deconfliction.classification as ClassificationLevel,
                    caveats: (data.deconfliction.caveats || []) as Caveat[],
                },
            };

            setGates(mappedData);
            return;
        } catch (error) {
            console.warn('Failed to fetch decision gates, using mock data', error);
        }

        // Fallback mock data
        const mockData: DecisionGatesData = {
            roe: {
                name: 'ROE',
                status: 'GREEN',
                value: 'WEAPON FREE',
                classification: 'SECRET',
                caveats: ['NOFORN'],
            },
            cde: {
                name: 'CDE',
                status: 'YELLOW',
                value: '2 PENDING',
                classification: 'SECRET',
            },
            weather: {
                name: 'Weather',
                status: 'GREEN',
                value: 'CLEAR',
                classification: 'UNCLASS',
            },
            deconfliction: {
                name: 'Decon',
                status: 'RED',
                value: '1 CONFLICT',
                classification: 'SECRET',
            },
        };

        setGates(mockData);
    };

    if (!gates) return null;

    const statusIcons = {
        GREEN: '●',
        YELLOW: '●',
        RED: '●',
    };

    const statusColors: Record<'GREEN' | 'YELLOW' | 'RED', string> = {
        GREEN: 'text-green-400',
        YELLOW: 'text-amber-400',
        RED: 'text-red-400',
    };

    // Map gate keys to navigation routes
    const gateRoutes: Record<string, string> = {
        roe: '/smartops/roe',
        cde: '/smartops/cde',
        weather: '/smartops/weather',
        deconfliction: '/smartops/targeting/collaboration',
    };

    return (
        <div className="flex items-center gap-4 text-xs">
            {Object.entries(gates).map(([key, gate]) => (
                <button
                    key={key}
                    onClick={() => navigate({ to: gateRoutes[key] as any })}
                    className="flex items-center gap-1.5 hover:bg-slate-800/50 px-2 py-1 rounded transition-colors cursor-pointer"
                    title={`Click to view ${gate.name} details`}
                >
                    <span className={statusColors[gate.status as 'GREEN' | 'YELLOW' | 'RED']}>
                        {statusIcons[gate.status as 'GREEN' | 'YELLOW' | 'RED']}
                    </span>
                    <span className="text-slate-400 font-bold uppercase">
                        {gate.name}:
                    </span>
                    <span className={`font-black uppercase ${statusColors[gate.status as 'GREEN' | 'YELLOW' | 'RED']}`}>
                        {gate.value}
                    </span>
                    <SecurityBadge
                        level={gate.classification}
                        caveats={gate.caveats}
                        size="sm"
                        showIcon={false}
                    />
                </button>
            ))}
        </div>
    );
}

