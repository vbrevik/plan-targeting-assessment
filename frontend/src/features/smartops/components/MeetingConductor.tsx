import { useState, useEffect } from 'react';
import {
    Check,
    ChevronRight,
    ChevronLeft,
    Clock,
    MapPin,
    Users,
    ShieldCheck,
    Gavel,
    AlertTriangle,
    FileText,
    Save,
    X,
    LayoutDashboard,
    ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { GovernanceSession, TermsOfReference, MeetingRecord, Proposal, UUID } from '@/lib/smartops/types';
import { useNavigate } from '@tanstack/react-router';

interface MeetingConductorProps {
    sessionId: UUID;
}

export function MeetingConductor({ sessionId }: MeetingConductorProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<GovernanceSession | null>(null);
    const [tor, setTor] = useState<TermsOfReference | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

    // Step 1: Logistics
    const [actualStartTime, setActualStartTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Step 2: Roll Call
    const [attendance, setAttendance] = useState<{ attendeeName: string; role: string; status: 'Present' | 'Absent' | 'Remote'; isReplacement?: boolean; replacementName?: string }[]>([]);

    // Step 3: Readiness
    const [readiness, setReadiness] = useState<{ cell: string; status: 'Green' | 'Amber' | 'Red'; comment: string }[]>([
        { cell: 'J2 Intel', status: 'Green', comment: '' },
        { cell: 'J3 Ops', status: 'Green', comment: '' },
        { cell: 'J4 Log', status: 'Green', comment: '' },
        { cell: 'J6 Comms', status: 'Green', comment: '' },
        { cell: 'LEGAD', status: 'Green', comment: '' },
    ]);

    // Step 4: Agenda & Decisions
    const [agendaProgress, setAgendaProgress] = useState<{ item: string; status: 'Covered' | 'Skipped' | 'Deferred'; notes: string }[]>([]);
    const [decisions, setDecisions] = useState<{ proposalId: string; decision: 'Approved' | 'Rejected' | 'Deferred'; rationale: string; provisos: string }[]>([]);

    // Step 5: Closing
    const [risks, setRisks] = useState<string[]>([]);
    const [guidance, setGuidance] = useState<string[]>([]);
    const [newRisk, setNewRisk] = useState('');
    const [newGuidance, setNewGuidance] = useState('');
    const [generalNotes, setGeneralNotes] = useState('');
    const [publishFrago, setPublishFrago] = useState(false);

    // Load Data
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const s = await SmartOpsService.getGovernanceSession(sessionId);
            if (!s) {
                navigate({ to: '/smartops/battle-rhythm' });
                return;
            }
            setSession(s);

            // Find TOR
            const tors = await SmartOpsService.getTORs();
            // Match by eventId if possible, or title
            const foundTor = tors.find(t => t.eventId === s.id.replace('gs-', 'bre-')) || tors[0];
            setTor(foundTor);

            // Fetch Proposals if any
            if (s.agendaItems && s.agendaItems.length > 0) {
                const allProposals = await SmartOpsService.getProposals();
                setProposals(allProposals.filter(p => s.agendaItems?.includes(p.id)));
            }

            // Initialize from TOR
            if (foundTor) {
                setAttendance(foundTor.participants.map(p => ({
                    attendeeName: 'TBD',
                    role: p.role,
                    status: 'Present'
                })));
                setAgendaProgress(foundTor.agenda.map(item => ({
                    item,
                    status: 'Covered',
                    notes: ''
                })));
            }

            setLoading(false);
        }
        loadData();
    }, [sessionId, navigate]);

    const handleSave = async () => {
        if (!session) return;
        const record: MeetingRecord = {
            sessionId: session.id,
            actualStartTime,
            actualEndTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rollCall: attendance,
            readinessStatus: readiness,
            outcomes: decisions.map(d => ({ ...d, proposalId: d.proposalId, decision: d.decision })),
            agendaCoverage: agendaProgress,
            riskAccepted: risks,
            guidanceIssued: guidance,
            notes: generalNotes
        };
        await SmartOpsService.saveMeetingRecord(record);

        if (publishFrago) {
            await SmartOpsService.generateProductReport(
                `FRAGO - Derived from ${session.title}`,
                'FRAGO',
                record,
                'COM JTF (Commander)'
            );
        }

        navigate({ to: '/smartops/battle-rhythm' });
    };

    const renderStepContent = () => {
        if (!session) return null;
        switch (step) {
            case 1: // Logistics
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-xl shadow-inner-lg">
                            <h3 className="text-sm font-black text-blue-400 uppercase mb-8 flex items-center gap-3 tracking-[0.2em]">
                                <Clock size={18} /> Meeting Logistics Verification
                            </h3>
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest block">Scheduled Time</label>
                                    <div className="text-3xl font-black text-white font-mono tracking-tighter">
                                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Correction not required for internal log</p>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest block">Actual Start Time</label>
                                    <input
                                        type="time"
                                        value={actualStartTime}
                                        onChange={(e) => setActualStartTime(e.target.value)}
                                        className="bg-slate-950 border-2 border-slate-800 rounded-lg p-4 text-2xl text-blue-400 font-mono w-full focus:border-blue-500 outline-none transition-all shadow-lg"
                                    />
                                </div>
                                <div className="col-span-2 p-6 bg-slate-950/50 rounded-lg border border-slate-800/50">
                                    <label className="text-[10px] uppercase text-slate-500 font-black tracking-widest block mb-3">Verified AO / Location</label>
                                    <div className="flex items-center gap-4 text-xl font-bold text-white">
                                        <div className="p-3 bg-blue-600/10 rounded-lg border border-blue-500/20">
                                            <MapPin size={24} className="text-blue-500" />
                                        </div>
                                        {session.location}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border border-amber-500/20 bg-amber-500/5 rounded-xl flex gap-4 items-start">
                            <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Authorization Notice</h4>
                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                    This session is recorded as a formal Governance Event. All decisions made within this module are cross-referenced with the digital twin and impact operational state in real-time. Ensure quorum is present before proceeding.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 2: // Roll Call
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-end mb-4 px-2">
                            <div>
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Users size={18} /> Roll Call Summary
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Authenticating participants against TOR Charter</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-black text-white font-mono">{attendance.filter(a => a.status === 'Present' || a.status === 'Remote').length}</span>
                                <span className="text-xl font-black text-slate-700 font-mono"> / {attendance.length}</span>
                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Quorum Status: <span className="text-emerald-500">Verified</span></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 max-h-[60vh]">
                            {attendance.map((att, idx) => (
                                <div key={idx} className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all shadow-sm">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-blue-500 group-hover:border-blue-500/30 transition-all">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-black text-white uppercase tracking-tight">{att.role}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase bg-slate-800 px-1.5 py-0.5 rounded">Required</span>
                                                {att.isReplacement && <span className="text-[9px] text-amber-500 font-bold uppercase bg-amber-500/10 px-1.5 py-0.5 rounded">Replacement: {att.replacementName}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 shadow-inner">
                                            {['Present', 'Remote', 'Absent'].map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => {
                                                        const newAtt = [...attendance];
                                                        newAtt[idx].status = s as any;
                                                        setAttendance(newAtt);
                                                    }}
                                                    className={cn(
                                                        "px-4 py-2 text-[10px] rounded-md uppercase font-black transition-all tracking-tighter",
                                                        att.status === s
                                                            ? (s === 'Present' ? 'bg-emerald-600 text-white shadow-lg' : s === 'Remote' ? 'bg-blue-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg')
                                                            : "text-slate-600 hover:text-slate-400 hover:bg-slate-900"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="w-px h-8 bg-slate-800" />

                                        <div className="flex items-center gap-3">
                                            <label className="text-[10px] text-slate-500 font-black uppercase cursor-pointer flex items-center gap-2 group-hover:text-slate-300 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={att.isReplacement || false}
                                                    onChange={(e) => {
                                                        const newAtt = [...attendance];
                                                        newAtt[idx].isReplacement = e.target.checked;
                                                        if (!e.target.checked) newAtt[idx].replacementName = '';
                                                        setAttendance(newAtt);
                                                    }}
                                                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500 accent-blue-600"
                                                />
                                                Delegate?
                                            </label>
                                            {att.isReplacement && (
                                                <input
                                                    type="text"
                                                    placeholder="Enter Full Name..."
                                                    value={att.replacementName || ''}
                                                    onChange={(e) => {
                                                        const newAtt = [...attendance];
                                                        newAtt[idx].replacementName = e.target.value;
                                                        setAttendance(newAtt);
                                                    }}
                                                    className="w-40 bg-slate-950 border-b-2 border-blue-500/30 rounded px-3 py-1.5 text-xs text-blue-400 focus:border-blue-500 outline-none placeholder:text-slate-700"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 3: // Readiness
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-2">
                                <ShieldCheck size={18} /> Functional Readiness Polling
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Each functional cell must declare operational readiness or flag critical gaps</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {readiness.map((r, idx) => (
                                <div key={idx} className="flex items-center gap-8 p-6 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group">
                                    <div className="w-32 text-lg font-black text-white uppercase tracking-tighter group-hover:text-blue-400 transition-colors">{r.cell}</div>

                                    <div className="flex gap-4 p-2 bg-slate-950 rounded-full border border-slate-800 shadow-inner">
                                        {['Green', 'Amber', 'Red'].map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => {
                                                    const newReady = [...readiness];
                                                    newReady[idx].status = color as any;
                                                    setReadiness(newReady);
                                                }}
                                                className={cn(
                                                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all transform hover:scale-110 shadow-lg",
                                                    r.status === color
                                                        ? (color === 'Green' ? 'bg-emerald-500 border-emerald-300 ring-4 ring-emerald-500/20' : color === 'Amber' ? 'bg-amber-500 border-amber-300 ring-4 ring-amber-500/20' : 'bg-red-500 border-red-300 ring-4 ring-red-500/20')
                                                        : "bg-slate-900 border-slate-800 opacity-50 grayscale hover:grayscale-0 hover:opacity-100"
                                                )}
                                            >
                                                {r.status === color && <Check size={20} className="text-black stroke-[3px]" />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Status justification or primary risk..."
                                            value={r.comment}
                                            onChange={(e) => {
                                                const newReady = [...readiness];
                                                newReady[idx].comment = e.target.value;
                                                setReadiness(newReady);
                                            }}
                                            className="w-full bg-transparent border-b-2 border-slate-800 focus:border-blue-500 outline-none text-sm text-slate-300 py-2 transition-all placeholder:text-slate-700 font-medium"
                                        />
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                                            <FileText size={14} className="text-slate-700" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {readiness.some(r => r.status === 'Red') && (
                            <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg flex gap-3 items-center animate-pulse">
                                <AlertTriangle className="text-red-500" size={18} />
                                <span className="text-[11px] font-black text-red-500 uppercase tracking-widest">Caution: Critical Readiness Gaps Detected. Proceed with deliberation.</span>
                            </div>
                        )}
                    </div>
                );

            case 4: // Agenda & Decisions
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-2">
                                    <Gavel size={18} /> Governance Agenda & Adjudication
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Processing formal proposals requiring commander's decision</p>
                            </div>
                            <div className="px-3 py-1 bg-blue-600/10 border border-blue-500/20 rounded-full">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{proposals.length} Items Pendìng</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                            {/* Decisions Section */}
                            <div className="grid grid-cols-1 gap-6">
                                {proposals.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-800 rounded-2xl text-slate-700">
                                        <FileText size={48} className="mb-4 opacity-20" />
                                        <p className="text-sm font-black uppercase tracking-widest text-center">No proposals awaiting<br />decision in this session</p>
                                    </div>
                                ) : (
                                    proposals.map(prop => {
                                        const currentDecision = decisions.find(d => d.proposalId === prop.id);
                                        return (
                                            <div key={prop.id} className="group relative overflow-hidden bg-slate-900/60 border-2 border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all shadow-xl">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />

                                                <div className="p-8">
                                                    <div className="flex justify-between items-start gap-8 mb-8">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase rounded border border-blue-500/20 tracking-wider">Proposal ID: {prop.id}</span>
                                                                <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-black uppercase rounded tracking-wider">{prop.type}</span>
                                                            </div>
                                                            <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors">{prop.title}</h4>
                                                            <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-wide">Origin: J2 Targeting Section | Priority: ALPHA</p>
                                                        </div>

                                                        <div className="flex flex-col gap-2 shrink-0">
                                                            {['Approved', 'Deferred', 'Rejected'].map(d => (
                                                                <button
                                                                    key={d}
                                                                    onClick={() => {
                                                                        const newDecs = decisions.filter(x => x.proposalId !== prop.id);
                                                                        newDecs.push({
                                                                            proposalId: prop.id,
                                                                            decision: d as any,
                                                                            rationale: currentDecision?.rationale || '',
                                                                            provisos: currentDecision?.provisos || ''
                                                                        });
                                                                        setDecisions(newDecs);
                                                                    }}
                                                                    className={cn(
                                                                        "w-40 py-3 text-[11px] uppercase font-black border-2 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                                                                        currentDecision?.decision === d
                                                                            ? (d === 'Approved' ? 'bg-emerald-600 border-emerald-400 text-white translate-x-[-4px]' : d === 'Rejected' ? 'bg-red-600 border-red-400 text-white translate-x-[-4px]' : 'bg-amber-600 border-amber-400 text-white translate-x-[-4px]')
                                                                            : "bg-slate-950 border-slate-800 text-slate-600 hover:text-white hover:border-slate-600"
                                                                    )}
                                                                >
                                                                    {currentDecision?.decision === d && <Check size={14} className="stroke-[3px]" />}
                                                                    {d}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className={cn(
                                                        "space-y-4 transition-all duration-300 overflow-hidden",
                                                        currentDecision ? "max-h-96 opacity-100 mt-0" : "max-h-0 opacity-0"
                                                    )}>
                                                        <div className="relative">
                                                            <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-2">Commander's Rationale / Instructions</label>
                                                            <textarea
                                                                placeholder="Detail why this decision was reached or specify changes required..."
                                                                value={currentDecision?.rationale || ''}
                                                                onChange={(e) => {
                                                                    const newDecs = decisions.map(x => x.proposalId === prop.id ? { ...x, rationale: e.target.value } : x);
                                                                    setDecisions(newDecs);
                                                                }}
                                                                className="w-full h-32 bg-slate-950/50 border-2 border-slate-800 rounded-xl p-4 text-sm text-white focus:border-blue-500 outline-none shadow-inner resize-none transition-all"
                                                            />
                                                        </div>

                                                        {currentDecision?.decision === 'Approved' && (
                                                            <div className="p-4 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-xl">
                                                                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-2">Binding Provisos / Conditions</label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="e.g. Only authorized during non-peak civilian hours..."
                                                                    value={currentDecision.provisos}
                                                                    onChange={(e) => {
                                                                        const newDecs = decisions.map(x => x.proposalId === prop.id ? { ...x, provisos: e.target.value } : x);
                                                                        setDecisions(newDecs);
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-emerald-500/30 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none shadow-sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Agenda Items Checkbox Section */}
                            <div className="p-8 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner">
                                <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mb-6 flex items-center gap-2">
                                    <LayoutDashboard size={14} className="text-slate-600" /> Administrative Agenda Items
                                </h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {agendaProgress.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-6 p-4 bg-slate-900/30 rounded-xl border border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                            <div className="flex-1">
                                                <div className="text-xs font-black text-slate-300 uppercase tracking-tight">{item.item}</div>
                                            </div>
                                            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                                {['Covered', 'Skipped', 'Deferred'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => {
                                                            const newAg = [...agendaProgress];
                                                            newAg[idx].status = s as any;
                                                            setAgendaProgress(newAg);
                                                        }}
                                                        className={cn(
                                                            "px-3 py-1.5 text-[9px] uppercase font-black rounded-md transition-all",
                                                            item.status === s ? "bg-slate-700 text-white shadow-md shadow-black/40" : "text-slate-600 hover:text-slate-400"
                                                        )}
                                                    >{s}</button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Agenda outcome summary..."
                                                value={item.notes}
                                                onChange={(e) => {
                                                    const newAg = [...agendaProgress];
                                                    newAg[idx].notes = e.target.value;
                                                    setAgendaProgress(newAg);
                                                }}
                                                className="w-64 bg-transparent border-b border-slate-800 focus:border-blue-500 outline-none text-[11px] text-slate-400 py-1 transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5: // Closing
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-2">
                                    <FileText size={18} /> Formal Minutes & Commander's Log
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Final records for operational audit and legal verification</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                {/* Risks */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black text-red-500 uppercase flex items-center gap-2 tracking-widest">
                                            <AlertTriangle size={14} /> Risks Accepted
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Audit Category: J3-Risk</span>
                                    </div>
                                    <div className="space-y-2">
                                        {risks.map((r, i) => (
                                            <div key={i} className="flex gap-4 items-start p-4 bg-red-950/10 rounded-xl border border-red-500/20 group hover:bg-red-950/20 transition-all">
                                                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-1">
                                                    <AlertTriangle size={12} className="text-red-500" />
                                                </div>
                                                <div className="text-xs text-red-200/80 font-medium leading-relaxed flex-1">{r}</div>
                                                <button
                                                    onClick={() => setRisks(risks.filter((_, idx) => idx !== i))}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                                >
                                                    <X size={12} className="text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <input
                                            type="text"
                                            placeholder="Identify specific operational risk accepted..."
                                            value={newRisk}
                                            onChange={(e) => setNewRisk(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newRisk) {
                                                    setRisks([...risks, newRisk]);
                                                    setNewRisk('');
                                                }
                                            }}
                                            className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-red-500 outline-none shadow-sm transition-all"
                                        />
                                        <button
                                            onClick={() => {
                                                if (newRisk) {
                                                    setRisks([...risks, newRisk]);
                                                    setNewRisk('');
                                                }
                                            }}
                                            className="px-6 py-2 bg-slate-900 border-2 border-red-500/30 hover:border-red-500 text-red-500 rounded-xl transition-all font-black uppercase tracking-widest text-[9px]"
                                        >Add</button>
                                    </div>
                                </div>

                                {/* Guidance */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-black text-emerald-500 uppercase flex items-center gap-2 tracking-widest">
                                            <FileText size={14} /> Commander's Guidance
                                        </h3>
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Audit Category: JOC-Policy</span>
                                    </div>
                                    <div className="space-y-2">
                                        {guidance.map((g, i) => (
                                            <div key={i} className="flex gap-4 items-start p-4 bg-emerald-950/10 rounded-xl border border-emerald-500/20 group hover:bg-emerald-950/20 transition-all">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                                                    <Check size={12} className="text-emerald-500" />
                                                </div>
                                                <div className="text-xs text-emerald-200/80 font-medium leading-relaxed flex-1">{g}</div>
                                                <button
                                                    onClick={() => setGuidance(guidance.filter((_, idx) => idx !== i))}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-500/20 rounded transition-all"
                                                >
                                                    <X size={12} className="text-emerald-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 mt-4">
                                        <input
                                            type="text"
                                            placeholder="Identify specific guidance point..."
                                            value={newGuidance}
                                            onChange={(e) => setNewGuidance(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newGuidance) {
                                                    setGuidance([...guidance, newGuidance]);
                                                    setNewGuidance('');
                                                }
                                            }}
                                            className="flex-1 bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:border-emerald-500 outline-none shadow-sm transition-all"
                                        />
                                        <button
                                            onClick={() => {
                                                if (newGuidance) {
                                                    setGuidance([...guidance, newGuidance]);
                                                    setNewGuidance('');
                                                }
                                            }}
                                            className="px-6 py-2 bg-slate-900 border-2 border-emerald-500/30 hover:border-emerald-500 text-emerald-500 rounded-xl transition-all font-black uppercase tracking-widest text-[9px]"
                                        >Add</button>
                                    </div>
                                </div>
                            </div>

                            {/* General Notes */}
                            <div className="pt-8 border-t border-slate-800">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] block mb-4">Official Executive Record Summary</label>
                                <textarea
                                    className="w-full h-40 bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-sm text-slate-300 focus:border-blue-500 outline-none resize-none shadow-inner leading-relaxed transition-all"
                                    placeholder="Synthesize the primary outcomes of this session for the executive log..."
                                    value={generalNotes}
                                    onChange={(e) => setGeneralNotes(e.target.value)}
                                />
                            </div>

                            <div className="pt-8 border-t border-slate-800">
                                <div className={cn(
                                    "p-8 rounded-2xl border-2 transition-all group overflow-hidden relative",
                                    publishFrago ? "bg-blue-600/10 border-blue-500 shadow-blue-500/10" : "bg-slate-900/30 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                )}>
                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "w-16 h-16 rounded-xl flex items-center justify-center transition-all",
                                                publishFrago ? "bg-blue-600 shadow-lg text-white" : "bg-slate-800 text-slate-500"
                                            )}>
                                                <Save size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white uppercase tracking-tight">Formalise as FRAGO</h4>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Generate a signed Fragmentary Order based on these decisions</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setPublishFrago(!publishFrago)}
                                            className={cn(
                                                "px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                                                publishFrago ? "bg-blue-600 text-white shadow-xl shadow-blue-900/40" : "bg-slate-800 text-slate-400 hover:text-white"
                                            )}
                                        >
                                            {publishFrago ? "ENABLED" : "ENABLE FRAGO"}
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <ShieldCheck size={120} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-[#020617] text-blue-500">
                <Gavel className="animate-bounce mb-4" size={48} />
                <span className="text-[10px] uppercase font-black tracking-[1em] ml-[1em] animate-pulse">Convening Board...</span>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="h-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Top Bar / Navigation */}
            <div className="h-16 flex items-center px-8 border-b border-slate-900 bg-slate-950 shrink-0 justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate({ to: '/smartops/battle-rhythm' })}
                        className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-white transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-8 w-px bg-slate-800" />
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse">Session Active</span>
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        </div>
                        <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{session.title}</h1>
                        {tor && (
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Charter:</span>
                                <span className="text-[10px] text-blue-400 font-black uppercase tracking-tight">{tor.title}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Decision Path</span>
                        <div className="flex items-center gap-3">
                            <ShieldCheck size={14} className="text-blue-500" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Authenticated Governance</span>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate({ to: '/smartops/battle-rhythm' })}
                        className="p-3 bg-red-950/20 hover:bg-red-600 hover:text-white text-red-500 rounded-xl border border-red-900/40 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
                    >
                        Abort Session <X size={16} />
                    </button>
                </div>
            </div>

            {/* Main Page Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Steps Navigation Sidebar */}
                <div className="w-72 border-r border-slate-900 flex flex-col shrink-0 bg-slate-950/50 p-6 space-y-2">
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 pl-3">Phase Status</div>
                    {[
                        { id: 1, label: '01 Logistics', desc: 'Time, location & quorum' },
                        { id: 2, label: '02 Roll Call', desc: 'Identify mandated actors' },
                        { id: 3, label: '03 Readiness', desc: 'Poll functional status' },
                        { id: 4, label: '04 Adjudication', desc: 'Decision processing' },
                        { id: 5, label: '05 Closeout', desc: 'Minutes & legal log' },
                    ].map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStep(s.id as any)}
                            className={cn(
                                "relative w-full text-left px-4 py-4 rounded-xl transition-all group overflow-hidden",
                                step === s.id
                                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                                    : s.id < step
                                        ? "text-slate-400 hover:bg-slate-900 shadow-inner"
                                        : "text-slate-700 hover:bg-slate-900/50"
                            )}
                        >
                            {step === s.id && (
                                <div className="absolute left-0 top-0 w-1 h-full bg-blue-300" />
                            )}
                            <div className="flex items-center justify-between pointer-events-none">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-wider">{s.label}</div>
                                    <div className={cn(
                                        "text-[9px] font-bold uppercase tracking-tight mt-1",
                                        step === s.id ? "text-blue-100" : "text-slate-600"
                                    )}>{s.desc}</div>
                                </div>
                                {s.id < step && <Check size={16} className="text-emerald-500 stroke-[3px]" />}
                            </div>
                        </button>
                    ))}

                    <div className="flex-1" />

                    <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Audit Hash</div>
                        <div className="text-[10px] font-mono text-slate-500 break-all leading-tight">SHA256: 4f9e1d...3a2b1c</div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-slate-950 h-full relative overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

                    {/* Progress Indicator */}
                    <div className="h-1.5 w-full bg-slate-900 flex shrink-0">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <div
                                key={s}
                                className={cn(
                                    "flex-1 transition-all duration-1000 ease-out",
                                    s < step ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : s === step ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.6)]" : "bg-slate-800"
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex-1 p-12 overflow-hidden flex flex-col relative z-10">
                        <div className="flex-1 overflow-visible">
                            <div className="max-w-4xl mx-auto h-full flex flex-col">
                                {renderStepContent()}
                            </div>
                        </div>

                        {/* Navigation Actions Footer */}
                        <div className="max-w-4xl mx-auto w-full pt-10 mt-6 border-t border-slate-900/50 flex justify-between items-center">
                            <button
                                onClick={() => setStep(Math.max(1, step - 1) as any)}
                                disabled={step === 1}
                                className="px-5 py-3 rounded-lg text-xs font-black uppercase text-slate-600 hover:text-white hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center gap-3 tracking-widest"
                            >
                                <ChevronLeft size={18} /> Previous Phase
                            </button>

                            <div className="flex gap-4">
                                {step < 5 ? (
                                    <button
                                        onClick={() => setStep(Math.min(5, step + 1) as any)}
                                        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-3 transition-all shadow-xl shadow-blue-950/40 hover:scale-105 active:scale-95 group tracking-widest"
                                    >
                                        Proceed to Next Phase <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase flex items-center gap-3 transition-all shadow-2xl shadow-emerald-950/60 animate-pulse hover:animate-none hover:scale-105 active:scale-95 tracking-[0.2em]"
                                    >
                                        <Save size={20} /> Conclude Session & Persist
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
