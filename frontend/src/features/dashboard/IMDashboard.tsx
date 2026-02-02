import { useState, useEffect, useMemo } from 'react';
import {
    format,
    startOfWeek,
    addDays,
    startOfMonth,
    eachDayOfInterval,
    isSameDay,
    parseISO,
    startOfDay,
    differenceInMinutes,
    isSameMonth
} from 'date-fns';
import {
    Clock,
    Activity,
    Lock,
    Users,
    CheckCircle2,
    Inbox,
    RefreshCcw,
    Send,
    ShieldCheck,
    Calendar,
    ExternalLink,
    ScrollText
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { OntologyService } from '@/lib/mshnctrl/services/ontology.service';
import type { Entity, EntityWithRelationships } from '@/lib/mshnctrl/services/ontology.service';

interface WorkflowItem {
    id: string;
    type: 'EVENT' | 'TOR' | 'SESSION' | 'DECISION' | 'CONFIRMATION';
    title: string;
    subtitle: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
    timestamp: string;
    owner?: string;
    originalData: any;
}

export function IMDashboard() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
    const [selectedEntityWithRels, setSelectedEntityWithRels] = useState<EntityWithRelationships | null>(null);
    const [neighbors, setNeighbors] = useState<Entity[]>([]);
    const [loadingRels, setLoadingRels] = useState(false);
    const [zuluTime, setZuluTime] = useState(new Date().toISOString().split('T')[1].split('.')[0] + ' Z');
    const [rightPaneView, setRightPaneView] = useState<'agenda' | 'detail'>('agenda');
    const [agendaTimeframe, setAgendaTimeframe] = useState<'today' | 'week' | 'month'>('week');

    async function loadData() {
        setLoading(true);
        try {
            const types = ['Event', 'Meeting', 'TOR', 'RFI', 'Decision', 'Task'];
            const results = await Promise.all(
                types.map(t => OntologyService.getEntities({ type: t }))
            );
            setEntities(results.flat());
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
        const interval = setInterval(() => {
            setZuluTime(new Date().toISOString().split('T')[1].split('.')[0] + ' Z');
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const workflowData = useMemo(() => {
        const mappedItems: WorkflowItem[] = entities.map(e => {
            const props = e.properties || {};
            const priority = (props.priority || 'Medium').toString();
            const normalizedPriority =
                priority.toLowerCase() === 'critical' ? 'Critical' :
                    priority.toLowerCase() === 'high' ? 'High' :
                        priority.toLowerCase() === 'low' ? 'Low' : 'Medium';

            return {
                id: e.id,
                type: (e.type === 'Meeting' || e.type === 'Event') ? 'SESSION' :
                    e.type === 'TOR' ? 'TOR' :
                        e.type === 'Decision' ? 'DECISION' :
                            e.type === 'RFI' ? 'EVENT' : 'EVENT',
                title: e.name,
                subtitle: props.subject || props.type || e.type,
                priority: normalizedPriority as any,
                status: e.status || 'NEW',
                timestamp: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Z',
                owner: props.originator_id || props.chair_role,
                originalData: e
            };
        });

        const incoming = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'new' || status === 'pending' || status === 'unacknowledged' || (item.originalData.type === 'RFI' && item.originalData.properties?.direction === 'incoming');
        });

        const processing = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'in_progress' || status === 'drafting' || status === 'scheduled' || item.originalData.type === 'TOR';
        });

        const outgoing = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'concluded' || status === 'approved' || status === 'ready' || status === 'decided';
        });

        return { incoming, processing, outgoing };
    }, [entities]);

    // Set initial selection logic - removed automatic selection to show agenda
    useEffect(() => {
        if (selectedItem) {
            setRightPaneView('detail');
        }
    }, [selectedItem]);

    // Fetch details and relationships for selected item
    useEffect(() => {
        if (!selectedItem) {
            setSelectedEntityWithRels(null);
            setNeighbors([]);
            return;
        }

        const itemId = selectedItem.id;
        setSelectedEntityWithRels(null);
        setNeighbors([]);
        async function fetchRels() {
            setLoadingRels(true);
            try {
                const [data, neighborData] = await Promise.all([
                    OntologyService.getEntityWithRelationships(itemId),
                    OntologyService.getNeighbors(itemId)
                ]);
                setSelectedEntityWithRels(data);
                setNeighbors(neighborData);
            } catch (e) {
                console.error("Failed to fetch relationships", e);
            } finally {
                setLoadingRels(false);
            }
        }
        fetchRels();
    }, [selectedItem]);

    const handleSelectById = (id: string) => {
        const entity = entities.find(e => e.id === id);
        if (entity) {
            // Map entity back to WorkflowItem style for selection
            const props = entity.properties || {};
            const priority = (props.priority || 'Medium').toString();
            const normalizedPriority =
                priority.toLowerCase() === 'critical' ? 'Critical' :
                    priority.toLowerCase() === 'high' ? 'High' :
                        priority.toLowerCase() === 'low' ? 'Low' : 'Medium';

            setSelectedItem({
                id: entity.id,
                type: (entity.type === 'Meeting' || entity.type === 'Event') ? 'SESSION' :
                    entity.type === 'TOR' ? 'TOR' :
                        entity.type === 'Decision' ? 'DECISION' :
                            entity.type === 'RFI' ? 'EVENT' : 'EVENT',
                title: entity.name,
                subtitle: props.subject || props.type || entity.type,
                priority: normalizedPriority as any,
                status: entity.status || 'NEW',
                timestamp: new Date(entity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Z',
                owner: props.originator_id || props.chair_role,
                originalData: entity
            });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <span className="font-mono text-[10px] text-blue-500 uppercase tracking-widest animate-pulse">Synchronizing IM Cockpit...</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center ring-4 ring-blue-500/10">
                        <Activity className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">IM Operational Hub</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Information Lifecycle Management</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Zulu Time</span>
                        <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{zuluTime}</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <Button
                        onClick={loadData}
                        variant="outline"
                        className={cn("h-10 border-slate-200 dark:border-slate-800 border-2 font-black uppercase text-[10px]", loading && "animate-pulse")}
                    >
                        <RefreshCcw size={12} className={cn("mr-2", loading && "animate-spin")} />
                        {loading ? 'Syncing...' : 'Sync All'}
                    </Button>
                </div>
            </header>

            {/* Main Content Split */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Side: 3 Horizontal Panes (Workflow) */}
                <section className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/10 overflow-hidden">
                    <WorkflowPane
                        title="Incoming"
                        icon={<Inbox size={14} className="text-amber-500" />}
                        items={workflowData.incoming}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3 border-b"
                    />
                    <WorkflowPane
                        title="Processing"
                        icon={<RefreshCcw size={14} className="text-blue-500" />}
                        items={workflowData.processing}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3 border-b"
                    />
                    <WorkflowPane
                        title="Outgoing"
                        icon={<Send size={14} className="text-emerald-500" />}
                        items={workflowData.outgoing}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3"
                    />
                </section>

                {/* Right Side: Detail Pane or Agenda */}
                <section className="w-1/2 bg-white dark:bg-slate-950 overflow-y-auto flex flex-col">
                    {/* Top Control Bar for Right Pane */}
                    <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/20 shrink-0">
                        <div className="flex gap-2">
                            {(['today', 'week', 'month'] as const).map(tf => (
                                <Button
                                    key={tf}
                                    variant={agendaTimeframe === tf ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => {
                                        setAgendaTimeframe(tf);
                                        setRightPaneView('agenda');
                                    }}
                                    className={cn(
                                        "text-[9px] uppercase font-black h-7 px-3 tracking-widest",
                                        agendaTimeframe === tf ? "bg-blue-600 shadow-lg shadow-blue-500/20" : "text-slate-500"
                                    )}
                                >
                                    {tf}
                                </Button>
                            ))}
                        </div>
                        {selectedItem && rightPaneView === 'detail' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRightPaneView('agenda')}
                                className="text-[9px] uppercase font-black h-7 px-3 tracking-widest border-slate-200 dark:border-slate-800"
                            >
                                <Calendar size={12} className="mr-2" />
                                Return to Agenda
                            </Button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {rightPaneView === 'detail' && selectedItem ? (
                            <DetailView
                                item={selectedItem}
                                entityWithRels={selectedEntityWithRels}
                                neighbors={neighbors}
                                loadingRels={loadingRels}
                                onSelectLink={handleSelectById}
                                onRefresh={loadData}
                            />
                        ) : (
                            <AgendaView
                                entities={entities}
                                timeframe={agendaTimeframe}
                                onSelectItem={handleSelectById}
                            />
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

function WorkflowPane({ title, icon, items, selectedId, onSelect, className }: {
    title: string,
    icon: React.ReactNode,
    items: WorkflowItem[],
    selectedId?: string,
    onSelect: (item: WorkflowItem) => void,
    className?: string
}) {
    return (
        <div className={cn("flex flex-col overflow-hidden dark:border-slate-800", className)}>
            <div className="flex items-center justify-between px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">{title}</span>
                </div>
                <Badge variant="secondary" className="text-[8px] font-mono h-4 px-1.5">{items.length}</Badge>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                {items.length > 0 ? items.map((item: any) => (
                    <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={cn(
                            "group p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                            selectedId === item.id
                                ? "bg-white dark:bg-slate-800 border-blue-500 shadow-md ring-1 ring-blue-500/20"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.type}</span>
                            <Badge className={cn(
                                "text-[7px] h-3.5 border-none px-1 rounded-sm",
                                item.priority === 'Critical' ? "bg-red-500/10 text-red-500" :
                                    item.priority === 'High' ? "bg-amber-500/10 text-amber-500" :
                                        "bg-blue-500/10 text-blue-500"
                            )}>
                                {item.priority}
                            </Badge>
                        </div>
                        <h4 className={cn(
                            "text-[11px] font-black uppercase leading-tight tracking-tight",
                            selectedId === item.id ? "text-blue-500" : "text-slate-900 dark:text-white"
                        )}>
                            {item.title}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[9px] text-slate-500 font-medium">{item.subtitle}</span>
                            <span className="text-[8px] font-mono text-slate-400">{item.timestamp}</span>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <span className="text-[9px] font-mono uppercase">No Pending Items</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailView({ item, entityWithRels, neighbors, loadingRels, onSelectLink, onRefresh }: {
    item: WorkflowItem,
    entityWithRels: EntityWithRelationships | null,
    neighbors: Entity[],
    loadingRels: boolean,
    onSelectLink: (id: string) => void,
    onRefresh: () => void
}) {
    const displayEntity = entityWithRels && entityWithRels.id === item.id ? entityWithRels : item.originalData;

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Detail Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-[9px] font-mono px-2 py-0.5 rounded-full">
                        {item.type} :: {item.id}
                    </Badge>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-[0.9]">
                    {item.title}
                </h2>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Clock size={16} />
                        <span className="font-mono">{item.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <Users size={16} />
                        <span className="font-medium">{item.subtitle}</span>
                    </div>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-none shadow-none bg-slate-100 dark:bg-slate-900/50">
                    <CardHeader className="p-4 pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Phase</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <div className="flex items-center gap-2 text-blue-500 font-black uppercase text-sm">
                            <CheckCircle2 size={16} /> {item.status}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-none bg-slate-100 dark:bg-slate-900/50">
                    <CardHeader className="p-4 pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Escalation Policy</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                            <Lock size={16} /> {displayEntity.properties?.escalation_policy || 'STANDARD_IM_MANDATE'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metadata / Content */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Item Context</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {displayEntity.description || `This ${item.type.toLowerCase()} is part of the ongoing mission control information flow. 
                        It requires systematic review and alignment with the current mandate (TOR). 
                        Verification of information integrity is required before transition to the next workflow stage.`}
                    </p>
                </div>

                <div className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="text-blue-500" size={20} />
                        <span className="text-[11px] font-black uppercase tracking-tight">Security & Governance Assessment</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase font-bold">Mandate Alignment</span>
                            <span className="text-emerald-500 font-mono">
                                {displayEntity.properties?.mandate_status || 'VERIFIED [NATO-COPD]'}
                            </span>
                        </div>
                        {displayEntity.properties && Object.entries(displayEntity.properties).map(([key, value]) => {
                            if (['mandate_status', 'escalation_policy', 'release_authority', 'objectives', 'participants', 'agenda', 'expected_attendees'].includes(key)) return null;
                            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                                return (
                                    <div key={key} className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 uppercase font-bold">{key.replace(/_/g, ' ')}</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-mono">{value.toString()}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase font-bold">Release Authority</span>
                            <span className="text-slate-700 dark:text-slate-300 font-mono">
                                {displayEntity.properties?.release_authority || 'CHIEFIM-OPERATIONAL'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Type-Specific Blocks */}
                {displayEntity.type === 'TOR' && displayEntity.properties?.objectives && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Charter Objectives</h3>
                        <div className="space-y-2">
                            {(displayEntity.properties.objectives as string[]).map((obj, i) => (
                                <div key={i} className="flex gap-3 text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-tight">
                                    <span className="text-blue-500 font-mono">[{i + 1}]</span>
                                    <span>{obj}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {displayEntity.type === 'RFI' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 block mb-1">Response Deadline</span>
                            <span className="text-xs font-mono font-bold text-amber-700">{displayEntity.properties?.due_date || 'TBD'}</span>
                        </div>
                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                            <span className="text-[8px] font-black uppercase tracking-widest text-blue-600 block mb-1">Inbound Channel</span>
                            <span className="text-xs font-mono font-bold text-blue-700">{displayEntity.properties?.direction || 'N/A'}</span>
                        </div>
                    </div>
                )}

                {(displayEntity.type?.toLowerCase() === 'meeting' || displayEntity.type === 'SESSION') && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Meeting Dynamics</h3>
                            <Badge variant="secondary" className="text-[8px] font-mono h-4">{displayEntity.properties?.meeting_type || 'STANDARD'}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {/* TOR Link if exists */}
                            {(() => {
                                const torRel = entityWithRels ? [...entityWithRels.outgoing_relationships, ...entityWithRels.incoming_relationships].find(r => r.relation_type === 'DRIVEN_BY' || r.relation_type === 'GOVERNED_BY') : null;
                                const torId = torRel ? (torRel.target_id === item.id ? torRel.source_id : torRel.target_id) : null;
                                const torNeighbor = torId ? neighbors.find(n => n.id === torId && n.type === 'TOR') : null;

                                if (torNeighbor) {
                                    return (
                                        <div className="p-4 bg-purple-500/10 border-2 border-purple-500/20 rounded-xl flex justify-between items-center group cursor-pointer hover:bg-purple-500/20 transition-all"
                                            onClick={() => onSelectLink(torNeighbor.id)}>
                                            <div className="flex items-center gap-3">
                                                <ScrollText className="text-purple-500" size={18} />
                                                <div>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 block mb-0.5">Mandate / TOR</span>
                                                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white">{torNeighbor.name}</span>
                                                </div>
                                            </div>
                                            <ExternalLink size={14} className="text-purple-400 group-hover:text-purple-600" />
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            {displayEntity.properties?.agenda && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-2">Agenda</span>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{displayEntity.properties.agenda}</p>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className="flex-1 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 block mb-1">Roll Call</span>
                                    <span className="text-[10px] font-bold text-blue-700">{displayEntity.properties?.expected_attendees || 'TBD'}</span>
                                </div>
                                <div className="flex-1 p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 block mb-1">Chair</span>
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase">{displayEntity.properties?.chair_role || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Relationship Context */}
                {entityWithRels && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Graph Context</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[...entityWithRels.outgoing_relationships, ...entityWithRels.incoming_relationships].map((rel, idx) => {
                                const targetId = rel.target_id === item.id ? rel.source_id : rel.target_id;
                                const neighbor = neighbors.find(n => n.id === targetId);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => onSelectLink(targetId)}
                                        className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">
                                                {rel.relation_type}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600">
                                                {neighbor ? neighbor.name : targetId}
                                            </span>
                                            {neighbor && (
                                                <span className="text-[8px] text-slate-400 uppercase font-mono">{neighbor.type}</span>
                                            )}
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-mono opacity-50 group-hover:opacity-100 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                            NAVIGATE
                                        </Badge>
                                    </div>
                                );
                            })}
                            {entityWithRels.outgoing_relationships.length === 0 && entityWithRels.incoming_relationships.length === 0 && (
                                <div className="text-[10px] text-slate-500 italic py-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center">
                                    No active graph relationships
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {loadingRels && (
                    <div className="flex items-center gap-2 py-4">
                        <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">Loading Graph...</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <Button
                    onClick={async () => {
                        const nextStatus =
                            item.status === 'NEW' ? 'IN_PROGRESS' :
                                item.status === 'IN_PROGRESS' ? 'CONCLUDED' :
                                    item.status === 'PENDING' ? 'APPROVED' : 'COMPLETED';

                        try {
                            await OntologyService.updateEntity(item.id, { status: nextStatus });
                            onRefresh();
                        } catch (e) {
                            console.error("Transition failed", e);
                        }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest h-12 shadow-xl shadow-blue-500/20"
                >
                    Transition to Next Phase
                </Button>
                <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-800 border-2 font-black uppercase tracking-widest h-12">
                    Open in Full View
                </Button>
            </div>
        </div>
    );
}

function AgendaView({ entities, timeframe, onSelectItem }: {
    entities: Entity[],
    timeframe: 'today' | 'week' | 'month',
    onSelectItem: (id: string) => void
}) {
    const now = new Date();

    const getEventDate = (entity: Entity) => {
        const props = entity.properties || {};
        const dateStr = props.scheduled_at || props.start_time || props.start_at || entity.created_at;
        return parseISO(dateStr);
    };

    const filteredEntities = useMemo(() => {
        return entities.filter(e => {
            if (!['Meeting', 'Event', 'Task', 'RFI'].includes(e.type)) return false;

            const date = getEventDate(e);
            const diffMs = date.getTime() - now.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            if (timeframe === 'today') return diffDays >= -1 && diffDays <= 1;
            if (timeframe === 'week') return diffDays >= -1 && diffDays <= 7;
            if (timeframe === 'month') return diffDays >= -1 && diffDays <= 31;
            return true;
        }).sort((a, b) => getEventDate(a).getTime() - getEventDate(b).getTime());
    }, [entities, timeframe]);

    // Cleanup: groupedEntities removed as it's not used in current calendar views

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
            <div className="p-6 pb-2 shrink-0">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-none mb-1">
                    Operational Agenda
                </h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed">
                    Synchronized Battle Rhythm for {timeframe}
                </p>
            </div>

            <div className="flex-1 overflow-hidden">
                {timeframe === 'month' && (
                    <MonthView
                        entities={filteredEntities}
                        onSelectItem={onSelectItem}
                    />
                )}
                {timeframe === 'week' && (
                    <WeekView
                        entities={filteredEntities}
                        onSelectItem={onSelectItem}
                    />
                )}
                {timeframe === 'today' && (
                    <DayView
                        entities={filteredEntities}
                        onSelectItem={onSelectItem}
                    />
                )}
            </div>
        </div>
    );
}

function DayView({ entities, onSelectItem }: { entities: Entity[], onSelectItem: (id: string) => void }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="h-full overflow-y-auto scrollbar-thin p-6 pt-2 bg-slate-50/30 dark:bg-slate-900/10">
            <div className="relative min-h-[1440px] border-l border-slate-100 dark:border-slate-800 ml-12 bg-white dark:bg-slate-950 rounded-r-2xl shadow-sm">
                {hours.map(hour => (
                    <div key={hour} className="absolute w-full border-t border-slate-100 dark:border-slate-800" style={{ top: `${hour * 60}px`, height: '60px' }}>
                        <span className="absolute -left-12 top-0 -translate-y-1/2 text-[10px] font-black font-mono text-slate-400">
                            {hour.toString().padStart(2, '0')}:00
                        </span>
                    </div>
                ))}
                {entities.map(entity => {
                    const date = parseISO(entity.properties?.scheduled_at || entity.properties?.start_time || entity.created_at);
                    const minutesSinceStart = differenceInMinutes(date, startOfDay(date));
                    return (
                        <div
                            key={entity.id}
                            className="absolute left-2 right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:border-blue-500/50 hover:shadow-xl transition-all z-10 group"
                            style={{ top: `${minutesSinceStart}px`, height: '80px' }}
                            onClick={() => onSelectItem(entity.id)}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest h-4 px-1.5 rounded-sm border-blue-500/30 text-blue-600 dark:text-blue-400">
                                            {entity.type}
                                        </Badge>
                                        <span className="text-[10px] font-bold font-mono text-slate-400">
                                            {format(date, 'HH:mm')} Z
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors truncate">
                                        {entity.name}
                                    </h4>
                                </div>
                                {entity.type === 'Meeting' && (
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-50" asChild onClick={(e) => e.stopPropagation()}>
                                        <a href={`/mshnctrl/conduct/${entity.id}`}>
                                            <ExternalLink size={14} />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function WeekView({ entities, onSelectItem }: { entities: Entity[], onSelectItem: (id: string) => void }) {
    const days = eachDayOfInterval({
        start: startOfWeek(new Date(), { weekStartsOn: 1 }),
        end: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6)
    });
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="h-full overflow-hidden flex flex-col">
            <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 border-r border-slate-100 dark:border-slate-800" />
                {days.map(day => (
                    <div key={day.toISOString()} className="h-10 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 last:border-0 relative">
                        <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest leading-none mb-0.5">{format(day, 'EEE')}</span>
                        <span className={cn(
                            "text-xs font-black leading-none",
                            isSameDay(day, new Date()) ? "text-blue-600" : "text-slate-900 dark:text-slate-100"
                        )}>{format(day, 'dd')}</span>
                        {isSameDay(day, new Date()) && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </div>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="grid grid-cols-[60px_repeat(7,1fr)] relative min-h-[1440px] bg-white dark:bg-slate-950">
                    {hours.map(hour => (
                        <div key={hour} className="contents">
                            <div className="h-[60px] border-r border-b border-slate-100 dark:border-slate-800 flex items-center justify-center bg-slate-50/30 dark:bg-slate-900/10">
                                <span className="text-[10px] font-bold font-mono text-slate-400">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                            {days.map((day) => (
                                <div key={day.toISOString()} className="h-[60px] border-r border-b border-slate-100 dark:border-slate-800 last:border-r-0 relative">
                                    {entities.filter(e => {
                                        const date = parseISO(e.properties?.scheduled_at || e.properties?.start_time || e.created_at);
                                        return isSameDay(date, day) && date.getHours() === hour;
                                    }).map(entity => (
                                        <div
                                            key={entity.id}
                                            onClick={() => onSelectItem(entity.id)}
                                            className="absolute inset-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 cursor-pointer hover:border-blue-500/50 hover:shadow-lg transition-all z-10 group overflow-hidden"
                                        >
                                            <div className="flex flex-col h-full">
                                                <div className="text-[7px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-0.5 truncate leading-none">{entity.type}</div>
                                                <div className="text-[9px] font-black uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 leading-tight line-clamp-2 flex-1">
                                                    {entity.name}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MonthView({ entities, onSelectItem }: { entities: Entity[], onSelectItem: (id: string) => void }) {
    const monthStart = startOfMonth(new Date());
    const days = eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: addDays(startOfWeek(monthStart, { weekStartsOn: 1 }), 41) // Show 6 weeks
    });

    return (
        <div className="h-full overflow-hidden grid grid-cols-7 grid-rows-[30px_repeat(6,1fr)] bg-slate-50 dark:bg-slate-900/10">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="flex items-center justify-center font-black uppercase text-[9px] text-slate-400 tracking-[0.2em] border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 bg-slate-50 dark:bg-slate-900/50">
                    {day}
                </div>
            ))}
            {days.map((day) => {
                const dayEntities = entities.filter(e => {
                    const date = parseISO(e.properties?.scheduled_at || e.properties?.start_time || e.created_at);
                    return isSameDay(date, day);
                });
                return (
                    <div
                        key={day.toISOString()}
                        className={cn(
                            "p-2 border-b border-r border-slate-100 dark:border-slate-800 last:border-r-0 min-h-[80px] flex flex-col gap-1 transition-colors bg-white dark:bg-slate-950",
                            !isSameMonth(day, monthStart) && "bg-slate-100/30 dark:bg-slate-900/30",
                            isSameDay(day, new Date()) && "ring-2 ring-inset ring-blue-600/20 bg-blue-50/20 dark:bg-blue-900/5"
                        )}
                    >
                        <span className={cn(
                            "text-[9px] font-black self-end px-1.5 py-0.5 rounded-full transition-all",
                            isSameDay(day, new Date()) ? "text-white bg-blue-600 shadow-sm" : "text-slate-400"
                        )}>
                            {format(day, 'd')}
                        </span>
                        <div className="flex flex-col gap-1 overflow-y-auto scrollbar-none flex-1">
                            {dayEntities.map(entity => (
                                <div
                                    key={entity.id}
                                    onClick={() => onSelectItem(entity.id)}
                                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-1.5 py-1 rounded-sm cursor-pointer hover:border-blue-500/50 hover:shadow-sm transition-all group"
                                >
                                    <div className="text-[7px] font-black uppercase tracking-tighter text-slate-950 dark:text-white group-hover:text-blue-600 truncate leading-none mb-0.5">
                                        {entity.name}
                                    </div>
                                    <div className="text-[6px] font-black font-mono text-slate-400 uppercase leading-none">
                                        {format(parseISO(entity.properties?.scheduled_at || entity.properties?.start_time || entity.created_at), 'HH:mm')} Z
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
