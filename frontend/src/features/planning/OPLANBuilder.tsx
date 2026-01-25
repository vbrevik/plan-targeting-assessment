import { useState, useEffect } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { OPLAN, PlanSection } from '@/lib/smartops/types';
import { PlanContentRenderer } from './PlanContentRenderer';
import {
    FileText,
    ChevronRight,
    ChevronDown,
    Plus,
    Save,
    Wand2,
    Database,
    Layers,
    MoreHorizontal,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OPLANBuilder() {
    const [plans, setPlans] = useState<OPLAN[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ai' | 'ontology' | 'overlays'>('ai');

    // Load Plans
    useEffect(() => {
        SmartOpsService.getOPLANs().then(data => {
            setPlans(data);
            if (data.length > 0) setSelectedPlanId(data[0].id);
            setLoading(false);
        });
    }, []);

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    // Recursive function to find section by ID
    const findSection = (sections: PlanSection[], id: string): PlanSection | undefined => {
        for (const sec of sections) {
            if (sec.id === id) return sec;
            if (sec.subSections) {
                const found = findSection(sec.subSections, id);
                if (found) return found;
            }
        }
        return undefined;
    };

    const activeSection = selectedPlan && selectedSectionId
        ? findSection(selectedPlan.sections, selectedSectionId)
        : null;

    if (loading) return <div className="p-10 text-slate-500">Loading OPLANs...</div>;

    // Recursive Tree Item Component
    const TreeItem = ({ section, depth = 0 }: { section: PlanSection; depth?: number }) => {
        const [expanded, setExpanded] = useState(true);
        const hasChildren = section.subSections && section.subSections.length > 0;
        const isSelected = section.id === selectedSectionId;

        return (
            <div>
                <div
                    className={cn(
                        "flex items-center gap-2 py-1.5 px-2 hover:bg-slate-800 rounded cursor-pointer transition-colors group",
                        isSelected ? "bg-blue-600 text-white" : "text-slate-400"
                    )}
                    style={{ paddingLeft: `${depth * 12 + 8}px` }}
                    onClick={() => setSelectedSectionId(section.id)}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                            className="p-0.5 hover:bg-white/10 rounded"
                        >
                            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                    ) : (
                        <span className="w-3" /> // Spacer
                    )}

                    <FileText size={14} className={cn("shrink-0", isSelected ? "text-white" : "text-slate-500")} />
                    <span className="text-xs font-medium truncate">{section.title}</span>

                    {/* Status Dot */}
                    <div className={cn(
                        "ml-auto w-1.5 h-1.5 rounded-full",
                        section.status === 'final' ? "bg-emerald-500" :
                            section.status === 'review' ? "bg-amber-500" : "bg-slate-700"
                    )} />
                </div>

                {hasChildren && expanded && (
                    <div>
                        {section.subSections.map(sub => (
                            <TreeItem key={sub.id} section={sub} depth={depth + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Left Sidebar: Plan Selector & Tree */}
            <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/50">
                <div className="p-4 border-b border-slate-800">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Select Operation Plan</label>
                    <div className="relative">
                        <select
                            value={selectedPlanId || ''}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-bold text-white appearance-none cursor-pointer hover:border-blue-500 transition-colors"
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.status === 'active' ? '🟢 ' : p.status === 'latent' ? '🟠 ' : '⚪ '}
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {selectedPlan?.sections.map(sec => (
                        <TreeItem key={sec.id} section={sec} />
                    ))}

                    <button className="w-full mt-4 flex items-center justify-center gap-2 p-2 border border-dashed border-slate-700 rounded-lg text-slate-500 hover:text-white hover:border-slate-500 transition-all text-xs uppercase font-bold">
                        <Plus size={14} /> Add Annex
                    </button>
                </div>
            </div>

            {/* Main Area: Editor */}
            <div className="flex-1 flex flex-col min-w-0">
                {activeSection ? (
                    <>
                        <header className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/20">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700">
                                        {activeSection.classification.toUpperCase()}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase">
                                        Type: {activeSection.type}
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    value={activeSection.title}
                                    readOnly // Editable in real app
                                    className="bg-transparent text-2xl font-black text-white uppercase tracking-tight focus:outline-none w-full"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black uppercase flex items-center gap-2 transition-colors">
                                    <Save size={14} /> Save
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                            <PlanContentRenderer content={activeSection.content} />
                        </div>

                        {/* Audience Tags Footer */}
                        <div className="p-4 border-t border-slate-800 flex items-center gap-4 bg-slate-950/30">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Audience:</span>
                            <div className="flex gap-2">
                                {activeSection.audience.map(role => (
                                    <span key={role} className="text-[10px] px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <FileText size={48} className="mb-4 opacity-50" />
                        <p className="text-sm font-medium">Select a section to edit</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar: Tools */}
            <div className="w-72 border-l border-slate-800 flex flex-col bg-slate-950/50">
                <div className="flex border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('ai')}
                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border-b-2", activeTab === 'ai' ? "border-blue-500 text-white" : "border-transparent text-slate-500")}
                    >
                        AI Assist
                    </button>
                    <button
                        onClick={() => setActiveTab('ontology')}
                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border-b-2", activeTab === 'ontology' ? "border-purple-500 text-white" : "border-transparent text-slate-500")}
                    >
                        Ontology
                    </button>
                    <button
                        onClick={() => setActiveTab('overlays')}
                        className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border-b-2", activeTab === 'overlays' ? "border-emerald-500 text-white" : "border-transparent text-slate-500")}
                    >
                        Overlays
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {activeTab === 'ai' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
                                <h3 className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-2">
                                    <Wand2 size={14} /> Drafting Assistant
                                </h3>
                                <p className="text-[10px] text-slate-400 mb-3">
                                    Based on "Phase 3", I suggest elaborating on the Rules of Engagement for urban centers.
                                </p>
                                <button className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[10px] font-bold uppercase transition-colors">
                                    Generate Draft
                                </button>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                                <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-500" /> Consistency Check
                                </h3>
                                <div className="space-y-2">
                                    {selectedPlan?.consistencyChecks.map(check => (
                                        <div key={check.id} className="p-2 bg-black/20 rounded border border-slate-800/50">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-[10px] font-bold text-amber-500 uppercase">{check.severity}</span>
                                                <span className="text-[9px] text-slate-600 font-mono">{check.rule}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-tight">{check.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ontology' && (
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search ontology (Unit, Target, COG)..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <SectionHeader title="Operational Units" color="text-purple-400" />
                                {['u-blue-hq', 'u-blue-1bde', 'u-red-7th'].map(id => (
                                    <OntologyItem key={id} id={id} type="Unit" label={id === 'u-red-7th' ? '7 MOT RIF' : id === 'u-blue-1bde' ? '1 MECH BDE' : 'JFC HQ'} />
                                ))}

                                <SectionHeader title="Target Nominations" color="text-red-400" />
                                {['t-1001', 't-002'].map(id => (
                                    <OntologyItem key={id} id={id} type="Target" label={id === 't-1001' ? 'C2 Bunker' : 'SA-20 Battery'} />
                                ))}

                                <SectionHeader title="Centers of Gravity" color="text-emerald-400" />
                                {['cog-blue-1', 'cog-red-1'].map(id => (
                                    <OntologyItem key={id} id={id} type="COG" label={id === 'cog-red-1' ? 'IADS' : 'JFC C2'} />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'overlays' && (
                        <div className="space-y-2">
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-emerald-500" />
                                    <span className="text-xs text-slate-300">MSR Network</span>
                                </div>
                                <CheckCircle2 size={14} className="text-emerald-500" />
                            </div>
                            <div className="p-3 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between opacity-50">
                                <div className="flex items-center gap-2">
                                    <Layers size={14} className="text-emerald-500" />
                                    <span className="text-xs text-slate-300">Phase 3 Objectives</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ title, color }: { title: string, color: string }) {
    return (
        <div className={cn("text-[8px] font-black uppercase tracking-widest pt-2 pb-1 border-b border-slate-900 mb-1", color)}>
            {title}
        </div>
    );
}

function OntologyItem({ id, type, label }: { id: string, type: string, label: string }) {
    const copyTag = () => {
        const tag = `[[${type}:${id}|${label}]]`;
        navigator.clipboard.writeText(tag);
        // In a real app, this would insert into the editor at cursor position
    };

    return (
        <div
            className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded cursor-pointer group"
            onClick={copyTag}
            title={`Click to copy Smart Tag: [[${type}:${id}|${label}]]`}
        >
            <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-purple-500">
                <Database size={12} className="text-purple-500" />
            </div>
            <div className="flex flex-col">
                <span className="text-xs text-slate-300">{label}</span>
                <span className="text-[8px] text-slate-600 font-mono tracking-tighter">{id}</span>
            </div>
            <Plus size={12} className="ml-auto text-slate-500 group-hover:text-white transition-colors" />
        </div>
    );
}
