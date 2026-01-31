import { useState, useEffect } from 'react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { Target } from '@/lib/mshnctrl/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronRight,
    Gavel,
    Users,
    AlertTriangle,
    Clock,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function JTBVotingView() {
    const [nominatedTargets, setNominatedTargets] = useState<Target[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        const targets = await MshnCtrlService.getTargets();
        // Filter for "Nominated" targets
        setNominatedTargets(targets.filter(t => t.targetStatus === 'Nominated'));
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleVote = async (targetId: string, _decision: 'Approved' | 'Rejected') => {
        // In a real app, this would be a service call
        setNominatedTargets(prev => prev.filter(t => t.id !== targetId));
        if (selectedTarget?.id === targetId) setSelectedTarget(null);
        // Toast notification would go here
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase">JTB Session Initializing...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded flex items-center justify-center border border-blue-500/30">
                            <Gavel size={20} className="text-blue-500" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">Joint Targeting Board (JTB)</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Session 2026-01-07B</span>
                                <Badge variant="outline" className="text-[8px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Quorum Met</Badge>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <span className="text-[9px] font-black text-slate-500 uppercase block">Board Members</span>
                            <div className="flex -space-x-2 mt-1">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#020617] flex items-center justify-center">
                                        <Users size={12} className="text-slate-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
                {/* Nomination List */}
                <div className="w-80 border-r border-slate-900 flex flex-col">
                    <div className="p-4 border-b border-slate-900 bg-slate-950/20">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> Pending Nominations ({nominatedTargets.length})
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                        {nominatedTargets.map(target => (
                            <button
                                key={target.id}
                                onClick={() => setSelectedTarget(target)}
                                className={cn(
                                    "w-full p-4 text-left hover:bg-slate-900/40 transition-colors group relative",
                                    selectedTarget?.id === target.id && "bg-slate-900/60"
                                )}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <span className="text-[10px] font-mono font-bold text-slate-500">{target.targetId}</span>
                                    <Badge className={cn(
                                        "text-[8px] uppercase font-black",
                                        target.priority === 'High' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-400"
                                    )}>PRI-{target.priority[0]}</Badge>
                                </div>
                                <h3 className="text-xs font-black text-slate-200 uppercase truncate">{target.name}</h3>
                                <p className="text-[9px] text-slate-500 mt-1 uppercase truncate">{target.category}</p>

                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight size={16} className="text-blue-500" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Voting Workspace */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-950/20">
                    {selectedTarget ? (
                        <div className="max-w-4xl mx-auto space-y-8">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-mono font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                                            {selectedTarget.targetId}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase">Nominated for Engagement</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedTarget.name}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleVote(selectedTarget.id, 'Approved')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] px-6 h-12 gap-2"
                                    >
                                        <CheckCircle2 size={16} /> Approve
                                    </Button>
                                    <Button
                                        onClick={() => handleVote(selectedTarget.id, 'Rejected')}
                                        variant="outline"
                                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] px-6 h-12 gap-2"
                                    >
                                        <XCircle size={16} /> Reject
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-slate-950 border-slate-800">
                                    <CardHeader className="p-4 border-b border-slate-800">
                                        <CardTitle className="text-[10px] font-black uppercase text-slate-500">Legal Compliance</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-emerald-500">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-black uppercase">LOAC Cleared</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-950 border-slate-800">
                                    <CardHeader className="p-4 border-b border-slate-800">
                                        <CardTitle className="text-[10px] font-black uppercase text-slate-500">Collateral Risk</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-amber-500">
                                            <AlertTriangle size={14} />
                                            <span className="text-[10px] font-black uppercase">CDE-1 Low</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-950 border-slate-800">
                                    <CardHeader className="p-4 border-b border-slate-800">
                                        <CardTitle className="text-[10px] font-black uppercase text-slate-500">Strategic Value</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 text-blue-500">
                                            <Zap size={14} />
                                            <span className="text-[10px] font-black uppercase">Critical Node</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-slate-900/40 border-slate-800">
                                <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/20">
                                    <CardTitle className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                                        <MessageSquare size={14} /> Board Discussion
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black">L</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase text-slate-300">LEGAD</span>
                                                <span className="text-[8px] text-slate-500 uppercase font-bold">14:22:01</span>
                                            </div>
                                            <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                                                "Target is confirmed a valid military objective. No protected structures within the CDE-1 radius."
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black">P</span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase text-slate-300">POLAD</span>
                                                <span className="text-[8px] text-slate-500 uppercase font-bold">14:25:30</span>
                                            </div>
                                            <p className="text-xs text-slate-400 italic font-medium leading-relaxed">
                                                "Slight concern over the proximity to the embassy district, but weapon choice and mitigation tactics address this properly."
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700">
                            <Gavel size={64} className="opacity-10 mb-6" />
                            <p className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Select Nomination to Review</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
