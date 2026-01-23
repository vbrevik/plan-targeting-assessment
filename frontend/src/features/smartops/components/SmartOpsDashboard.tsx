import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
    AlertOctagon,
    MessageSquareWarning,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import { TacticalMap } from './TacticalMap';
import { NetworkGraph } from './NetworkGraph';
import { LOOTimeline } from './LOOTimeline';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { useToast } from '@/components/ui/use-toast';
import { useOperationalContext, getPhaseColor } from '@/lib/smartops/hooks/useOperationalContext';
import type {
    PoliticalStatement,
    NaturalDisaster,
    DisinformationEvent,
    FakeMedia
} from '@/lib/smartops/types';

export function SmartOpsDashboard() {
    const { toast } = useToast();
    const { context, isStrategic } = useOperationalContext();
    const [stats, setStats] = useState<{
        activeOrders: number;
        pendingProposals: number;
        activeScenario: string;
        readiness: number;
        loos: any[];
        decisiveConditions: any[];
    } | null>(null);

    const [externalFactors, setExternalFactors] = useState<{
        political: PoliticalStatement[];
        disasters: NaturalDisaster[];
        disinfo: DisinformationEvent[];
        media: FakeMedia[];
    }>({ political: [], disasters: [], disinfo: [], media: [] });

    useEffect(() => {
        // Fetch scoped stats
        SmartOpsService.getDashboardStats(context.operationId || undefined).then((res: any) => setStats(res));

        // Fetch external factors
        Promise.all([
            SmartOpsService.getPoliticalStatements(context.operationId || undefined),
            SmartOpsService.getNaturalDisasters(context.operationId || undefined),
            SmartOpsService.getDisinformationEvents(context.operationId || undefined),
            SmartOpsService.getFakeMedia(context.operationId || undefined)
        ]).then(([political, disasters, disinfo, media]) => {
            setExternalFactors({ political, disasters, disinfo, media });
        });
    }, [context.operationId]);

    if (!stats) return <div className="h-screen flex items-center justify-center bg-slate-950 text-white font-mono uppercase tracking-[0.2em] animate-pulse">Initializing Command Core...</div>;

    return (
        <div className="h-full w-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden select-none font-sans border-[4px] border-slate-900">

            {/* 1. CRITICAL STATUS HEADER (High Contrast) */}
            <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800 shadow-2xl z-20">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{context.level} Context</span>
                        <span className="text-sm font-black text-white tracking-tight">{context.name}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phase</span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${getPhaseColor(context.phase)}`}>
                            {context.phase || 'N/A'}
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-800" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timeline</span>
                        <span className="text-sm font-mono text-slate-300">D+04 | 19:14:20Z</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-red-950/40 border border-red-500/50 rounded flex items-center gap-3">
                        <AlertOctagon className="text-red-500 animate-pulse" size={24} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-red-400 uppercase">Alert Level</span>
                            <span className="text-sm font-black text-white">RED-ALPHA</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex min-h-0 overflow-hidden p-2 gap-2">

                {/* 2. INSIGHT SIDEBAR (The "What you don't know" panel) */}
                <div className="w-[320px] flex flex-col gap-2 shrink-0">

                    {/* Commander's Critical Information Requirements (CCIR) */}
                    <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-lg flex flex-col overflow-hidden backdrop-blur-sm">
                        <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                <MessageSquareWarning size={16} />
                                Live Intel Insights
                            </h2>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 rounded">5 NEW</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {/* DISINFORMATION EVENTS */}
                            {externalFactors.disinfo.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => toast({ title: `DISINFO ALERT: ${event.name}`, description: `${event.narrative} (Target: ${event.targetAudience})`, variant: 'destructive' })}
                                    className="group p-2 bg-red-950/20 border-l-2 border-l-red-500 border border-slate-800 rounded hover:bg-red-900/40 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">DISINFO / {event.platform}</span>
                                        <span className="text-[8px] text-slate-600 font-mono italic">NEW</span>
                                    </div>
                                    <h3 className="text-[11px] font-bold text-white leading-tight truncate">{event.name}</h3>
                                </div>
                            ))}

                            {/* POLITICAL STATEMENTS */}
                            {externalFactors.political.map(st => (
                                <div
                                    key={st.id}
                                    onClick={() => toast({ title: `POLITICAL: ${st.speaker}`, description: st.description })}
                                    className="group p-2 bg-blue-900/20 border-l-2 border-l-blue-500 border border-slate-800 rounded hover:bg-blue-800/40 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">POLITICAL / {st.role}</span>
                                        <span className="text-[8px] text-slate-600 font-mono italic">ACTIVE</span>
                                    </div>
                                    <h3 className="text-[11px] font-bold text-slate-200 leading-tight truncate">{st.name}</h3>
                                </div>
                            ))}

                            {/* NATURAL DISASTERS */}
                            {externalFactors.disasters.map(d => (
                                <div
                                    key={d.id}
                                    onClick={() => toast({ title: d.name, description: `Severity: ${d.severity}/10. Impact on Logistics: ${Math.round(d.impactOnLogistics * 100)}%` })}
                                    className="group p-2 bg-amber-900/20 border-l-2 border-l-amber-500 border border-slate-800 rounded hover:bg-amber-800/40 transition-all cursor-pointer">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">ENV / {d.disasterType}</span>
                                        <span className="text-[8px] text-slate-600 font-mono italic">{d.location}</span>
                                    </div>
                                    <h3 className="text-[11px] font-bold text-slate-300 leading-tight truncate">{d.name}</h3>
                                </div>
                            ))}

                            {/* FALLBACK/HARDCODED ITEMS (if none existing or strategic) */}
                            {isStrategic && (
                                <>
                                    <div
                                        onClick={() => toast({ title: "SIGINT Report #9921", description: "Equipment massing near OBJ ALPHA confirmed by high-confidence intercept.", variant: 'destructive' })}
                                        className="group p-2 bg-slate-900/40 border-l-2 border-l-red-500 border border-slate-800 rounded hover:bg-slate-800/60 transition-all cursor-pointer">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">SIGINT / MOVEMENT</span>
                                            <span className="text-[8px] text-slate-600 font-mono italic">2m ago</span>
                                        </div>
                                        <h3 className="text-[11px] font-bold text-white leading-tight truncate">Equipment massing near OBJ ALPHA</h3>
                                    </div>

                                    <div
                                        onClick={() => toast({ title: "Logistics Alert #442", description: "Fuel reserves at DC 1.2 projecting < 48h endurance at current burn rates.", variant: 'default' })}
                                        className="group p-2 bg-slate-900/40 border-l-2 border-l-yellow-500 border border-slate-800 rounded hover:bg-slate-800/60 transition-all cursor-pointer">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">LOGISTICS / POL</span>
                                            <span className="text-[8px] text-slate-600 font-mono italic">14m ago</span>
                                        </div>
                                        <h3 className="text-[11px] font-bold text-slate-300 leading-tight truncate">DC 1.2 at risk: Fuel drift &lt; 48h</h3>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Metrics (Enlarged) */}
                    <div className="h-[200px] bg-slate-900/50 border border-slate-800 rounded-lg grid grid-cols-2 p-4 gap-4">
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Force Readiness</span>
                            <span className="text-2xl font-black text-white">87<span className="text-lg text-slate-600">%</span></span>
                            <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold mt-1">
                                <TrendingUp size={12} /> +2.1%
                            </div>
                        </div>
                        <div className="flex flex-col justify-center border-l border-slate-800 pl-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Targeting Efficacy</span>
                            <span className="text-2xl font-black text-slate-300">64<span className="text-lg text-slate-600">%</span></span>
                            <span className="text-[10px] text-slate-500 mt-1 uppercase">Phase II Baseline</span>
                        </div>
                    </div>
                </div>

                {/* 3. MAIN VISUALIZATION AREA (Flexible Grid) */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">

                    <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
                        {/* Tactical Map with Info Overlay */}
                        <div className="relative border border-slate-800 rounded-lg overflow-hidden group">
                            <TacticalMap />
                            <div className="absolute top-0 right-0 p-4">
                                <div className="bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-md text-[10px] font-black text-blue-400 backdrop-blur uppercase tracking-widest shadow-xl">
                                    Tactical COP
                                </div>
                            </div>
                        </div>

                        {/* Network / Knowledge View */}
                        <div className="relative border border-slate-800 rounded-lg overflow-hidden flex flex-col">
                            <NetworkGraph />
                            <div className="absolute top-0 right-0 p-4">
                                <div className="bg-slate-950/80 border border-slate-700 px-3 py-1.5 rounded-md text-[10px] font-black text-purple-400 backdrop-blur uppercase tracking-widest shadow-xl">
                                    Semantic Graph
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. STRATEGIC TIMELINE (LOO / DCs) */}
                    <div className="h-[280px] border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40 flex flex-col">
                        <div className="h-10 border-b border-slate-800 bg-slate-950 flex shadow-lg items-center px-4">
                            <Link to="/smartops/campaign" className="text-[11px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-widest flex items-center gap-2">
                                Campaign LOOs <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="flex-1">
                            <LOOTimeline loos={stats.loos} decisiveConditions={stats.decisiveConditions} />
                        </div>
                    </div>

                </div>

            </div>

            {/* 5. FOOTER TELEMETRY */}
            <div className="h-8 flex items-center justify-between px-4 text-[10px] font-mono text-slate-500 bg-slate-950 border-t border-slate-800">
                <div className="flex gap-6 items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="font-bold text-slate-400">CORE SYSTEM: NOMINAL</span>
                    </div>
                    <span>SEC-HASH: 8A2F...91BC</span>
                </div>
                <div className="flex gap-6 items-center font-bold">
                    <span>STATION: HQ-NORTH-C2</span>
                    <span className="text-blue-500 uppercase">NATO COPD CONFORMANT</span>
                </div>
            </div>
        </div>
    );
}
