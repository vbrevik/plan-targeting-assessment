import { useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { targetingApi, type Target as ApiTarget } from '@/lib/mshnctrl/api/targeting.api';
import type { Target, ROE, StrikeAnalysis, TargetSystem, ActivityLog, WeaponSystem, BDAReport, CollectionRequest } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    MapPin,
    ShieldAlert,
    Zap,
    Flame,
    ClipboardCheck,
    AlertTriangle,
    History as HistoryIcon,
    Scale,
    Globe,
    CheckCircle2,
    LayoutGrid,
    Binary,
    Target as TargetIcon,
    Crosshair,
    Radar,
    Camera,
    ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StrikeRequestModal } from './StrikeRequestModal';
import { WeaponeeringCalculator } from './WeaponeeringCalculator';
import { BDADisplay } from '../bda/BDADisplay';
import { CollectionSync } from '../intelligence/CollectionSync';

interface TargetDetailViewProps {
    targetId?: string;
    isEmbedded?: boolean;
    onClose?: () => void;
}

export function TargetDetailView({ targetId: propTargetId, isEmbedded, onClose }: TargetDetailViewProps) {
    const routeParams = useParams({ from: '/mshnctrl/targeting/$targetId', strict: false });
    const targetId = propTargetId || routeParams.targetId;
    const navigate = useNavigate();
    const [target, setTarget] = useState<ApiTarget | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [roes, setRoes] = useState<ROE[]>([]);
    const [analysis, setAnalysis] = useState<StrikeAnalysis | null>(null);
    const [targetSystem, setTargetSystem] = useState<TargetSystem | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [weapons, setWeapons] = useState<WeaponSystem[]>([]);
    const [bdaReports, setBdaReports] = useState<BDAReport[]>([]);
    const [collectionRequests, setCollectionRequests] = useState<CollectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [strikeModalOpen, setStrikeModalOpen] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const loadData = async () => {
        try {
            if (!targetId) return;

            // Fetch target and timeline from real API
            const [apiTarget, timelineData, r] = await Promise.all([
                targetingApi.getTarget(targetId).catch(() => null),
                targetingApi.getTargetTimeline(targetId).catch(() => []),
                MshnCtrlService.getROEs().catch(() => [])
            ]);

            // Stubs for missing service methods
            const systems: any[] = [];
            const logs: any[] = [];
            const w: any[] = [];
            const bda: any[] = [];
            const cr: any[] = [];
            const a: any = null;

            if (apiTarget) {
                setTarget(apiTarget);
                // Map API target to component Target type for compatibility
                const mappedTarget: Target = {
                    id: apiTarget.id,
                    name: apiTarget.name,
                    type: 'Target', // Fixed type
                    target_type: apiTarget.target_type, // Keep original
                    targetId: apiTarget.id,
                    designator: apiTarget.id.substring(0, 8).toUpperCase(),
                    category: apiTarget.target_type,
                    catCode: apiTarget.target_type,
                    priority: apiTarget.priority as any || 'Medium',
                    status: 'Active', // Default OperationalStatus
                    targetStatus: apiTarget.target_status as any,
                    location: { lat: 0, lng: 0 }, // Placeholder, handled in displayTarget
                    classification: apiTarget.classification || 'SECRET',
                    desiredEffect: 'Neutralize',
                    collateralDamageEstimate: 'Low',
                    affiliation: 'Red',
                    description: apiTarget.description
                } as any; // Cast to avoid missing props for now

                // Try to find system for mapped target
                const system = systems.find(s => s.components.includes(mappedTarget.id));
                setTargetSystem(system || null);
            }

            // Set timeline if available
            if (Array.isArray(timelineData)) {
                setTimeline(timelineData);
            } else if (timelineData && typeof timelineData === 'object' && 'timeline' in timelineData) {
                setTimeline((timelineData as any).timeline || []);
            }

            setRoes(r);
            setAnalysis(a || null);
            setActivityLogs(logs);
            setWeapons(w);
            setBdaReports(bda || []);
            setCollectionRequests(cr || []);
        } catch (error) {
            console.error('Failed to load targeting data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [targetId]);

    const handleStatusTransition = async (newStatus: string) => {
        if (!target || updatingStatus) return;

        setUpdatingStatus(true);
        try {
            await targetingApi.updateTarget(target.id, { target_status: newStatus });
            // Reload data to get updated target
            await loadData();
        } catch (error) {
            console.error('Failed to update target status:', error);
            // TODO: Show error toast/notification
        } finally {
            setUpdatingStatus(false);
        }
    };

    // Determine available status transitions based on current status
    const getAvailableTransitions = (currentStatus: string) => {
        const transitions: Record<string, string[]> = {
            'Nominated': ['Validated'],
            'Validated': ['Approved'],
            'Approved': ['Engaged'],
            'Engaged': ['Assessed'],
            'Assessed': [], // End state
        };
        return transitions[currentStatus] || [];
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase tracking-widest">Accessing Classified Folder...</div>;
    if (!target) return <div className="p-8 text-red-500">Target not found.</div>;

    // Map API target to component format for display
    // Parse coordinates (format: "lat,lng" or MGRS)
    const parseCoordinates = (coords: string) => {
        const parts = coords.split(',');
        if (parts.length === 2) {
            const lat = parseFloat(parts[0].trim());
            const lng = parseFloat(parts[1].trim());
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lng };
            }
        }
        return null;
    };

    const coordObj = parseCoordinates(target.coordinates);

    const displayTarget: Target = {
        id: target.id,
        name: target.name,
        type: 'Target',
        target_type: target.target_type,
        designator: target.id.substring(0, 8).toUpperCase(),
        priority: target.priority as any,
        status: 'Active',
        location: coordObj || { lat: 0, lng: 0 },
        affiliation: 'Red',
        requiredRoeId: '',
        classification: target.classification || 'SECRET',
        targetId: target.id,
        category: target.target_type,
        catCode: target.target_type,
        targetStatus: target.target_status as any,
        description: target.description || '',
        desiredEffect: 'Neutralize',
        collateralDamageEstimate: typeof target.collateral_estimate === 'string'
            ? JSON.parse(target.collateral_estimate).level
            : target.collateral_estimate?.level || 'Low',

        // Expanded Ontology Props
        beNumber: target.be_number,
        functionalType: target.functional_type,
        patternOfLife: Array.isArray(target.pattern_of_life) ? target.pattern_of_life : [],
        timeWindow: typeof target.time_window === 'string' ? JSON.parse(target.time_window) : target.time_window,
        legalStatus: typeof target.legal_status === 'string' ? JSON.parse(target.legal_status) : target.legal_status,
        weatherConstraints: typeof target.weather_constraints === 'string' ? JSON.parse(target.weather_constraints) : target.weather_constraints,
    } as any;

    const targetRoe = roes.find(r => r.id === displayTarget.requiredRoeId);

    // Use displayTarget for all references
    const t = displayTarget;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center gap-4 mb-4">
                    {(onClose || !isEmbedded) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onClose ? onClose() : navigate({ to: '/mshnctrl/targeting' })}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-tighter">
                                {t.designator}
                            </span>
                            {t.beNumber && (
                                <span className="text-[10px] font-mono font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">
                                    BE: {t.beNumber}
                                </span>
                            )}
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">{t.name}</h1>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">{t.functionalType || t.category}</span>
                            <div className="h-3 w-px bg-slate-800" />
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <MapPin size={10} />
                                {t.location && t.location.lat ? `${t.location.lat.toFixed(4)}, ${t.location.lng.toFixed(4)}` : target.coordinates || 'Unknown Location'}
                            </div>
                        </div>
                    </div>
                    <Badge className={cn(
                        "text-[10px] font-black uppercase px-4 py-1 border",
                        (t.status as any) === 'Approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" :
                            (t.status as any) === 'Engaged' ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                                "bg-blue-500/10 text-blue-400 border-blue-500/30"
                    )}>
                        {t.status}
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-slate-900/50 border border-slate-800 p-1 mb-2">
                            <TabsTrigger value="overview" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <LayoutGrid size={12} /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="tsa" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <Binary size={12} /> System Analysis (TSA)
                            </TabsTrigger>
                            <TabsTrigger value="pol" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <TargetIcon size={12} /> Pattern of Life
                            </TabsTrigger>
                            <TabsTrigger value="weaponeering" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <Crosshair size={12} /> Weaponeering
                            </TabsTrigger>
                            <TabsTrigger value="collection" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <Radar size={12} /> Collection
                            </TabsTrigger>
                            <TabsTrigger value="assessment" className="text-[10px] font-black uppercase tracking-widest gap-2">
                                <Camera size={12} /> Assessment
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Target Content */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="bg-slate-900/40 border-slate-800">
                                        <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <ClipboardCheck size={14} className="text-blue-500" /> Target Intelligence Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-4">
                                            <div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Description</span>
                                                <p className="text-sm text-slate-300 leading-relaxed italic">"{t.description || 'No description available'}"</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Desired Effect</span>
                                                    <Badge variant="outline" className="border-slate-700 text-slate-300 uppercase text-[9px]">{t.desiredEffect}</Badge>
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Collateral Damage Estimate</span>
                                                    <Badge className={cn(
                                                        "uppercase text-[9px] font-black",
                                                        t.collateralDamageEstimate === 'Low' ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                                                    )}>
                                                        {t.collateralDamageEstimate} (CDE-1)
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Advisory Panel */}
                                    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shrink-0 shadow-lg">
                                        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-white">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                                <Scale size={14} className="text-blue-500" /> Advisory Status
                                            </h3>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Scale size={14} className="text-slate-500" />
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">LEGAD (Legal)</span>
                                                </div>
                                                <Badge className={cn(
                                                    "text-[9px] font-black gap-1 border",
                                                    analysis?.legalCompliance === 'Clear' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        analysis?.legalCompliance === 'Violated' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                            "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                                )}>
                                                    {analysis?.legalCompliance === 'Clear' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                                    {analysis?.legalCompliance === 'Clear' ? 'LOAC CLEARED' :
                                                        analysis?.legalCompliance === 'Violated' ? 'LOAC VIOLATION' : 'PENDING REVIEW'}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-white">
                                                    <Globe size={14} className="text-slate-500" />
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">POLAD (Political)</span>
                                                </div>
                                                <Badge className={cn(
                                                    "text-[9px] font-black gap-1 border",
                                                    analysis && analysis.economicImpact < 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {analysis && analysis.economicImpact < 0 ? <AlertTriangle size={10} /> : <CheckCircle2 size={10} />}
                                                    {analysis && analysis.economicImpact < 0 ? 'SENSITIVE' : 'NO OBJECTION'}
                                                </Badge>
                                            </div>
                                            <div className="p-2 bg-slate-950/50 rounded border border-slate-800/50">
                                                <p className="text-[9px] font-bold text-slate-500 leading-tight">
                                                    {analysis?.reasoning || "No advisory notes available for this nomination."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Side Panel: ROE & Actions */}
                                <div className="space-y-6">
                                    <Card className="bg-slate-900/40 border-slate-800">
                                        <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                                <ShieldAlert size={14} className="text-red-500" /> Administrative & Legal
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Rules of Engagement</span>
                                                    {targetRoe ? (
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-black text-white uppercase">{targetRoe.code}</span>
                                                                <Badge className={cn(
                                                                    "text-[8px] uppercase",
                                                                    (targetRoe.status as any) === 'Released' ? "bg-emerald-500/20 text-emerald-500" : "bg-yellow-500/20 text-yellow-500"
                                                                )}>
                                                                    {targetRoe.status}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[9px] text-slate-400 italic">"{targetRoe.description}"</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[9px] text-slate-600 italic">No specific ROE authority mapped.</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 pt-2">
                                                    {/* Status Transition Buttons */}
                                                    {getAvailableTransitions(t.status as any).length > 0 && (
                                                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded mb-2">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Status Workflow</span>
                                                            <div className="flex flex-col gap-1.5">
                                                                {getAvailableTransitions(t.status as any).map((nextStatus) => (
                                                                    <Button
                                                                        key={nextStatus}
                                                                        size="sm"
                                                                        variant="outline"
                                                                        disabled={updatingStatus}
                                                                        onClick={() => handleStatusTransition(nextStatus)}
                                                                        className={cn(
                                                                            "w-full text-[9px] font-black uppercase h-8 justify-start border",
                                                                            nextStatus === 'Approved' ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10" :
                                                                                nextStatus === 'Engaged' ? "border-orange-500/50 text-orange-400 hover:bg-orange-500/10" :
                                                                                    nextStatus === 'Validated' ? "border-blue-500/50 text-blue-400 hover:bg-blue-500/10" :
                                                                                        "border-slate-500/50 text-slate-400 hover:bg-slate-500/10"
                                                                        )}
                                                                    >
                                                                        <ArrowRight size={10} className="mr-2" /> Advance to {nextStatus}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <Button
                                                        className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase py-4"
                                                        disabled={(t.status as any) !== 'Approved' || (targetRoe && (targetRoe.status as any) !== 'Released') || analysis?.legalCompliance !== 'Clear' || updatingStatus}
                                                        onClick={() => setStrikeModalOpen(true)}
                                                    >
                                                        <Flame size={14} className="mr-2" /> Request Engagement
                                                    </Button>
                                                    <Button variant="outline" className="w-full border-slate-800 text-slate-400 text-[10px] font-black uppercase">
                                                        <HistoryIcon size={14} className="mr-2" /> View Audit Trail
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tsa" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2">
                                    <Card className="bg-slate-900/40 border-slate-800 h-[500px] flex items-center justify-center">
                                        <div className="text-center group">
                                            <Binary size={48} className="text-blue-500/20 group-hover:text-blue-500/40 transition-colors mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">System Network Visualization</p>
                                            <p className="text-[9px] text-slate-700 mt-2 font-mono">[INTEGRATING ONTOLOGY ENGINE...]</p>
                                        </div>
                                    </Card>
                                </div>
                                <div>
                                    <Card className="bg-slate-900/40 border-slate-800">
                                        <CardHeader className="border-b border-slate-800/50">
                                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">System Context</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-4">
                                            {targetSystem ? (
                                                <div className="space-y-4">
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Parent System</span>
                                                        <span className="text-xs font-bold text-white uppercase">{targetSystem.name}</span>
                                                    </div>
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase block">System Criticality</span>
                                                            <span className="text-[10px] font-black text-amber-500">{(targetSystem.criticality * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                                                                style={{ width: `${targetSystem.criticality * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-2">Strategic Impact (Zap)</span>
                                                        <div className="flex items-center gap-2">
                                                            <Zap size={14} className="text-amber-500" />
                                                            <span className="text-xs font-bold text-slate-300 uppercase">High Cascade Potential</span>
                                                        </div>
                                                        <p className="text-[8px] text-slate-600 mt-1 italic">Disabling this node creates 40% degradation in parent system.</p>
                                                    </div>
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">System Components</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {targetSystem.components.map(c => (
                                                                <span key={c} className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-400">{c}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-[9px] text-slate-600 italic">No system dependencies identified.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="pol" className="mt-0">
                            <Card className="bg-slate-900/40 border-slate-800 min-h-[400px]">
                                <CardHeader className="border-b border-slate-800/50">
                                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Behavioral Intelligence Timeline</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-slate-800/50">
                                        {t.patternOfLife && t.patternOfLife.length > 0 ? (
                                            t.patternOfLife.map((pattern: any, idx: number) => (
                                                <div key={idx} className="p-4 flex gap-4 hover:bg-slate-800/20 transition-colors">
                                                    <div className="pt-1">
                                                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                                {pattern.time_window || pattern.time}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1 rounded border border-slate-800">
                                                                CONF: {(pattern.probability * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-300 font-mono tracking-tight leading-relaxed">{pattern.activity}</p>
                                                        <div className="mt-2 flex gap-2">
                                                            {pattern.location && <Badge variant="outline" className="text-[8px] border-slate-700 text-slate-500">{pattern.location}</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : activityLogs.length > 0 ? (
                                            activityLogs.map((log) => (
                                                <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-800/20 transition-colors">
                                                    <div className="pt-1">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full mt-1.5",
                                                            log.activityType === 'Comms' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                                                                log.activityType === 'Movement' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                                    "bg-slate-500"
                                                        )} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                                                                {log.activityType} // {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1 rounded border border-slate-800">
                                                                CONF: {(log.confidence * 100).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-300 font-mono tracking-tight leading-relaxed">{log.description}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center">
                                                <TargetIcon size={32} className="mx-auto text-slate-800 mb-4" />
                                                <p className="text-[10px] uppercase font-black text-slate-700">No activity logged for this period</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-amber-500" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase">Intelligence Gaps Identified // Low Pol Coverage at Night</span>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="weaponeering" className="mt-0">
                            <WeaponeeringCalculator target={target as any} weapons={weapons} />
                        </TabsContent>

                        <TabsContent value="collection" className="mt-0">
                            <CollectionSync requests={collectionRequests} />
                        </TabsContent>

                        <TabsContent value="assessment" className="mt-0">
                            {targetId && <BDADisplay targetId={targetId} onStatusChange={loadData} />}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <StrikeRequestModal
                target={target as any}
                open={strikeModalOpen}
                onOpenChange={setStrikeModalOpen}
                onSuccess={loadData}
            />
        </div>
    );
}
