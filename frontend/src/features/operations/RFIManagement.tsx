import { useState, useEffect, useMemo } from 'react';
import {
    Inbox,
    Send,
    Clock,
    User,
    CheckCircle2,
    MessageSquare,
    ArrowUpRight,
    ArrowDownLeft,
    ShieldCheck,
    RefreshCcw,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { OntologyService } from '@/lib/mshnctrl/services/ontology.service';
import type { Entity, EntityWithRelationships } from '@/lib/mshnctrl/services/ontology.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface RFIWorkflowItem {
    id: string;
    title: string;
    subtitle: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
    timestamp: string;
    direction: 'Inbound' | 'Outbound';
    originalData: Entity;
}

export function RFIManagement() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<RFIWorkflowItem | null>(null);
    const [selectedEntityWithRels, setSelectedEntityWithRels] = useState<EntityWithRelationships | null>(null);
    const [neighbors, setNeighbors] = useState<Entity[]>([]);
    const [loadingRels, setLoadingRels] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [zuluTime, setZuluTime] = useState(new Date().toISOString().split('T')[1].split('.')[0] + ' Z');

    async function loadData() {
        setLoading(true);
        try {
            const results = await OntologyService.getEntities({ type: 'RFI' });
            setEntities(results);
        } catch (error) {
            console.error("Failed to load RFI data:", error);
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
        const mappedItems: RFIWorkflowItem[] = entities.map(e => {
            const props = e.properties || {};
            const priority = (props.priority || 'Medium').toString();
            const normalizedPriority =
                priority.toLowerCase() === 'critical' ? 'Critical' :
                    priority.toLowerCase() === 'high' ? 'High' :
                        priority.toLowerCase() === 'low' ? 'Low' : 'Medium';

            return {
                id: e.id,
                title: e.name,
                subtitle: props.subject || e.name,
                priority: normalizedPriority as any,
                status: e.status || 'NEW',
                timestamp: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Z',
                direction: (props.direction || 'Inbound') as any,
                originalData: e
            };
        });

        const incoming = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'new' || status === 'open' || status === 'unacknowledged';
        });

        const processing = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'pending' || status === 'in_progress' || status === 'drafting' || status === 'researching';
        });

        const outgoing = mappedItems.filter(item => {
            const status = item.status.toLowerCase();
            return status === 'closed' || status === 'resolved' || status === 'concluded' || status === 'approved';
        });

        return { incoming, processing, outgoing };
    }, [entities]);

    useEffect(() => {
        if (!selectedItem) {
            setSelectedEntityWithRels(null);
            setNeighbors([]);
            return;
        }

        const itemId = selectedItem.id;
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
            const props = entity.properties || {};
            const priority = (props.priority || 'Medium').toString();
            const normalizedPriority =
                priority.toLowerCase() === 'critical' ? 'Critical' :
                    priority.toLowerCase() === 'high' ? 'High' :
                        priority.toLowerCase() === 'low' ? 'Low' : 'Medium';

            setSelectedItem({
                id: entity.id,
                title: entity.name,
                subtitle: props.subject || entity.name,
                priority: normalizedPriority as any,
                status: entity.status || 'NEW',
                timestamp: new Date(entity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Z',
                direction: (props.direction || 'Inbound') as any,
                originalData: entity
            });
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <span className="font-mono text-[10px] text-blue-500 uppercase tracking-widest animate-pulse">Syncing Intelligence Pipeline...</span>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center ring-4 ring-blue-500/10">
                        <Inbox className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white leading-none">RFI Command Center</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Requirement & Resource Management</p>
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
                        Re-Scan
                    </Button>
                </div>
            </header>

            {/* Main Content Split - Matches IM Dashboard aesthetic */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Side: 3 Horizontal Panes (Workflow) */}
                <section className="w-1/2 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-900/10 overflow-hidden">
                    <WorkflowPane
                        title="Incoming Requirements"
                        icon={<ArrowDownLeft size={14} className="text-amber-500" />}
                        items={workflowData.incoming}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3 border-b"
                    />
                    <WorkflowPane
                        title="Active Research"
                        icon={<RefreshCcw size={14} className="text-blue-500" />}
                        items={workflowData.processing}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3 border-b"
                    />
                    <WorkflowPane
                        title="Disseminated / Closed"
                        icon={<CheckCircle2 size={14} className="text-emerald-500" />}
                        items={workflowData.outgoing}
                        selectedId={selectedItem?.id}
                        onSelect={setSelectedItem}
                        className="h-1/3"
                    />
                </section>

                {/* Right Side: Detail Pane */}
                <section className="w-1/2 bg-white dark:bg-slate-950 overflow-y-auto flex flex-col">
                    {selectedItem ? (
                        <RFIDetailView
                            item={selectedItem}
                            entityWithRels={selectedEntityWithRels}
                            neighbors={neighbors}
                            loadingRels={loadingRels}
                            onSelectLink={handleSelectById}
                            onRefresh={loadData}
                            responseText={responseText}
                            setResponseText={setResponseText}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-6">
                                <Inbox size={40} className="text-slate-300 dark:text-slate-700" />
                            </div>
                            <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Select Requirement</h3>
                            <p className="text-xs font-bold uppercase text-slate-400 mt-2 max-w-xs">Audit all incoming and outgoing intelligence requests for information</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function WorkflowPane({ title, icon, items, selectedId, onSelect, className }: {
    title: string,
    icon: React.ReactNode,
    items: RFIWorkflowItem[],
    selectedId?: string,
    onSelect: (item: RFIWorkflowItem) => void,
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
                {items.length > 0 ? items.map((item) => (
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
                            <div className="flex items-center gap-1.5">
                                {item.direction === 'Inbound' ? (
                                    <ArrowDownLeft size={10} className="text-emerald-500" />
                                ) : (
                                    <ArrowUpRight size={10} className="text-blue-500" />
                                )}
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{item.direction}</span>
                            </div>
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
                            <span className="text-[9px] text-slate-500 font-medium truncate max-w-[150px]">{item.subtitle}</span>
                            <span className="text-[8px] font-mono text-slate-400">{item.timestamp}</span>
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                        <span className="text-[9px] font-mono uppercase">Lanes Clear</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function RFIDetailView({
    item,
    entityWithRels,
    neighbors,
    loadingRels,
    onSelectLink,
    onRefresh,
    responseText,
    setResponseText
}: {
    item: RFIWorkflowItem,
    entityWithRels: EntityWithRelationships | null,
    neighbors: Entity[],
    loadingRels: boolean,
    onSelectLink: (id: string) => void,
    onRefresh: () => void,
    responseText: string,
    setResponseText: (val: string) => void
}) {
    const displayEntity = entityWithRels && entityWithRels.id === item.id ? entityWithRels : item.originalData;

    const handleSendResponse = async () => {
        if (!responseText.trim()) return;
        try {
            const currentResponses = displayEntity.properties?.responses || [];
            const newResponse = {
                id: Math.random().toString(36).substr(2, 9),
                text: responseText,
                responder: 'J3 Ops Chief',
                date: new Date().toISOString()
            };

            await OntologyService.updateEntity(item.id, {
                properties: {
                    ...displayEntity.properties,
                    responses: [...currentResponses, newResponse]
                }
            });

            setResponseText('');
            onRefresh();
        } catch (error) {
            console.error("Failed to send response:", error);
        }
    };

    const handleCloseRFI = async () => {
        try {
            await OntologyService.updateEntity(item.id, { status: 'Closed' });
            onRefresh();
        } catch (error) {
            console.error("Failed to close RFI:", error);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Detail Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-800 text-[9px] font-mono px-2 py-0.5 rounded-full">
                        RFI :: {item.id}
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
                        <User size={16} />
                        <span className="font-medium">{displayEntity.properties?.originator_id || 'U-01 Staff'}</span>
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
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Response Plan</span>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-sm">
                            <Lock size={16} /> {displayEntity.properties?.escalation_policy || 'INTEL_DIRECTIVE_4'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Metadata / Content */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Requirement Statement</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {displayEntity.description || "Official RFI statement pending expansion in graph repository."}
                    </p>
                </div>

                <div className="p-6 border-2 border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="text-blue-500" size={20} />
                        <span className="text-[11px] font-black uppercase tracking-tight">Transmission Security Audit</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase font-bold">Direction</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono font-black">{item.direction}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-slate-500 uppercase font-bold">Due Date</span>
                            <span className="text-slate-700 dark:text-slate-300 font-mono font-black">{displayEntity.properties?.due_date || 'N/A'}</span>
                        </div>
                        {displayEntity.properties && Object.entries(displayEntity.properties).map(([key, value]) => {
                            if (['responses', 'priority', 'direction', 'due_date', 'originator_id'].includes(key)) return null;
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
                    </div>
                </div>

                {/* Responses Chain */}
                <section className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] flex items-center gap-2">
                        <MessageSquare size={14} className="text-blue-500" /> Response Audit Chain
                    </h3>

                    <div className="space-y-4">
                        {(displayEntity.properties?.responses || []).map((resp: any) => (
                            <div key={resp.id} className="relative pl-8 group">
                                <div className="absolute left-0 top-0 w-px h-full bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-500/30 transition-all" />
                                <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-700 group-hover:bg-blue-500 transition-all" />

                                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/50 rounded-xl p-5 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-[10px] font-black text-blue-500 border border-blue-500/20">
                                                {resp.responder.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{resp.responder}</div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Staff</div>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-mono text-slate-400">{new Date(resp.date).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{resp.text}"</p>
                                </div>
                            </div>
                        ))}

                        {item.status.toLowerCase() !== 'closed' && (
                            <div className="pt-4">
                                <div className="bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 focus-within:border-blue-500/50 transition-all shadow-xl">
                                    <textarea
                                        placeholder="Input official response..."
                                        value={responseText}
                                        onChange={(e) => setResponseText(e.target.value)}
                                        className="w-full h-32 bg-transparent text-sm text-slate-900 dark:text-white outline-none resize-none placeholder:text-slate-300 dark:placeholder:text-slate-700"
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            <ShieldCheck size={14} className="text-emerald-500" /> Authenticated Hub
                                        </div>
                                        <Button
                                            onClick={handleSendResponse}
                                            disabled={!responseText.trim()}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-10 shadow-lg shadow-blue-500/20"
                                        >
                                            Transmit <Send size={14} className="ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Relationship Context */}
                {entityWithRels && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Intelligence Associations</h3>
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
                                            NAV
                                        </Badge>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {loadingRels && (
                    <div className="flex items-center gap-2 py-4">
                        <div className="w-3 h-3 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">Tracing Graph Path...</span>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                <Button
                    onClick={handleCloseRFI}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest h-12 border border-slate-800"
                >
                    Conclude RFI Requirement
                </Button>
                <Button variant="outline" className="flex-1 border-slate-200 dark:border-slate-800 border-2 font-black uppercase tracking-widest h-12">
                    Open in Full Intel Suite
                </Button>
            </div>
        </div>
    );
}
