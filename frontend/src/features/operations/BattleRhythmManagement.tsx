import { useEffect, useState } from 'react';
import {
    Users,
    ChevronLeft,
    ChevronRight,
    Gavel,
    Info,
    ShieldCheck,
    Calendar,
    Clock4,
    FileText,
    MessageSquare,
    Send,
    Check,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { OntologyService, type Entity } from '@/lib/mshnctrl/services/ontology.service';
import { cn } from '@/lib/utils';
import type { GovernanceSession, BattleRhythmEvent, TermsOfReference } from '@/lib/mshnctrl/types';
import { BattleRhythmType } from '@/lib/mshnctrl/types';
import { useNavigate } from '@tanstack/react-router';

type ViewMode = 'Week' | 'Month';

export function BattleRhythmManagement() {
    const [events, setEvents] = useState<BattleRhythmEvent[]>([]);
    const [sessions, setSessions] = useState<GovernanceSession[]>([]);
    const [tors, setTors] = useState<TermsOfReference[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('Week');
    const [currentDate, setCurrentDate] = useState(new Date('2026-01-05T00:00:00Z'));
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [activeTor, setActiveTor] = useState<TermsOfReference | null>(null);
    const [viewMinutesSession, setViewMinutesSession] = useState<GovernanceSession | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                // Fetch all Events from Ontology
                const eventsRaw = await OntologyService.getEntities({ type: 'Event' });
                // We also need TORs? Maybe fetch all 'TOR' entities
                // const torsRaw = await OntologyService.getEntities({ type: 'TOR' }); 
                // For MVP, lets assume Events contain enough info or we map them.

                // Map Entity -> BattleRhythmEvent / GovernanceSession
                // Assumption: 'Event' entities represent specific scheduled sessions.
                const mappedSessions: GovernanceSession[] = eventsRaw.map((e: Entity) => ({
                    id: e.id,
                    title: e.name,
                    type: (Object.values(BattleRhythmType).includes(e.properties?.type) ? e.properties.type : BattleRhythmType.CoordinationMeeting),
                    startTime: e.properties?.start_time || new Date().toISOString(),
                    endTime: e.properties?.end_time || new Date(new Date(e.properties?.start_time || Date.now()).getTime() + 60 * 60 * 1000).toISOString(),
                    duration: e.properties?.duration || 60,
                    location: e.properties?.location || 'Virtual',
                    chair: e.properties?.chair || 'J3',
                    attendees: [], // Fetch if needed or map from properties
                    agenda: [],
                    status: e.properties?.status || 'Scheduled',
                    meetingRecord: e.properties?.meetingRecord,
                    inputs: [],
                    outputs: []
                }));

                setSessions(mappedSessions);
                // For 'events' (recurring definitions), we might not have them in Ontology as separate types yet. 
                // We'll just use sessions for the calendar for now.
                setEvents([]);
                setTors([]); // TODO: Fetch TORs if linked

            } catch (err) {
                console.error("Failed to load battle rhythm", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const getTypeColor = (type: BattleRhythmType) => {
        switch (type) {
            case BattleRhythmType.DecisionBoard: return 'bg-red-500 border-red-400 text-white';
            case BattleRhythmType.WorkingGroup: return 'bg-blue-500 border-blue-400 text-white';
            case BattleRhythmType.CoordinationMeeting: return 'bg-emerald-500 border-emerald-400 text-white';
            default: return 'bg-slate-700 border-slate-600 text-slate-200';
        }
    };

    const getTypeIcon = (type: BattleRhythmType) => {
        switch (type) {
            case BattleRhythmType.DecisionBoard: return <Gavel size={12} />;
            case BattleRhythmType.WorkingGroup: return <Users size={12} />;
            default: return <Clock4 size={12} />;
        }
    };

    // Calculate Week Days
    const getWeekDays = (date: Date) => {
        const start = new Date(date);
        start.setDate(date.getDate() - date.getDay() + 1); // Start Monday
        return Array.from({ length: 5 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });
    };

    const weekDays = getWeekDays(currentDate);

    // Map events to time slots for the week view
    // Simplified Mock Logic: Just showing events that have a 'nextSlot' in this week or sessions scheduled
    const getEventsForDay = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        // Combine Scheduled Sessions and Recurring Definition
        return events.filter(e => e.nextSlot.startsWith(dateStr)).map(e => ({
            ...e,
            isSession: false,
            time: new Date(e.nextSlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })).concat(
            sessions.filter(s => s.startTime.startsWith(dateStr)).map(s => ({
                id: s.id,
                name: s.title,
                type: s.type,
                nextSlot: s.startTime,
                chairRole: s.chair,
                isSession: true,
                time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } as any))
        );
    };

    const handleEventClick = (event: any) => {
        setSelectedEventId(event.id);
        const tor = tors.find(t => t.eventId === event.id) || tors.find(t => t.eventId === event.id.replace('gs-', 'bre-')); // Mock link hack
        setActiveTor(tor || null);
    };

    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        // Adjust to start from the last Monday of previous month or first day
        const startDay = startOfMonth.getDay(); // 0 is Sunday
        const daysInPrevMonthToShow = startDay === 0 ? 6 : startDay - 1;

        const days = [];
        const calendarStart = new Date(startOfMonth);
        calendarStart.setDate(startOfMonth.getDate() - daysInPrevMonthToShow);

        for (let i = 0; i < 35; i++) {
            const d = new Date(calendarStart);
            d.setDate(calendarStart.getDate() + i);
            days.push(d);
        }

        return (
            <div className="grid grid-cols-7 gap-[1px] bg-slate-800 border border-slate-800 h-full overflow-hidden rounded-lg">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="bg-slate-950 p-2 text-center border-b border-slate-800">
                        <span className="text-[10px] font-black text-slate-500 uppercase">{d}</span>
                    </div>
                ))}
                {days.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                        <div key={idx} className={cn(
                            "bg-slate-950/40 min-h-[100px] p-2 transition-colors hover:bg-slate-900/60 overflow-y-auto",
                            !isCurrentMonth && "opacity-30"
                        )}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    day.toDateString() === new Date().toDateString() ? "text-blue-500" : "text-slate-500"
                                )}>{day.getDate()}</span>
                                {dayEvents.length > 0 && <span className="text-[8px] font-black bg-blue-500/10 text-blue-500 px-1 rounded">{dayEvents.length}</span>}
                            </div>
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map(event => (
                                    <div
                                        key={event.id}
                                        onClick={() => handleEventClick(event)}
                                        className={cn(
                                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border cursor-pointer truncate",
                                            getTypeColor(event.type).replace('text-white', 'bg-opacity-20 border-opacity-30')
                                        )}
                                    >
                                        {event.time} {event.name}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-[8px] text-slate-600 font-bold px-1">+{dayEvents.length - 3} more</div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };



    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Syncing Battle Rhythm...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white uppercase tracking-tight">Battle Rhythm</h1>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                <span>Cycle 24-A</span>
                                <span className="text-slate-600">|</span>
                                <span>UTC+01:00</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-900 border border-slate-800 rounded p-1">
                            {['Week', 'Month'].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setViewMode(m as ViewMode)}
                                    className={cn(
                                        "px-4 py-1.5 text-[10px] font-black uppercase rounded transition-all",
                                        viewMode === m ? "bg-blue-600 text-white" : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-2 py-1">
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ChevronLeft size={16} /></button>
                            <span className="text-[11px] font-bold text-white uppercase w-32 text-center">
                                {viewMode === 'Week' ? `Week ${Math.ceil(currentDate.getDate() / 7)} Jan 26` : 'January 2026'}
                            </span>
                            <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="p-1 hover:bg-slate-800 rounded text-slate-400"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 overflow-y-auto p-4 relative">
                    {/* Flow Lines could theoretically go here as absolute SVG */}
                    {viewMode === 'Week' ? (
                        <div className="grid grid-cols-5 gap-4 h-full min-h-[600px]">
                            {weekDays.map((day, idx) => (
                                <div key={idx} className="flex flex-col gap-3">
                                    <div className="text-center pb-2 border-b border-slate-800 sticky top-0 bg-[#020617] z-10">
                                        <span className="text-[10px] font-black text-slate-500 uppercase block">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="text-xl font-black text-white">{day.getDate()}</span>
                                    </div>

                                    <div className="flex-1 space-y-3 py-2">
                                        {getEventsForDay(day).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={() => handleEventClick(event)}
                                                className={cn(
                                                    "p-3 rounded-lg border cursor-pointer transition-all relative group",
                                                    selectedEventId === event.id ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-[#020617]" : "hover:border-slate-600",
                                                    getTypeColor(event.type).replace('text-white', 'bg-opacity-10 border-opacity-20') // Convert standard classes to low-opacity background
                                                )}
                                            >
                                                {/* Connecting Line Indicator if this event feeds into another active one */}
                                                {event.feedsInto && (
                                                    <div className="absolute -right-4 top-1/2 w-4 h-[2px] bg-slate-700 hidden group-hover:block" />
                                                )}

                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[10px] font-mono font-bold text-slate-400">{event.time}</span>
                                                    <div className={cn("p-1 rounded bg-black/20", getTypeColor(event.type).replace('bg-opacity-10', ''))}>
                                                        {getTypeIcon(event.type)}
                                                    </div>
                                                </div>
                                                <h4 className="text-[11px] font-black text-white uppercase leading-tight mb-2">{event.name}</h4>

                                                {/* Concluded Session Minutes Indicator */}
                                                {event.isSession && sessions.find(s => s.id === event.id)?.status === 'Concluded' && (
                                                    <div className="mb-2 p-1 px-2 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center gap-2">
                                                        <FileText size={10} className="text-emerald-500" />
                                                        <span className="text-[8px] font-black text-emerald-500 uppercase">Minutes Available</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                            {event.chairRole.charAt(0)}
                                                        </div>
                                                        <span className="text-[9px] font-bold text-slate-500 truncate max-w-[60px]">{event.chairRole}</span>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        {event.type === BattleRhythmType.DecisionBoard && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate({ to: `/mshnctrl/conduct/${event.id}` });
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 bg-blue-600 hover:bg-blue-500 rounded text-white transition-all transform scale-90 hover:scale-100 flex items-center shadow-lg shadow-blue-900/20"
                                                                title="Run Meeting"
                                                            >
                                                                <Gavel size={10} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                // Check for session record
                                                                const session = sessions.find(s => s.id === (event as any).id);
                                                                if (session && session.meetingRecord) {
                                                                    setViewMinutesSession(session);
                                                                }
                                                            }}
                                                            className={cn(
                                                                "opacity-0 group-hover:opacity-100 p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-all transform scale-90 hover:scale-100 flex items-center",
                                                                !(event as any).isSession ? "hidden" : ""
                                                            )}
                                                            title="View Minutes"
                                                        >
                                                            <FileText size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : renderMonthView()}
                </div>
            </div>

            {/* Side Panel: Event Details & TOR */}
            <div className={cn(
                "w-[400px] border-l border-slate-800 bg-slate-950/50 flex flex-col shrink-0 transition-all duration-300",
                selectedEventId ? "translate-x-0" : "translate-x-full w-0 opacity-0 overflow-hidden"
            )}>
                {selectedEventId && activeTor ? (
                    <>
                        <div className="p-6 border-b border-slate-800 bg-slate-950">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <ShieldCheck size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Authorized Event</span>
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight max-w-[70%]">{activeTor.title}</h2>
                                {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.status === 'Concluded' ? (
                                    <button
                                        className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-600/50 rounded text-[10px] font-bold uppercase flex items-center gap-2 transition-colors cursor-default"
                                    >
                                        <Check size={12} /> Minutes Available
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            const currentSession = sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')));
                                            if (currentSession) {
                                                navigate({ to: '/mshnctrl/conduct/$sessionId', params: { sessionId: currentSession.id } });
                                            }
                                        }}
                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        <Gavel size={12} /> Conduct Meeting
                                    </button>
                                )}
                            </div>
                            <button className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded flex items-center gap-2 transition-colors">
                                <FileText size={12} /> View Full PDF
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Objectives */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Objectives</h3>
                                <ul className="space-y-2">
                                    {activeTor.objectives.map((obj, i) => (
                                        <li key={i} className="flex gap-3 text-[11px] text-slate-300">
                                            <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                                            {obj}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Participants & Signatories */}
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Required Participants</h3>
                                    <span className={cn(
                                        "text-[9px] font-black px-2 py-0.5 rounded uppercase border",
                                        activeTor.participants.every(p => !p.required) ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-800 text-slate-500 border-slate-700"
                                    )}>
                                        Quorum Check
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {activeTor.participants.map((p, i) => (
                                        <div key={i} className={cn(
                                            "flex items-center justify-between p-2 rounded border transition-colors",
                                            p.role.includes('LEGAD') || p.role.includes('POLAD')
                                                ? "bg-blue-900/10 border-blue-500/30"
                                                : "bg-slate-900/50 border-slate-800"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-white">{p.role}</span>
                                                {(p.role.includes('LEGAD') || p.role.includes('POLAD')) && (
                                                    <ShieldCheck size={10} className="text-blue-400" />
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {(p.role.includes('LEGAD') || p.role.includes('POLAD')) && p.required && (
                                                    <span className="text-[8px] font-black text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30 uppercase">
                                                        Signatory
                                                    </span>
                                                )}
                                                {p.required && <span className="text-[9px] font-bold text-red-400 uppercase">Mandatory</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Meeting Minutes (If Concluded) */}
                            {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord && (
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-3 flex items-center gap-2">
                                        <FileText size={12} /> Meeting Minutes
                                    </h3>
                                    <div className="space-y-3">
                                        {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.outcomes.map((o, i) => (
                                            <div key={i} className="p-2 bg-emerald-950/50 rounded border border-emerald-900/50">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-bold text-white uppercase">Decisiom {i + 1}</span>
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-1.5 rounded",
                                                        o.decision === 'Approved' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                                    )}>{o.decision}</span>
                                                </div>
                                                <p className="text-[10px] text-emerald-200/70 italic">"{o.rationale}"</p>
                                            </div>
                                        ))}
                                        {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.riskAccepted.length ? (
                                            <div className="mt-2 text-[9px] text-slate-400">
                                                <span className="font-bold text-red-400">RISKS ACCEPTED:</span> {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.riskAccepted.join(', ')}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Meeting Minutes (If Concluded) */}
                            {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord && (
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded mb-6">
                                    <h3 className="text-[10px] font-black uppercase text-emerald-400 tracking-widest mb-3 flex items-center gap-2">
                                        <FileText size={12} /> Meeting Minutes
                                    </h3>
                                    <div className="space-y-3">
                                        {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.outcomes.map((o, i) => (
                                            <div key={i} className="p-2 bg-emerald-950/50 rounded border border-emerald-900/50">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-[9px] font-bold text-white uppercase">Decision {i + 1}</span>
                                                    <span className={cn(
                                                        "text-[9px] font-bold px-1.5 rounded",
                                                        o.decision === 'Approved' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                                    )}>{o.decision}</span>
                                                </div>
                                                <p className="text-[10px] text-emerald-200/70 italic">"{o.rationale}"</p>
                                            </div>
                                        ))}
                                        {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.riskAccepted.length ? (
                                            <div className="mt-2 text-[9px] text-slate-400">
                                                <span className="font-bold text-red-400">RISKS ACCEPTED:</span> {sessions.find(s => s.id === selectedEventId || (activeTor?.eventId && s.id === activeTor.eventId.replace('bre-', 'gs-')))?.meetingRecord?.riskAccepted.join(', ')}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )}

                            {/* Standard Agenda */}
                            <div>
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Standard Agenda</h3>
                                <div className="pl-4 border-l-2 border-slate-800 space-y-4">
                                    {(activeTor.agenda).map((item, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-[#020617]" />
                                            <span className="text-[11px] text-slate-400 block">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Decisions / Proposals on Agenda */}
                            {(activeTor.title.includes('Board') || selectedEventId.startsWith('gs-')) && (
                                <div className="p-4 bg-blue-900/10 border border-blue-500/30 rounded">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 flex items-center gap-2">
                                        <Gavel size={12} className="text-blue-500" /> Decisions on Agenda
                                    </h3>
                                    <div className="space-y-2">
                                        {/* Mock Data Loop - in real app would filter Proposals by targetSessionId */}
                                        <div className="p-3 bg-slate-900 rounded border border-slate-700 hover:border-blue-500 cursor-pointer transition-colors group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-[10px] font-bold text-white group-hover:text-blue-400 uppercase">Proposal: Nominate T-800</span>
                                                <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded">UNDER REVIEW</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mb-2">Neutralize C2 capability in Sector 4 (Battalion HQ).</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-1">
                                                    <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[8px] text-white">J3</div>
                                                    <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[8px] text-white">J2</div>
                                                </div>
                                                <span className="text-[9px] text-slate-500">2 Approvals Required</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Feedback Section */}
                            <div className="pt-6 border-t border-slate-800">
                                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3 flex items-center gap-2">
                                    <MessageSquare size={12} /> Feedback on TOR
                                </h3>

                                <div className="space-y-4 mb-4">
                                    {activeTor.feedback.map(f => (
                                        <div key={f.id} className="p-3 bg-slate-900 rounded border border-slate-800">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-bold text-blue-400">{f.userId}</span>
                                                <span className="text-[9px] text-slate-600">{f.date}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-300 italic">"{f.comment}"</p>
                                            {f.status === 'Addressed' && (
                                                <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
                                                    <Check size={10} /> Addressed
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Suggest a change to this TOR..."
                                        value={feedbackText}
                                        onChange={(e) => setFeedbackText(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    />
                                    <button className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors">
                                        <Send size={14} />
                                    </button>
                                </div>
                            </div>

                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                        <Info size={32} className="mb-4 opacity-50" />
                        <p className="text-xs uppercase font-bold">Select an Event to view its Terms of Reference (TOR)</p>
                    </div>
                )}

            </div>


            {/* View Minutes Modal */}
            {viewMinutesSession && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                    <FileText className="text-blue-500" size={20} /> Meeting Minutes
                                </h2>
                                <p className="text-sm text-slate-400 mt-1 font-medium">{viewMinutesSession.title} <span className="text-slate-600 mx-2">|</span> {new Date(viewMinutesSession.startTime).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setViewMinutesSession(null)}
                                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                            {viewMinutesSession.meetingRecord ? (
                                <>
                                    <section>
                                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Users size={12} /> Attendance
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Present */}
                                            <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                                <h4 className="text-[10px] font-bold text-emerald-500 uppercase mb-3 flex items-center gap-2">
                                                    <CheckCircle2 size={12} /> Present
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewMinutesSession.meetingRecord.rollCall.filter(a => a.status === 'Present').length > 0 ? (
                                                        viewMinutesSession.meetingRecord.rollCall.filter(a => a.status === 'Present').map(a => (
                                                            <span key={a.attendeeName} className="text-xs text-slate-300 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 shadow-sm">
                                                                {a.attendeeName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-600 italic">No recorded attendees</span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Absent */}
                                            <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                                <h4 className="text-[10px] font-bold text-red-500 uppercase mb-3 flex items-center gap-2">
                                                    <XCircle size={12} /> Absent
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {viewMinutesSession.meetingRecord.rollCall.filter(a => a.status === 'Absent').length > 0 ? (
                                                        viewMinutesSession.meetingRecord.rollCall.filter(a => a.status === 'Absent').map(a => (
                                                            <span key={a.attendeeName} className="text-xs text-slate-300 bg-slate-900 px-2 py-1.5 rounded border border-slate-800 shadow-sm">
                                                                {a.attendeeName}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-slate-600 italic">None</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Gavel size={12} /> Decisions & Outcomes
                                        </h3>
                                        <div className="space-y-3">
                                            {viewMinutesSession.meetingRecord.outcomes.length > 0 ? (
                                                viewMinutesSession.meetingRecord.outcomes.map(d => (
                                                    <div key={d.proposalId} className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex gap-4 hover:border-slate-700 transition-colors">
                                                        <div className={cn("p-2 rounded-lg h-fit shrink-0", d.decision === 'Approved' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                                            {d.decision === 'Approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-xs font-black uppercase text-slate-500 mb-1">{d.decision}</div>
                                                            <div className="text-sm font-bold text-white mb-1.5">{d.rationale}</div>
                                                            {d.provisos && (
                                                                <div className="text-xs text-amber-500 italic mt-1 bg-amber-500/10 p-2 rounded">
                                                                    Proviso: {d.provisos}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-slate-600 italic bg-slate-950/30 rounded-xl border border-slate-800 border-dashed">
                                                    No formal decisions recorded.
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <FileText size={12} /> Minutes & Notes
                                        </h3>
                                        <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed shadow-inner">
                                            {viewMinutesSession.meetingRecord.notes}
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="text-slate-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">No Minutes Found</h3>
                                    <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                                        This session was marked as concluded, but no formal meeting record is attached to the governance object.
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={() => setViewMinutesSession(null)}
                                className="px-6 py-2 bg-white text-slate-900 hover:bg-slate-200 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                Close Viewer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
