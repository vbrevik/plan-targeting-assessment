import { useEffect, useState } from 'react';
import {
    Scale,
    ShieldCheck,
    Plus,
    Clock,
    AlertOctagon,
    FileText,
    Search,
    Filter,
    ShieldAlert,
    History,
    TrendingUp
} from 'lucide-react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { cn } from '@/lib/utils';
import type { ROE } from '@/lib/mshnctrl/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Extended Types for UI
interface ExtendedROE extends ROE {
    category: 'Baseline' | 'Mission-Specific' | 'Theater';
    series: '100' | '200' | '300' | '400';
    effectiveDate: string;
}

interface ROERequest {
    id: string;
    roeCode: string;
    requestType: 'Release' | 'Modification' | 'Cancellation';
    justification: string;
    status: 'Draft' | 'Submitted' | 'Endorsed' | 'Approved' | 'Rejected';
    requestedBy: string;
    timestamp: string;
    priority: 'Routine' | 'Urgent' | 'Emergency';
}

export function ROEManagement() {
    const [roes, setStatusRoes] = useState<ExtendedROE[]>([]);
    const [advisories, setAdvisories] = useState<any[]>([]);
    const [requests, setRequests] = useState<ROERequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('authorized');
    const [searchQuery, setSearchQuery] = useState('');

    const fallbackAdvisories = [
        { id: 'ADV-01', severity: 'Critical', region: 'Sector North', text: 'UAS engagement restricted within 5km of neutral border.' },
        { id: 'ADV-02', severity: 'Caution', region: 'Sector South', text: 'Collateral damage threshold lowered to Level 3 for urban hubs.' },
    ];

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Fetch real ROE data and extend it
                const [rData] = await Promise.all([
                    MshnCtrlService.getROEs()
                ]);

                // Enhance data with mock fields for UI demo
                const enhancedRoes: ExtendedROE[] = rData.map(r => ({
                    ...r,
                    category: r.code.startsWith('1') ? 'Baseline' : r.code.startsWith('4') ? 'Mission-Specific' : 'Theater',
                    series: r.code.substring(0, 1) + '00' as any,
                    effectiveDate: new Date().toISOString()
                }));

                setStatusRoes(enhancedRoes);
                setAdvisories(fallbackAdvisories);

                // Mock Requests
                setRequests([
                    {
                        id: 'REQ-24-001',
                        roeCode: '421',
                        requestType: 'Release',
                        justification: 'Required for dynamic targeting in Sector North regarding hostile UAS.',
                        status: 'Submitted',
                        requestedBy: 'J3 Current Ops',
                        timestamp: new Date().toISOString(),
                        priority: 'Urgent'
                    },
                    {
                        id: 'REQ-24-002',
                        roeCode: '112',
                        requestType: 'Modification',
                        justification: 'Align with new host nation agreement limitations.',
                        status: 'Draft',
                        requestedBy: 'LEGAD',
                        timestamp: new Date().toISOString(),
                        priority: 'Routine'
                    }
                ]);
            } catch (e) {
                console.error("Failed to load ROE data", e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleApproveRequest = (id: string) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
        // Also enact the ROE status change in main list if applicable
        // TODO: Implement actual backend call
    };

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Retrieving Operational Law Database...</div>;

    const filteredRoes = roes.filter((r: ExtendedROE) =>
        r.code.includes(searchQuery) ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const baselineRoes = filteredRoes.filter((r: ExtendedROE) => r.category === 'Baseline');
    const missionRoes = filteredRoes.filter((r: ExtendedROE) => r.category === 'Mission-Specific');

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-8 pb-4 shrink-0">
                <div className="flex justify-between items-start mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Authority: Theater Command Active</span>
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">ROE Manager & Authority</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">Legal Guidance • Engagement Constraints • Release Authority</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Authorization</span>
                            <span className="text-sm font-black text-white uppercase leading-none">JFC-NORTH-24</span>
                        </div>
                        <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase text-[10px] rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/10">
                            <Plus size={16} className="mr-2" /> Request Modification
                        </Button>
                    </div>
                </div>

                {/* Performance & Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-6 transition-all hover:border-emerald-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                <ShieldCheck size={20} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500">RELEASED</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Rules</div>
                        <div className="text-4xl font-black text-white">{roes.filter((r: ExtendedROE) => r.status === 'Released').length}</div>
                    </div>

                    <div className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-6 transition-all hover:border-amber-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                                <Clock size={20} />
                            </div>
                            <span className="text-[10px] font-black text-amber-500">PENDING</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Submitted REQ</div>
                        <div className="text-4xl font-black text-white">{requests.filter((r: ROERequest) => r.status === 'Submitted').length}</div>
                    </div>

                    <div className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-6 transition-all hover:border-blue-500/30">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                                <Scale size={20} />
                            </div>
                            <span className="text-[10px] font-black text-blue-400">LEGAL</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Advisories</div>
                        <div className="text-4xl font-black text-white">{advisories.length}</div>
                    </div>

                    <div className="bg-red-950/10 border-2 border-red-900/30 rounded-3xl p-6 transition-all hover:border-red-500/50 group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                <AlertOctagon size={20} />
                            </div>
                            <TrendingUp size={16} className="text-red-500 group-hover:animate-bounce" />
                        </div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Critical Constraints</div>
                        <div className="text-4xl font-black text-white">
                            {roes.reduce((acc: number, r: ExtendedROE) => acc + (r.constraints?.length || 0), 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="authorized" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 py-2 border-b border-slate-800 bg-slate-950/30 flex justify-between items-center shrink-0">
                    <TabsList className="bg-transparent gap-6 p-0 h-auto">
                        <TabsTrigger
                            value="authorized"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 text-xs font-bold uppercase text-slate-500 data-[state=active]:text-emerald-400 transition-all"
                        >
                            Authorized Ruleset
                        </TabsTrigger>
                        <TabsTrigger
                            value="requests"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 text-xs font-bold uppercase text-slate-500 data-[state=active]:text-amber-400 transition-all"
                        >
                            Request Manager
                            {requests.filter((r: ROERequest) => r.status === 'Submitted').length > 0 && (
                                <span className="ml-2 bg-amber-500 text-slate-950 text-[9px] px-1 rounded-sm font-black">
                                    {requests.filter((r: ROERequest) => r.status === 'Submitted').length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="matrix"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 text-xs font-bold uppercase text-slate-500 data-[state=active]:text-blue-400 transition-all"
                        >
                            Constraints Matrix
                        </TabsTrigger>
                        <TabsTrigger
                            value="guidance"
                            className="bg-transparent border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 text-xs font-bold uppercase text-slate-500 data-[state=active]:text-purple-400 transition-all"
                        >
                            Legal Guidance
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1.5 h-3 w-3 text-slate-500" />
                            <Input
                                placeholder="Search rules..."
                                className="h-7 w-48 text-[10px] bg-slate-900 border-slate-800 pl-8 focus:border-slate-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400">
                            <Filter size={14} />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-950/20">
                    <TabsContent value="authorized" className="p-6 m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Baseline Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-px bg-slate-800 flex-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Standing Rules (Baseline) - 100 Series</span>
                                <div className="h-px bg-slate-800 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {baselineRoes.map(roe => (
                                    <ROECard key={roe.id} roe={roe} />
                                ))}
                                {baselineRoes.length === 0 && <span className="text-xs text-slate-600 italic text-center w-full py-4">No matching baseline rules found.</span>}
                            </div>
                        </section>

                        {/* Mission Specific Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-px bg-slate-800 flex-1" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Mission Specific - 400 Series</span>
                                <div className="h-px bg-slate-800 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {missionRoes.map(roe => (
                                    <ROECard key={roe.id} roe={roe} />
                                ))}
                                {missionRoes.length === 0 && <span className="text-xs text-slate-600 italic text-center w-full py-4">No matching mission rules found.</span>}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="requests" className="p-6 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex gap-4 hover:border-slate-700 transition-all">
                                    <div className={cn(
                                        "w-1 rounded-full shrink-0",
                                        req.status === 'Approved' ? "bg-emerald-500" :
                                            req.status === 'Submitted' ? "bg-amber-500" :
                                                req.status === 'Draft' ? "bg-slate-500" : "bg-red-500"
                                    )} />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-black text-white">{req.id}</span>
                                                    <Badge variant="outline" className="text-[9px] uppercase border-slate-700 text-slate-400">ROE-{req.roeCode}</Badge>
                                                    <Badge className={cn(
                                                        "text-[9px] uppercase",
                                                        req.priority === 'Urgent' ? "bg-red-500/20 text-red-500" : "bg-slate-800 text-slate-400"
                                                    )}>{req.priority}</Badge>
                                                </div>
                                                <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">Request Type: <span className="text-slate-300">{req.requestType}</span></span>
                                            </div>
                                            <Badge className={cn(
                                                "uppercase text-[10px] font-black",
                                                req.status === 'Approved' ? "bg-emerald-500/10 text-emerald-500" :
                                                    req.status === 'Submitted' ? "bg-amber-500/10 text-amber-500" :
                                                        "bg-slate-800 text-slate-400"
                                            )}>{req.status}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-300 mb-3 bg-slate-950/50 p-2 rounded border border-slate-800/50 italic">
                                            "{req.justification}"
                                        </p>
                                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                                            <span>Requested By: <span className="text-white font-bold">{req.requestedBy}</span> • {new Date(req.timestamp).toLocaleDateString()}</span>
                                            {req.status === 'Submitted' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-slate-700 hover:bg-slate-800 text-slate-400">Reject</Button>
                                                    <Button size="sm" onClick={() => handleApproveRequest(req.id)} className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Approve Release</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="matrix" className="p-6 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center text-slate-500 italic">
                            <h3 className="text-lg font-bold text-slate-400 mb-2">Constraint Matrix Visualization</h3>
                            <p className="text-xs max-w-md mx-auto">
                                Visualization of ROE constraints mapped against force elements and geographic zones.
                                Feature scheduled for implementation in Phase 5.
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="guidance" className="p-6 m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Legal Advisory Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {advisories.map(adv => (
                                <div key={adv.id} className="flex flex-col gap-3 p-4 bg-slate-900/50 rounded border border-slate-800 hover:border-slate-700 transition-all">
                                    <div className="flex justify-between items-start">
                                        {adv.severity === 'Critical' ? <AlertOctagon className="text-red-500 shrink-0" size={18} /> : <ShieldCheck className="text-emerald-500 shrink-0" size={18} />}
                                        <Badge variant="outline" className="text-[9px] border-slate-700 text-slate-500 uppercase">{adv.region}</Badge>
                                    </div>
                                    <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                        {adv.text}
                                    </p>
                                    <div className="mt-auto pt-2 border-t border-slate-800/50 flex justify-between items-center text-[9px] text-slate-500">
                                        <span className="uppercase font-bold">Ref: LOAC-2024-{adv.id.substring(0, 4)}</span>
                                        <span className="text-blue-400 cursor-pointer hover:underline">View Source</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}

function ROECard({ roe }: { roe: ExtendedROE }) {
    const isReleased = (roe.status as any) === 'Released';

    return (
        <div className={cn(
            "p-6 rounded-3xl border-2 transition-all flex gap-6 group hover:shadow-2xl relative overflow-hidden",
            isReleased
                ? "bg-slate-900/40 border-slate-900 hover:border-emerald-500/20"
                : "bg-slate-900/20 border-slate-900 opacity-60"
        )}>
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col items-center justify-start w-16 shrink-0">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110",
                    isReleased ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                )}>
                    {isReleased ? <ShieldCheck size={24} /> : <Clock size={24} />}
                </div>
                <span className="text-2xl font-black text-white italic">{roe.code}</span>
                <span className="text-[8px] font-black text-slate-600 uppercase mt-1 tracking-widest leading-none">ROE SERIES</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-3">
                    <h4 className="text-base font-black text-white uppercase tracking-tight truncate pr-2">{roe.name}</h4>
                    <span className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded border uppercase whitespace-nowrap tracking-widest",
                        isReleased ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                        {roe.status}
                    </span>
                </div>
                <p className="text-xs text-slate-400 font-bold mb-5 leading-relaxed">
                    {roe.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/50">
                    {roe.constraints.map((c, idx) => (
                        <div key={idx} className="bg-slate-950 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-800 flex items-center gap-2 group-hover:border-slate-700 transition-colors">
                            <ShieldAlert size={12} className="text-slate-600" />
                            <span className="uppercase">{c}</span>
                        </div>
                    ))}
                    {roe.constraints.length === 0 && <span className="text-[10px] text-slate-700 font-black uppercase tracking-tighter self-center">No Target Constraints</span>}
                </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 pt-1">
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                    <FileText size={18} />
                </Button>
                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all">
                    <History size={18} />
                </Button>
            </div>
        </div>
    );
}
