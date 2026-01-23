import { useEffect, useState } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { CCIR, CCIRHit, RequirementType, LogicCondition, Unit, Target } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { cn } from '@/lib/utils';
import {
    AlertTriangle,
    ShieldAlert,
    Plus,
    Trash2,
    Database,
    List,
    Activity,
    CheckCircle2,
    XCircle,
    MessageSquare,
    Siren,
    Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function CCIRManagement() {
    const { filterByContext } = useOperationalContext();
    const [viewMode, setViewMode] = useState<'requirements' | 'dashboard'>('requirements');

    // Data State
    const [ccirs, setCcirs] = useState<CCIR[]>([]);
    const [hits, setHits] = useState<CCIRHit[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState(true);

    // Requirements View State
    const [selectedCCIR, setSelectedCCIR] = useState<CCIR | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [builderState, setBuilderState] = useState<{
        type: RequirementType;
        priority: CCIR['priority'];
        description: string;
        conditions: LogicCondition[];
    }>({
        type: 'PIR',
        priority: 'High',
        description: '',
        conditions: []
    });

    // Feedback State
    const [feedbackInput, setFeedbackInput] = useState('');

    const loadData = async () => {
        setLoading(true);
        const [ccirData, hitsData, unitsData, targetsData] = await Promise.all([
            SmartOpsService.getCCIRs(),
            SmartOpsService.getCCIRHits(),
            SmartOpsService.getOrbat() as Promise<Unit[]>,
            SmartOpsService.getTargets()
        ]);
        setCcirs(ccirData);
        setHits(hitsData);
        setUnits(unitsData);
        setTargets(targetsData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Entity Resolver Helper ---
    const resolveEntity = (id: string, type: string) => {
        if (type === 'Unit') {
            const u = units.find(x => x.id === id);
            return u ? { name: u.designator, subtext: 'ORBAT Unit' } : { name: 'Unknown Unit', subtext: id };
        }
        if (type === 'Target') {
            const t = targets.find(x => x.id === id || x.designator === id); // handle both cases
            return t ? { name: t.designator, subtext: t.name || 'Joint Target' } : { name: 'Unknown Target', subtext: id };
        }
        if (type === 'CivilAgency') return { name: 'Civil Agency', subtext: id };
        if (type === 'SupplyNode') return { name: 'Supply Node', subtext: id };
        if (type === 'BioSensor') return { name: 'Staff Bio-Sensor', subtext: id };

        return { name: 'Unknown Entity', subtext: id };
    };

    // --- Actions ---
    const handleSaveRequirement = () => {
        const newCCIR: CCIR = {
            id: `ccir-${Date.now()}`,
            type: builderState.type,
            priority: builderState.priority,
            description: builderState.description,
            conditions: builderState.conditions,
            status: 'Active',
            createdAt: new Date().toISOString()
        };
        // Mock save
        setCcirs([...ccirs, newCCIR]);
        setIsCreating(false);
    };

    const handleReqFeedback = async () => {
        if (!selectedCCIR || !feedbackInput.trim()) return;
        await SmartOpsService.addCCIRFeedback(selectedCCIR.id, feedbackInput);
        await loadData(); // Reload to see comment
        setFeedbackInput('');
        // Re-select to update view (in real app, use better state sync)
        const updated = ccirs.find(c => c.id === selectedCCIR.id);
        if (updated) setSelectedCCIR(updated);
    };

    const handleHitAction = async (hitId: string, action: 'Verified' | 'FalsePositive') => {
        await SmartOpsService.updateCCIRHitStatus(hitId, action);
        await loadData();
    };

    const handleHitFeedback = async (hitId: string, comment: string) => {
        await SmartOpsService.addCCIRHitFeedback(hitId, comment);
        await loadData();
    };

    // --- Renderers ---

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse uppercase text-xs font-black">Loading Intelligence Data...</div>;

    return (
        <div className="h-full flex flex-col bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Main Header */}
            <header className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-blue-500" />
                        Information Management
                    </h1>
                    <p className="text-xs text-slate-500 font-mono mt-1">CCIR // PIR // FFIR // EEFI</p>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex bg-slate-900 p-1 rounded border border-slate-800">
                    <button
                        onClick={() => setViewMode('requirements')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all",
                            viewMode === 'requirements' ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <List size={12} /> Requirements Manager
                    </button>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={cn(
                            "flex items-center gap-2 px-4 py-1.5 rounded text-[10px] font-black uppercase transition-all",
                            viewMode === 'dashboard' ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Siren size={12} className={cn(hits.some(h => h.status === 'New') && "animate-pulse")} />
                        Alert Dashboard
                        {hits.some(h => h.status === 'New') && (
                            <span className="ml-1 px-1.5 py-0.5 bg-white text-red-600 rounded-full text-[9px]">{hits.filter(h => h.status === 'New').length}</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">

                {/* === VIEW 1: REQUIREMENTS MANAGER === */}
                {viewMode === 'requirements' && (
                    <div className="flex-1 flex overflow-hidden">
                        {/* List */}
                        <div className="w-1/3 flex flex-col border-r border-slate-800 bg-slate-900/10">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h2 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Defined Rules</h2>
                                <Button onClick={() => { setIsCreating(true); setSelectedCCIR(null); }} size="sm" className="h-6 text-[10px] bg-blue-600 hover:bg-blue-500">
                                    <Plus size={12} className="mr-1" /> NEW
                                </Button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {ccirs.filter(filterByContext).map(item => (
                                    <div
                                        key={item.id}
                                        onClick={() => { setIsCreating(false); setSelectedCCIR(item); }}
                                        className={cn(
                                            "p-3 rounded border cursor-pointer transition-all group hover:bg-slate-800",
                                            selectedCCIR?.id === item.id ? "bg-slate-800 border-blue-500/50" : "bg-slate-900/40 border-slate-800"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                                                    item.type === 'PIR' ? "bg-purple-500/20 text-purple-400" :
                                                        item.type === 'FFIR' ? "bg-blue-500/20 text-blue-400" :
                                                            item.type === 'EEFI' ? "bg-amber-500/20 text-amber-400" : "bg-slate-700 text-slate-300"
                                                )}>{item.type}</span>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase px-1.5 py-0.5 rounded border",
                                                    item.priority === 'Critical' ? "text-red-500 bg-red-950/30 border-red-500/50" : "text-slate-400 border-slate-700"
                                                )}>{item.priority}</span>
                                            </div>
                                        </div>
                                        <p className="text-xs font-bold text-slate-200 line-clamp-2">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details / Builder */}
                        <div className="flex-1 bg-slate-950 flex flex-col">
                            {isCreating ? (
                                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-black text-white uppercase mb-2">Create Requirement</h2>
                                        <p className="text-sm text-slate-500">Define ontology-based monitoring rules.</p>
                                    </div>

                                    {/* Simplified Builder UI for brevity/stability in this rewrite */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-xs uppercase text-slate-500">Type</Label>
                                                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                                                    value={builderState.type}
                                                    onChange={e => setBuilderState(s => ({ ...s, type: e.target.value as any }))}>
                                                    <option value="PIR">PIR (Priority Intel)</option>
                                                    <option value="FFIR">FFIR (Friendly Force)</option>
                                                    <option value="EEFI">EEFI (Essential Info)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-xs uppercase text-slate-500">Priority</Label>
                                                <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm"
                                                    value={builderState.priority}
                                                    onChange={e => setBuilderState(s => ({ ...s, priority: e.target.value as any }))}>
                                                    <option value="Critical">Critical</option>
                                                    <option value="High">High</option>
                                                    <option value="Medium">Medium</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs uppercase text-slate-500">Description</Label>
                                            <textarea
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm min-h-[80px]"
                                                value={builderState.description}
                                                onChange={e => setBuilderState(s => ({ ...s, description: e.target.value }))}
                                                placeholder="Describe the requirement logic..."
                                            />
                                        </div>
                                        {/* Logic Builder would go here - preserving simplified state for now */}
                                        <div className="pt-4 flex justify-end gap-2">
                                            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                            <Button onClick={handleSaveRequirement}>Save Rule</Button>
                                        </div>
                                    </div>
                                </div>
                            ) : selectedCCIR ? (
                                <div className="flex-1 overflow-y-auto">
                                    <div className="p-8 pb-20 max-w-3xl mx-auto">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-black bg-slate-800 px-2 py-0.5 rounded text-slate-300 border border-slate-700">{selectedCCIR.id}</span>
                                                    <span className={cn(
                                                        "text-xs font-black px-2 py-0.5 rounded uppercase border",
                                                        selectedCCIR.priority === 'Critical' ? "text-red-500 border-red-500/30" : "text-blue-400 border-blue-500/30"
                                                    )}>{selectedCCIR.priority}</span>
                                                </div>
                                                <h2 className="text-2xl font-black text-white uppercase leading-tight">{selectedCCIR.description}</h2>
                                            </div>
                                            <Button variant="outline" size="sm" className="border-slate-700 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900">
                                                <Trash2 size={14} className="mr-2" /> Archive
                                            </Button>
                                        </div>

                                        {/* Logic Chain Display */}
                                        <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-6 mb-8">
                                            <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
                                                <Database size={12} /> Ontology Logic
                                            </h3>
                                            <div className="space-y-3">
                                                {(selectedCCIR.conditions || []).map((c, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-sm p-3 bg-slate-950 rounded border border-slate-800/50">
                                                        <span className="bg-blue-900/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-blue-500/20">{c.subjectType}</span>
                                                        <span className="text-slate-500 text-xs italic">property</span>
                                                        <span className="font-mono text-purple-400 font-bold">{c.property}</span>
                                                        <span className="font-black text-slate-600 text-[10px] uppercase">{c.operator}</span>
                                                        <span className="font-mono text-white bg-slate-800 px-2 py-0.5 rounded">{c.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Feedback Loop */}
                                        <div className="border-t border-slate-800 pt-8">
                                            <h3 className="text-[10px] font-black uppercase text-slate-500 mb-4 flex items-center gap-2">
                                                <MessageSquare size={12} /> Requirement Refinement & Feedback
                                            </h3>

                                            <div className="space-y-4 mb-6">
                                                {(selectedCCIR.feedback || []).map((fb, idx) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                            {fb.userId.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="bg-slate-800/50 rounded p-3 text-xs text-slate-300 flex-1">
                                                            <p className="mb-1">{fb.comment}</p>
                                                            <span className="text-[9px] text-slate-500">{new Date(fb.createdAt).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!selectedCCIR.feedback?.length) && (
                                                    <p className="text-xs text-slate-600 italic">No feedback recorded on this requirement.</p>
                                                )}
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                                    placeholder="Add comment or refinement suggestion..."
                                                    value={feedbackInput}
                                                    onChange={e => setFeedbackInput(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleReqFeedback()}
                                                />
                                                <Button size="sm" onClick={handleReqFeedback} disabled={!feedbackInput.trim()}>
                                                    <Send size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                                    <List size={48} className="mb-4 opacity-20" />
                                    <p className="text-xs font-black uppercase tracking-widest">Select a requirement to manage</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === VIEW 2: ALERT DASHBOARD === */}
                {viewMode === 'dashboard' && (
                    <div className="flex-1 bg-slate-900/30 p-8 overflow-y-auto">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <Activity className="text-red-500" />
                                        Active Alerts
                                    </h2>
                                    <p className="text-slate-500 text-sm">Real-time ontology hits matching active requirements.</p>
                                </div>
                                <div className="flex gap-4 text-xs font-mono text-slate-500">
                                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> {hits.filter(h => h.status === 'New').length} New</span>
                                    <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {hits.filter(h => h.status === 'Verified').length} Verified</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {hits.filter(filterByContext).map(hit => {
                                    // Lookup Context
                                    const req = ccirs.find(c => c.id === hit.ccirId);
                                    const entity = resolveEntity(hit.entityId, hit.entityType);

                                    return (
                                        <div key={hit.id} className={cn(
                                            "bg-slate-950 border rounded-lg overflow-hidden transition-all",
                                            hit.status === 'New' ? "border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]" : "border-slate-800"
                                        )}>
                                            <div className="p-4 flex items-center gap-6">
                                                {/* Severity / Type */}
                                                <div className="flex flex-col items-center min-w-[60px]">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center mb-2 border",
                                                        req?.priority === 'Critical' ? "bg-red-950 text-red-500 border-red-900" : "bg-slate-900 text-slate-500 border-slate-800"
                                                    )}>
                                                        <AlertTriangle size={20} />
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase text-slate-500">{req?.type}</span>
                                                </div>

                                                {/* Main Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-[10px] uppercase font-black bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">{hit.timestamp.split('T')[1].substring(0, 5)}Z</span>
                                                        <h3 className="text-sm font-bold text-white">{req?.description || 'Unknown Requirement'}</h3>
                                                    </div>

                                                    {/* Ontology Context */}
                                                    <div className="flex items-center gap-4 mt-3 p-2 bg-slate-900/50 rounded border border-slate-800/50">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] uppercase font-black text-slate-500">Subject</div>
                                                            <div className="text-xs text-blue-400 font-bold flex items-center gap-1">
                                                                <Database size={10} /> {entity.name}
                                                            </div>
                                                        </div>
                                                        <div className="w-px h-3 bg-slate-800" />
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] uppercase font-black text-slate-500">Observed Value</div>
                                                            <div className="text-xs text-white font-mono bg-slate-800 px-1.5 rounded">
                                                                {JSON.stringify(hit.valueObserved).replace(/"/g, '')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2 min-w-[140px]">
                                                    {hit.status === 'New' ? (
                                                        <>
                                                            <Button onClick={() => handleHitAction(hit.id, 'Verified')} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white h-7 text-[10px] uppercase font-black">
                                                                <CheckCircle2 size={12} className="mr-1.5" /> Verify Hit
                                                            </Button>
                                                            <Button onClick={() => handleHitAction(hit.id, 'FalsePositive')} size="sm" variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-400 h-7 text-[10px] uppercase font-black">
                                                                <XCircle size={12} className="mr-1.5" /> False Positive
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className={cn(
                                                            "text-center py-1 rounded text-[10px] font-black uppercase border",
                                                            hit.status === 'Verified' ? "bg-emerald-950/30 text-emerald-500 border-emerald-900" : "bg-slate-900 text-slate-500 border-slate-800"
                                                        )}>
                                                            {hit.status}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Hit Feedback Section */}
                                            <div className="bg-slate-950/50 border-t border-slate-800/50 p-3 px-4 flex flex-col gap-2">
                                                {(hit.feedback || []).map((fb, i) => (
                                                    <div key={i} className="text-[10px] text-slate-400 flex gap-2">
                                                        <span className="font-bold text-slate-500">{fb.userId}:</span>
                                                        <span>{fb.comment}</span>
                                                    </div>
                                                ))}
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-transparent border-none text-[10px] text-slate-300 placeholder:text-slate-700 focus:outline-none"
                                                        placeholder="Add operational verify note..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleHitFeedback(hit.id, e.currentTarget.value);
                                                                e.currentTarget.value = '';
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {hits.length === 0 && (
                                    <div className="p-12 text-center border border-dashed border-slate-800 rounded-lg">
                                        <Activity size={32} className="mx-auto text-slate-700 mb-2" />
                                        <p className="text-slate-500 font-bold uppercase text-xs">No Active Alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
