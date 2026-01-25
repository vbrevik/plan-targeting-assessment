import { useState } from 'react';
import {
    Lightbulb,
    ArrowRight,
    MoreHorizontal,
    Plus,
    Rocket,
    Beaker,
    Box,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Stage = 'parked' | 'concept' | 'project' | 'prototype' | 'production';

interface Idea {
    id: string;
    title: string;
    description: string;
    stage: Stage;
    maturity: {
        knowledge: number; // 1-5
        technology: number; // 1-5
        organization: number; // 1-5
    };
    pot: ('people' | 'organization' | 'technology')[];
    perspectiveIds: number[];
}

const initialIdeas: Idea[] = [
    {
        id: '1',
        title: 'AI-Driven RFI Autosuggest',
        description: 'Using LLMs to detect high-uncertainty COGs and draft RFIs automatically.',
        stage: 'concept',
        maturity: { knowledge: 3, technology: 2, organization: 1 },
        pot: ['technology'],
        perspectiveIds: [3, 9] // AI, Intel
    },
    {
        id: '2',
        title: 'HFI Simulation Bridge',
        description: 'Connector between Wargamer and VBS4 for kinetic validation.',
        stage: 'parked',
        maturity: { knowledge: 2, technology: 1, organization: 1 },
        pot: ['technology'],
        perspectiveIds: [8] // Training
    },
    {
        id: '3',
        title: 'Responsive ROE Display',
        description: 'Real-time restricted zone overlays based on live tracks.',
        stage: 'project',
        maturity: { knowledge: 4, technology: 3, organization: 2 },
        pot: ['organization', 'technology'],
        perspectiveIds: [6] // Legal
    }
];

const stages: { id: Stage; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'parked', label: 'Parked / Icebox', icon: Box, color: 'text-slate-400 border-slate-700' },
    { id: 'concept', label: 'Concept / Idea', icon: Lightbulb, color: 'text-amber-400 border-amber-500/50' },
    { id: 'project', label: 'Active Project', icon: Rocket, color: 'text-blue-400 border-blue-500/50' },
    { id: 'prototype', label: 'Prototype / Beta', icon: Beaker, color: 'text-purple-400 border-purple-500/50' },
    { id: 'production', label: 'Rolled Out', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/50' }
];

const potLabels = {
    people: { emoji: '🧑', label: 'People', color: 'text-purple-400 bg-purple-500/10' },
    organization: { emoji: '🏛️', label: 'Org', color: 'text-blue-400 bg-blue-500/10' },
    technology: { emoji: '💻', label: 'Tech', color: 'text-emerald-400 bg-emerald-500/10' },
};

export function BrainstormingCanvas() {
    const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
    const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

    const moveIdea = (id: string, direction: 'next' | 'prev') => {
        setIdeas(prev => prev.map(idea => {
            if (idea.id !== id) return idea;
            const currentIndex = stages.findIndex(s => s.id === idea.stage);
            const nextIndex = direction === 'next' ? Math.min(currentIndex + 1, stages.length - 1) : Math.max(currentIndex - 1, 0);
            return { ...idea, stage: stages[nextIndex].id };
        }));
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-1">
                        <Lightbulb className="text-amber-500" size={24} /> Innovation Canvas
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Lifecycle Management for Lessons Learned</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-xs font-black uppercase transition-all">
                    <Plus size={16} /> New Idea
                </button>
            </header>

            {/* Canvas Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <div className="flex h-full gap-6 min-w-max">
                    {stages.map(stage => (
                        <div key={stage.id} className="w-80 flex flex-col h-full">
                            {/* Stage Header */}
                            <div className={cn("p-4 border-b-2 bg-slate-900/40 rounded-t-xl flex items-center gap-3 mb-2", stage.color)}>
                                <stage.icon size={18} />
                                <span className="text-xs font-black uppercase tracking-wider">{stage.label}</span>
                                <span className="ml-auto text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                                    {ideas.filter(i => i.stage === stage.id).length}
                                </span>
                            </div>

                            {/* Drop Zone / List */}
                            <div className="flex-1 bg-slate-900/20 rounded-b-xl p-2 space-y-3 overflow-y-auto border border-slate-800/50">
                                {ideas.filter(i => i.stage === stage.id).map(idea => (
                                    <div
                                        key={idea.id}
                                        onClick={() => setSelectedIdea(idea)}
                                        className={cn(
                                            "p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition-all group relative",
                                            selectedIdea?.id === idea.id ? "ring-2 ring-blue-500 bg-slate-800" : ""
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-sm font-bold text-white leading-tight">{idea.title}</h3>
                                            <button className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{idea.description}</p>

                                        {/* POT Tags */}
                                        <div className="flex gap-1 mb-3 flex-wrap">
                                            {idea.pot.map(cat => (
                                                <span key={cat} className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1", potLabels[cat].color)}>
                                                    <span>{potLabels[cat].emoji}</span>
                                                    {potLabels[cat].label}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Maturity Indicators */}
                                        <div className="grid grid-cols-3 gap-1 mb-3">
                                            <div className="bg-slate-950/50 p-1 rounded text-center">
                                                <div className="text-[7px] text-slate-500 uppercase">Know</div>
                                                <div className="text-[9px] font-black text-purple-400">L{idea.maturity.knowledge}</div>
                                            </div>
                                            <div className="bg-slate-950/50 p-1 rounded text-center">
                                                <div className="text-[7px] text-slate-500 uppercase">Tech</div>
                                                <div className="text-[9px] font-black text-emerald-400">L{idea.maturity.technology}</div>
                                            </div>
                                            <div className="bg-slate-950/50 p-1 rounded text-center">
                                                <div className="text-[7px] text-slate-500 uppercase">Org</div>
                                                <div className="text-[9px] font-black text-blue-400">L{idea.maturity.organization}</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="pt-2 border-t border-slate-700/50 flex justify-end gap-2">
                                            {stage.id !== 'parked' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveIdea(idea.id, 'prev'); }}
                                                    className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white"
                                                    title="Move Back"
                                                >
                                                    <ArrowRight size={12} className="rotate-180" />
                                                </button>
                                            )}
                                            {stage.id !== 'production' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); moveIdea(idea.id, 'next'); }}
                                                    className="p-1 hover:bg-slate-700 rounded text-slate-500 hover:text-white"
                                                    title="Advance Stage"
                                                >
                                                    <ArrowRight size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
