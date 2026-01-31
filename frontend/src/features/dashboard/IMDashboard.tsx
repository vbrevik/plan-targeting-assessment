import { useState, useEffect } from 'react';
import {
    Clock,
    FileText,
    AlertCircle,
    ChevronRight,
    ShieldCheck,
    MessageSquare,
    Timer,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { BattleRhythmEvent, TermsOfReference, GovernanceSession } from '@/lib/mshnctrl/types';

export function IMDashboard() {
    const [events, setEvents] = useState<BattleRhythmEvent[]>([]);
    const [tors, setTors] = useState<TermsOfReference[]>([]);
    const [sessions, setSessions] = useState<GovernanceSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const [eData, tData, sData] = await Promise.all([
                MshnCtrlService.getBattleRhythmEvents(),
                MshnCtrlService.getTORs(),
                MshnCtrlService.getGovernanceSessions()
            ]);
            setEvents(eData);
            setTors(tData);
            setSessions(sData);
            setLoading(false);
        }
        loadData();
    }, []);

    // Mock data for Actions Center
    const decisions = [
        { id: 'd1', title: 'A2/AD Mitigation Strategy', due: 'Today, 14:00', status: 'Delayed', priority: 'High', owner: 'J3' },
        { id: 'd2', title: 'Target Nomination List - Sector 4', due: 'Today, 10:00', status: 'Due', priority: 'Critical', owner: 'Targeting Cell' },
        { id: 'd3', title: 'Logistics Corridor Alpha Authorization', due: 'Tomorrow, 09:00', status: 'Pending', priority: 'Medium', owner: 'J4' },
    ];

    const confirmations = [
        { id: 'c1', title: 'Communications Node 12 Deployment', due: '2h ago', status: 'Delayed', priority: 'High' },
        { id: 'c2', title: 'Special Forces Insertion - Phase 1', due: 'In 30m', status: 'Due', priority: 'Critical' },
        { id: 'c3', title: 'Supplies Delivery to FOB Echo', due: 'In 4h', status: 'Pending', priority: 'Low' },
    ];

    if (loading) return <div className="p-8 font-mono text-[10px] animate-pulse">SYNCHRONIZING IM COCKPIT...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 p-6 gap-6 overflow-y-auto">
            {/* Header / Stats */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">IM Command Dashboard</h1>
                    <p className="text-sm text-slate-500 font-medium">Information Management and Operational Rhythm Oversight</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Time</span>
                        <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">13:47:21 Z</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Secondary Panels - LEFT */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                    {/* TOR Overview */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                    <ShieldCheck className="text-blue-500" size={16} /> Mandate Status (TOR)
                                </CardTitle>
                                <Badge variant="outline" className="text-[10px]">12 Active</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {tors.slice(0, 3).map(tor => (
                                <div key={tor.id} className="p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50 group cursor-pointer hover:border-blue-500/50 transition-all">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{tor.title}</span>
                                        <Badge className="text-[8px] h-4 uppercase bg-emerald-500/10 text-emerald-500 border-none">Approved</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-1 flex-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }} />
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-500">85%</span>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase h-8 text-slate-500 hover:text-blue-500">
                                View All Mandates <ChevronRight size={14} />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Recent MoMs */}
                    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <MessageSquare className="text-emerald-500" size={16} /> Recent MoMs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sessions.filter(s => s.status === 'Concluded').slice(0, 3).map(session => (
                                <div key={session.id} className="flex gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                                        <FileText size={14} className="text-emerald-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{session.title}</p>
                                        <p className="text-[9px] text-slate-500">{new Date(session.startTime).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase h-8 text-slate-500 hover:text-emerald-500">
                                Open Archives <ChevronRight size={14} />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Central Battle Rhythm Element */}
                <div className="col-span-12 lg:col-span-6">
                    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-900 flex flex-col">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                        <Timer className="text-blue-600" size={20} /> Daily Battle Rhythm Pulse
                                    </CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-bold tracking-widest">January 24, 2026 | Cycle 24-A</CardDescription>
                                </div>
                                <Badge variant="outline" className="font-mono text-[10px] border-blue-500/30 text-blue-500">UTC+01</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative overflow-hidden flex flex-col">
                            {/* Time Rulers */}
                            <div className="grid grid-cols-6 border-b border-slate-100 dark:border-slate-800/30">
                                {['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'].map(time => (
                                    <div key={time} className="p-2 border-r border-slate-100 dark:border-slate-800/30 text-center">
                                        <span className="text-[9px] font-mono font-bold text-slate-400">{time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Timeline Content */}
                            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                                <div className="absolute left-1/2 top-4 bottom-4 w-px bg-slate-100 dark:bg-slate-800/50 -translate-x-1/2 z-0" />

                                {events.slice(0, 5).map((event, idx) => (
                                    <div key={event.id} className={cn(
                                        "relative z-10 flex items-center gap-4",
                                        idx % 2 === 0 ? "flex-row" : "flex-row-reverse"
                                    )}>
                                        <div className={cn("w-1/2", idx % 2 === 0 ? "text-right" : "text-left")}>
                                            <div className={cn(
                                                "inline-block p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all hover:scale-[1.02] cursor-pointer",
                                                event.type.includes('Decision') ? "border-red-500/20 hover:border-red-500/40" : "border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
                                            )}>
                                                <div className={cn("flex items-center gap-2 mb-2", idx % 2 === 0 ? "justify-end" : "justify-start")}>
                                                    <span className="text-[10px] font-mono font-black text-slate-400">14:00</span>
                                                    <Badge variant="secondary" className="text-[8px] uppercase tracking-tighter h-4">Working Group</Badge>
                                                </div>
                                                <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight">{event.name}</h4>
                                                <div className={cn("flex items-center gap-2 mt-2", idx % 2 === 0 ? "justify-end" : "justify-start")}>
                                                    <span className="text-[9px] font-bold text-slate-500">{event.chairRole}</span>
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative z-20">
                                            <div className="w-4 h-4 rounded-full bg-blue-600 border-4 border-slate-50 dark:border-slate-950 shadow-md shadow-blue-500/20" />
                                        </div>
                                        <div className="w-1/2" />
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 shadow-inner">
                                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-blue-500/20">
                                    Manage Full Battle Rhythm <ArrowUpRight className="ml-2" size={14} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Center - RIGHT */}
                <div className="col-span-12 lg:col-span-3">
                    <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <AlertCircle className="text-amber-500" size={16} /> IM Action Center
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs defaultValue="decisions" className="w-full">
                                <TabsList className="w-full grid grid-cols-2 rounded-none bg-slate-100/50 dark:bg-slate-800/50 h-10 border-b border-slate-200 dark:border-slate-800">
                                    <TabsTrigger value="decisions" className="text-[10px] font-black uppercase tracking-tighter">Decisions</TabsTrigger>
                                    <TabsTrigger value="confirmations" className="text-[10px] font-black uppercase tracking-tighter">Confirmations</TabsTrigger>
                                </TabsList>

                                <TabsContent value="decisions" className="p-4 space-y-3 mt-0">
                                    {decisions.map(d => (
                                        <div key={d.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative group overflow-hidden">
                                            {d.status === 'Delayed' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.owner}</span>
                                                <Badge className={cn(
                                                    "text-[8px] h-4 uppercase border-none",
                                                    d.status === 'Delayed' ? "bg-red-500/10 text-red-500" : "bg-amber-500/10 text-amber-500"
                                                )}>{d.status}</Badge>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-500 transition-colors cursor-pointer">{d.title}</p>
                                            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                                                <Clock size={10} /> {d.due}
                                            </div>
                                        </div>
                                    ))}
                                </TabsContent>

                                <TabsContent value="confirmations" className="p-4 space-y-3 mt-0">
                                    {confirmations.map(c => (
                                        <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                                            {c.status === 'Delayed' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                                            <div className="flex justify-between items-start mb-1">
                                                <Badge className={cn(
                                                    "text-[8px] h-4 uppercase border-none",
                                                    c.priority === 'Critical' ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                )}>{c.priority}</Badge>
                                                <span className={cn(
                                                    "text-[9px] font-bold",
                                                    c.status === 'Delayed' ? "text-red-500" : "text-amber-500"
                                                )}>{c.due}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-white leading-tight">{c.title}</p>
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
