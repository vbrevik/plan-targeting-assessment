import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Clock,
    Plus,
    ArrowUpRight,
    Filter,
    FileQuestion,
    ListTodo,
    AlertTriangle,
    CalendarDays,
    FileText,
    Vote,
    User,
    Layers
} from 'lucide-react';
import { OntologyService, type Entity } from '@/lib/smartops/services/ontology.service';
import { cn } from '@/lib/utils';
import { useRoleContext } from '@/lib/smartops/hooks/useRoleContext';

// Helper to extract property from entity
const prop = (entity: Entity, key: string) => entity.properties?.[key];

export function InformationManagement() {
    const { currentRole } = useRoleContext();
    // Group entities by type
    const [entityGroups, setEntityGroups] = useState<Record<string, Entity[]>>({});
    const [knownTypes] = useState(['RFI', 'Task', 'Meeting', 'TOR', 'Decision', 'Person']);
    const [otherTypes, setOtherTypes] = useState<string[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hasPermission = (perm: string) => {
        if (!currentRole) return false;
        return currentRole.permissions.includes('*') || currentRole.permissions.includes(perm);
    };

    useEffect(() => {
        async function loadData() {
            try {
                // 1. Fetch Schema to know what types exist
                const schema = await OntologyService.getSchema();
                const allTypes = schema.entity_types.map(t => t.name);

                // 2. Identify types capable of being displayed (exclude some if needed, but for now fetch all)
                const typesToFetch = allTypes.length > 0 ? allTypes : knownTypes;

                // 3. Fetch all data in parallel
                const results = await Promise.all(
                    typesToFetch.map(type => OntologyService.getEntities({ type }).then(data => ({ type, data })))
                );

                // 4. Group data
                const groups: Record<string, Entity[]> = {};
                results.forEach(({ type, data }) => {
                    groups[type] = data;
                });

                setEntityGroups(groups);

                // 5. Identify "Other" types (dynamic ones not hardcoded)
                const others = allTypes.filter(t => !knownTypes.includes(t));
                setOtherTypes(others);

            } catch (err) {
                console.error('Failed to load IM data:', err);
                setError('Failed to load data from ontology');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Helper accessors for known types
    const rfis = entityGroups['RFI'] || [];
    const tasks = entityGroups['Task'] || [];
    const meetings = entityGroups['Meeting'] || [];
    const tors = entityGroups['TOR'] || [];
    const decisions = entityGroups['Decision'] || [];
    const persons = entityGroups['Person'] || [];

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Synchronizing Command Knowledge...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-black border border-purple-500/20 rounded uppercase">Knowledge Bridge</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Information Management (IM)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Ensuring information superiority by routing critical intelligence to the right functions at the right time. Monitoring J2-J4-LEGAD knowledge synchronization.
                        </p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase rounded transition-colors shadow-lg shadow-purple-900/20">
                        <Plus size={14} /> New Requirement
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">

                {/* Main Content Area - Grid Layout */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-px bg-slate-800">
                        {error && (
                            <div className="col-span-2 p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2 m-4">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}

                        {/* Section 1: RFIs - permission: rfis.view */}
                        {hasPermission('rfis.view') && (
                            <section className="bg-[#020617] p-6 space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <FileQuestion className="h-4 w-4 text-purple-500" /> Requests for Information (RFI)
                                    </h3>
                                    <div className="flex gap-2">
                                        <button className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-500 hover:text-white transition-colors">
                                            <Filter size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {rfis.length === 0 && (
                                        <div className="p-4 text-slate-500 text-sm italic">No RFIs found</div>
                                    )}
                                    {rfis.map((rfi) => (
                                        <div key={rfi.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all flex gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded flex flex-col items-center justify-center shrink-0 border",
                                                prop(rfi, 'direction') === 'outgoing' ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                            )}>
                                                <span className="text-[10px] font-black">{prop(rfi, 'direction') === 'outgoing' ? 'OUT' : 'IN'}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-tight">{prop(rfi, 'subject') || 'RFI'}</span>
                                                    <span className={cn(
                                                        "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                        prop(rfi, 'priority') === 'high' ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                                    )}>{prop(rfi, 'priority') || rfi.status}</span>
                                                </div>
                                                <p className="text-[12px] text-white font-bold leading-relaxed mb-3">{rfi.name}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
                                                        {prop(rfi, 'due_date') && (
                                                            <span className="flex items-center gap-1"><Clock size={10} /> DUE: {new Date(prop(rfi, 'due_date')).toLocaleString()}</span>
                                                        )}
                                                        <span className="flex items-center gap-1 uppercase"><CheckCircle2 size={10} className="text-emerald-500" /> {prop(rfi, 'status') || rfi.status}</span>
                                                    </div>
                                                    <button className="text-[9px] font-black text-purple-400 hover:text-purple-300 uppercase flex items-center gap-1">
                                                        View Details <ArrowUpRight size={10} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 2: Tasks - permission: rfis.view (shared) */}
                        {hasPermission('rfis.view') && (
                            <section className="bg-slate-950/30 p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <ListTodo className="h-4 w-4 text-purple-500" /> Active Tasks
                                </h3>
                                <div className="space-y-3">
                                    {tasks.length === 0 && (
                                        <div className="p-4 text-slate-500 text-sm italic">No tasks found</div>
                                    )}
                                    {tasks.map((task) => (
                                        <div key={task.id} className="relative pl-6 py-2">
                                            <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-800">
                                                <div className={cn(
                                                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                                                    prop(task, 'status') === 'in_progress' ? "bg-amber-500 animate-pulse" : "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"
                                                )} />
                                            </div>
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{task.name}</span>
                                                <span className={cn(
                                                    "text-[8px] font-mono px-1 rounded",
                                                    prop(task, 'priority') === 'high' ? "bg-red-500/20 text-red-400" : "bg-slate-800 text-slate-500"
                                                )}>{prop(task, 'priority') || 'normal'}</span>
                                            </div>
                                            <div className="p-2 bg-slate-900/50 rounded border border-slate-800/50 text-[9px] font-bold">
                                                <span className="text-slate-400 uppercase">{task.description || prop(task, 'description')}</span>
                                            </div>
                                            {prop(task, 'due_date') && (
                                                <div className="mt-1 text-[8px] font-mono text-slate-600 flex items-center gap-1">
                                                    <Clock size={10} /> Due: {new Date(prop(task, 'due_date')).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 3: Meetings - permission: battle_rhythm.view */}
                        {hasPermission('battle_rhythm.view') && (
                            <section className="bg-[#020617] p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-purple-500" /> Scheduled Meetings
                                </h3>
                                <div className="space-y-3">
                                    {meetings.length === 0 && (
                                        <div className="p-4 text-slate-500 text-sm italic">No meetings scheduled</div>
                                    )}
                                    {meetings.map((meeting) => (
                                        <div key={meeting.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[12px] font-black text-white">{meeting.name}</span>
                                                <span className={cn(
                                                    "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                    prop(meeting, 'status') === 'scheduled' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>{prop(meeting, 'status') || meeting.status}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mb-2">{meeting.description}</p>
                                            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
                                                {prop(meeting, 'start_time') && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} /> {new Date(prop(meeting, 'start_time')).toLocaleString()}
                                                    </span>
                                                )}
                                                {prop(meeting, 'location') && (
                                                    <span className="text-slate-600 uppercase">{prop(meeting, 'location')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 4: Terms of Reference (TOR) - permission: ontology.view */}
                        {hasPermission('ontology.view') && (
                            <section className="bg-slate-950/30 p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-purple-500" /> Terms of Reference
                                </h3>
                                <div className="space-y-3">
                                    {tors.length === 0 && (
                                        <div className="p-4 text-slate-500 text-sm italic">No TORs found</div>
                                    )}
                                    {tors.map((tor) => (
                                        <div key={tor.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[12px] font-black text-white">{tor.name}</span>
                                                <span className={cn(
                                                    "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                    tor.status === 'Active' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>{tor.status}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mb-2">{tor.description}</p>
                                            {prop(tor, 'cadence') && (
                                                <div className="text-[8px] font-mono text-slate-600 uppercase">
                                                    Cadence: {prop(tor, 'cadence')} | Authority: {prop(tor, 'authority_level')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 5: Decisions - permission: ontology.view (since decisions are ontology entities) */}
                        {hasPermission('ontology.view') && (
                            <section className="bg-[#020617] p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <Vote className="h-4 w-4 text-purple-500" /> Recent Decisions
                                </h3>
                                <div className="space-y-3">
                                    {decisions.length === 0 && (
                                        <div className="p-4 text-slate-500 text-sm italic">No decisions recorded</div>
                                    )}
                                    {decisions.map((decision) => (
                                        <div key={decision.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[12px] font-black text-white">{decision.name}</span>
                                                <span className={cn(
                                                    "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                                    decision.status === 'Decided' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                                        decision.status === 'Pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            "bg-slate-800 text-slate-400 border-slate-700"
                                                )}>{decision.status}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mb-2">{decision.description}</p>
                                            {prop(decision, 'outcome') && (
                                                <div className="text-[8px] font-mono text-emerald-400 uppercase">
                                                    Outcome: {prop(decision, 'outcome')}
                                                </div>
                                            )}
                                            {prop(decision, 'rationale') && (
                                                <div className="text-[8px] font-mono text-slate-600 mt-1">
                                                    {prop(decision, 'rationale')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 6: Team Members - permission: cop.view */}
                        {hasPermission('cop.view') && (
                            <section className="bg-slate-950/30 p-6 space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-500" /> Team Roster
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {persons.length === 0 && (
                                        <div className="col-span-2 p-4 text-slate-500 text-sm italic">No personnel found</div>
                                    )}
                                    {persons.map((person) => (
                                        <div key={person.id} className="p-3 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                    <User size={14} className="text-purple-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-[10px] font-black text-white">{person.name}</div>
                                                    <div className="text-[8px] text-slate-500 uppercase">{prop(person, 'role')}</div>
                                                </div>
                                            </div>
                                            {prop(person, 'contact') && (
                                                <div className="text-[8px] font-mono text-slate-600 mt-2">
                                                    {prop(person, 'contact')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section 7+: Dynamic Types - permission: ontology.view (default fallback) */}
                        {hasPermission('ontology.view') && otherTypes.map(type => {
                            const entities = entityGroups[type] || [];
                            // Show generic section even if empty, or hide? Let's hide if empty to keep dashboard clean
                            if (entities.length === 0) return null;

                            return (
                                <section key={type} className="bg-slate-950/30 p-6 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-purple-500" /> {type}s
                                    </h3>
                                    <div className="space-y-3">
                                        {entities.map(entity => (
                                            <div key={entity.id} className="p-4 rounded border bg-slate-900/30 border-slate-800 hover:border-purple-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-[12px] font-black text-white">{entity.name}</span>
                                                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded uppercase border bg-slate-800 text-slate-400 border-slate-700">
                                                        {entity.status || 'Active'}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] text-slate-400 mb-2">{entity.description}</p>
                                                <div className="text-[9px] font-mono text-slate-600 break-all">
                                                    ID: {entity.id}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                    </div>
                </div>

            </div>

            {/* Footer */}
            <div className="h-10 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-6">
                    <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> IM BROKER SYNCHRONIZED
                    </span>
                    <span>LATENCY: 12ms</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-slate-600 uppercase font-bold">
                        {rfis.length} RFIs | {tasks.length} Tasks | {meetings.length} Meetings | {decisions.length} Decisions | {tors.length} TORs | {persons.length} Personnel
                    </span>
                </div>
            </div>
        </div>
    );
}
