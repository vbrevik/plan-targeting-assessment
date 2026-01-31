import { useState, useEffect } from 'react';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import type { OPLAN, PlanSection } from '@/lib/mshnctrl/types';
import { PlanContentRenderer } from './PlanContentRenderer';
import {
    Filter,
    CheckCircle2,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function OPLANViewer() {
    const [plans, setPlans] = useState<OPLAN[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>('All');
    const [loading, setLoading] = useState(true);
    const [readbackStatus, setReadbackStatus] = useState<Record<string, boolean>>({});

    // Load Plans
    useEffect(() => {
        MshnCtrlService.getOPLANs().then(data => {
            setPlans(data);
            if (data.length > 0) setSelectedPlanId(data[0].id);
            setLoading(false);
        });
    }, []);

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    const roles = ['All', 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J9'];

    const toggleReadback = (sectionId: string) => {
        setReadbackStatus(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Recursive Section Renderer
    const SectionView = ({ section, depth = 0 }: { section: PlanSection; depth?: number }) => {
        // Filter Logic: Show if audience includes 'All', the selected role, or if userRole is 'All'
        const isRelevant = userRole === 'All' || section.audience.includes('All') || section.audience.includes(userRole);

        // If not relevant, maybe show simplified or hide?
        // Let's dim it if not relevant but keep structure, or hide? 
        // Better UX for military: Show structure but collapse/dim irrelevant parts.
        // For this demo, let's just use opacity/highlighting.

        const relevanceClass = isRelevant ? "opacity-100" : "opacity-40 hover:opacity-100 transition-opacity";

        return (
            <div className={cn("mb-6", relevanceClass)} style={{ marginLeft: `${depth * 20}px` }}>
                <div className="flex items-start gap-4 p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{section.title}</span>
                            {section.audience.map(r => (
                                <span key={r} className={cn(
                                    "text-[8px] px-1.5 py-0.5 rounded font-bold uppercase",
                                    r === userRole ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-500"
                                )}>{r}</span>
                            ))}
                        </div>
                        <PlanContentRenderer content={section.content} />
                    </div>

                    {/* Actions / Readback */}
                    <div className="flex flex-col gap-2 shrink-0">
                        <button
                            onClick={() => toggleReadback(section.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                readbackStatus[section.id]
                                    ? "bg-emerald-600 text-white shadow-[0_0_10px_rgba(5,150,105,0.4)]"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                            )}
                        >
                            <CheckCircle2 size={14} />
                            {readbackStatus[section.id] ? "Acknowledged" : "Acknowledge"}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase hover:bg-slate-700 hover:text-white transition-colors">
                            <MessageSquare size={14} /> Feedback
                        </button>
                    </div>
                </div>

                {section.subSections && section.subSections.map(sub => (
                    <SectionView key={sub.id} section={sub} depth={depth + 1} />
                ))}
            </div>
        );
    };

    if (loading) return <div className="p-10 text-slate-500">Loading Plan Viewer...</div>;

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900/50 text-[10px] font-black uppercase tracking-widest">
                            {selectedPlan?.classification.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">v{selectedPlan?.version}</span>
                    </div>

                    <div className="relative inline-block">
                        <select
                            value={selectedPlanId || ''}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="bg-transparent text-2xl font-black text-white uppercase tracking-tight appearance-none pr-8 cursor-pointer hover:text-blue-400 transition-colors focus:outline-none"
                        >
                            {plans.map(p => (
                                <option key={p.id} value={p.id} className="bg-slate-900 text-base">
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={20} className="absolute right-0 top-1.5 text-slate-500 pointer-events-none" />
                    </div>
                </div>

                {/* Role Filter */}
                <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 px-3 text-slate-500">
                        <Filter size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">View As</span>
                    </div>
                    <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg border-none focus:ring-0 cursor-pointer hover:bg-slate-700"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </header>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-10">
                <div className="max-w-4xl mx-auto">
                    {selectedPlan?.sections.map(sec => (
                        <SectionView key={sec.id} section={sec} />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Helper component for chevron in header
function ChevronDown({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
