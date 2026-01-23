import { useState, useEffect } from 'react';
import {
    Inbox,
    Send,
    Search,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    MoreHorizontal,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { RequestForInformation, UUID } from '@/lib/smartops/types';
import { Button } from '@/components/ui/button';

export function RFIManagement() {
    const [rfis, setRfis] = useState<RequestForInformation[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Inbound' | 'Outbound'>('All');
    const [statusFilter] = useState<'All' | 'Open' | 'Pending' | 'Closed'>('All');
    const [selectedRfiId, setSelectedRfiId] = useState<UUID | null>(null);
    const [responseText, setResponseText] = useState('');

    useEffect(() => {
        loadRFIs();
    }, []);

    async function loadRFIs() {
        setLoading(true);
        const data = await SmartOpsService.getRFIs();
        setRfis(data);
        setLoading(false);
    }

    const filteredRfis = rfis.filter((r: RequestForInformation) => {
        const directionMatch = filter === 'All' || r.direction === filter;
        const statusMatch = statusFilter === 'All' || r.status === statusFilter;
        return directionMatch && statusMatch;
    });

    const selectedRfi = rfis.find((r: RequestForInformation) => r.id === selectedRfiId);

    const handleSendResponse = async () => {
        if (!selectedRfiId || !responseText.trim()) return;
        await SmartOpsService.addRFIResponse(selectedRfiId, responseText, 'J3 Ops Chief');
        setResponseText('');
        loadRFIs();
    };

    const handleCloseRFI = async (id: UUID) => {
        await SmartOpsService.updateRFIStatus(id, 'Closed');
        loadRFIs();
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Sidebar List */}
            <div className="w-96 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/20">
                <div className="p-6 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Inbox className="text-blue-500" size={24} /> RFIs
                        </h1>
                        <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-white hover:bg-slate-800">
                            <Plus size={20} />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input
                                type="text"
                                placeholder="Search queries..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                            {['All', 'Inbound', 'Outbound'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as any)}
                                    className={cn(
                                        "flex-1 py-1.5 text-[9px] font-black uppercase rounded transition-all tracking-widest",
                                        filter === f ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-slate-600 animate-pulse text-[10px] uppercase font-bold tracking-widest">Intercepting Signals...</div>
                    ) : filteredRfis.length === 0 ? (
                        <div className="p-8 text-center text-slate-700 text-[10px] uppercase font-bold tracking-widest">No matching requirements</div>
                    ) : (
                        filteredRfis.map((rfi: RequestForInformation) => (
                            <div
                                key={rfi.id}
                                onClick={() => setSelectedRfiId(rfi.id)}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden",
                                    selectedRfiId === rfi.id
                                        ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                        : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {rfi.direction === 'Inbound' ? (
                                            <ArrowDownLeft size={12} className="text-emerald-500" />
                                        ) : (
                                            <ArrowUpRight size={12} className="text-blue-500" />
                                        )}
                                        <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{rfi.direction}</span>
                                    </div>
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase",
                                        rfi.status === 'Open' ? "bg-emerald-500/10 text-emerald-500" :
                                            rfi.status === 'Pending' ? "bg-amber-500/10 text-amber-500" : "bg-slate-800 text-slate-500"
                                    )}>
                                        {rfi.status}
                                    </div>
                                </div>
                                <h4 className="text-[11px] font-black text-white uppercase leading-tight mb-2 group-hover:text-blue-400 transition-colors">{rfi.subject}</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 border border-slate-700">
                                            {rfi.requestor.charAt(0)}
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-500">{rfi.requestor}</span>
                                    </div>
                                    <span className="text-[9px] font-mono text-slate-600">{new Date(rfi.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col bg-[#020617] relative">
                {selectedRfi ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="p-8 border-b border-slate-900 bg-slate-950/40 flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                                        selectedRfi.priority === 'Critical' ? "bg-red-500 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                                    )}>
                                        {selectedRfi.priority} Priority
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-600">ID: {selectedRfi.id}</span>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{selectedRfi.subject}</h2>
                                <div className="flex gap-8 text-[11px] font-bold uppercase tracking-wide">
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <User size={14} className="text-blue-500" />
                                        <span>Requestor: <span className="text-slate-300">{selectedRfi.requestor}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <Clock size={14} className="text-blue-500" />
                                        <span>Deadline: <span className="text-slate-300">{new Date(selectedRfi.deadline).toLocaleString()}</span></span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                {selectedRfi.status !== 'Closed' && (
                                    <Button
                                        onClick={() => handleCloseRFI(selectedRfi.id)}
                                        className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white uppercase text-[10px] font-black tracking-widest py-6 px-6 rounded-xl transition-all"
                                    >
                                        Mark Resolved <CheckCircle2 size={16} className="ml-2" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="rounded-xl w-12 h-12 text-slate-600 hover:text-white border border-slate-800">
                                    <MoreHorizontal size={20} />
                                </Button>
                            </div>
                        </div>

                        {/* Description & Responses */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <AlertCircle size={14} className="text-blue-500" /> Requirement Statement
                                </h3>
                                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 leading-relaxed shadow-inner">
                                    {selectedRfi.description}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <MessageSquare size={14} className="text-blue-500" /> Response Audit Chain
                                </h3>

                                <div className="space-y-4">
                                    {selectedRfi.responses.map((resp: any) => (
                                        <div key={resp.id} className="relative pl-8 group">
                                            <div className="absolute left-0 top-0 w-px h-full bg-slate-800 group-hover:bg-blue-500/30 transition-all" />
                                            <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-all" />

                                            <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-5 hover:border-slate-700 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-[10px] font-black text-blue-500 border border-blue-500/20">
                                                            {resp.responder.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-[11px] font-black text-white uppercase tracking-tight">{resp.responder}</div>
                                                            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Authenticated Staff</div>
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] font-mono text-slate-600">{new Date(resp.date).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-slate-300 leading-relaxed italic">"{resp.text}"</p>
                                            </div>
                                        </div>
                                    ))}

                                    {selectedRfi.status !== 'Closed' && (
                                        <div className="pt-4">
                                            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 focus-within:border-blue-500/50 transition-all shadow-2xl">
                                                <textarea
                                                    placeholder="Input official response..."
                                                    value={responseText}
                                                    onChange={(e) => setResponseText(e.target.value)}
                                                    className="w-full h-32 bg-transparent text-sm text-white outline-none resize-none placeholder:text-slate-700"
                                                />
                                                <div className="flex justify-between items-center mt-4">
                                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                        <ShieldCheck size={14} className="text-emerald-500" /> Encrypted Transmission
                                                    </div>
                                                    <Button
                                                        onClick={handleSendResponse}
                                                        disabled={!responseText.trim()}
                                                        className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl"
                                                    >
                                                        Transmit Response <Send size={14} className="ml-2" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-20 text-center relative overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full" />
                        <Inbox size={80} className="mb-6 opacity-30 relative z-10" />
                        <h3 className="text-xl font-black uppercase tracking-[0.3em] relative z-10">Select a Requirement</h3>
                        <p className="text-sm font-bold uppercase text-slate-600 mt-2 max-w-xs relative z-10">Audit all incoming and outgoing requests for information</p>
                    </div>
                )}
            </div>
        </div>
    );
}
