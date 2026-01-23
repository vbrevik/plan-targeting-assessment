import { useState } from 'react';
import {
    Search,
    FileText,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronRight,
    Target,
    Cpu,
    Brain,
    Users,
    Globe,
    Scale,
    Shield,
    GraduationCap,
    Eye,
    Lock,
    Truck,
    Satellite,
    Layers,
    ZoomIn,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Perspective {
    id: number;
    name: string;
    focus: string;
    icon: React.ElementType;
    pot: ('people' | 'organization' | 'technology')[];
    maturity: 1 | 2 | 3 | 4 | 5;
    status: 'complete' | 'in-progress' | 'not-started';
    lastReviewed: string | null;
    gapsIdentified: number;
    mitigated: number;
}

const initialPerspectives: Perspective[] = [
    { id: 1, name: 'COPD Alignment', focus: 'Operational Doctrine (NATO Planning)', icon: Target, pot: ['organization'], maturity: 3, status: 'complete', lastReviewed: '2026-01-05', gapsIdentified: 4, mitigated: 3 },
    { id: 2, name: 'IT Service & Architecture', focus: 'Scalability, API, Security', icon: Cpu, pot: ['technology'], maturity: 2, status: 'complete', lastReviewed: '2026-01-05', gapsIdentified: 5, mitigated: 1 },
    { id: 3, name: 'AI & Cognitive Augmentation', focus: 'RAG, ML, Prescriptive AI', icon: Brain, pot: ['technology'], maturity: 1, status: 'in-progress', lastReviewed: '2026-01-05', gapsIdentified: 4, mitigated: 0 },
    { id: 4, name: 'Human Factors (UX)', focus: 'Cognitive Load, Accessibility', icon: Users, pot: ['people'], maturity: 2, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 5, name: 'Interoperability (FMN)', focus: 'NATO Standards, Coalition', icon: Globe, pot: ['technology'], maturity: 1, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 6, name: 'Legal & Ethical (LOAC)', focus: 'Audit, ROE, Compliance', icon: Scale, pot: ['organization'], maturity: 2, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 7, name: 'Resilience (DDIL)', focus: 'Offline, Edge, Failover', icon: Shield, pot: ['technology'], maturity: 1, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 8, name: 'Training & Simulation', focus: 'Sandbox, AAR, HFI', icon: GraduationCap, pot: ['people'], maturity: 1, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 9, name: 'Intelligence (TCPED)', focus: 'ISR, Collection, ATR', icon: Eye, pot: ['organization', 'technology'], maturity: 2, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 10, name: 'Cybersecurity', focus: 'SOC, UEBA, SOAR', icon: Lock, pot: ['technology'], maturity: 2, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 11, name: 'Logistics (J4)', focus: 'Supply Chain, CBM+', icon: Truck, pot: ['organization', 'technology'], maturity: 2, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 12, name: 'Space Domain', focus: 'SSA, SATCOM, PNT', icon: Satellite, pot: ['technology'], maturity: 1, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
    { id: 13, name: 'Disruptive Technologies', focus: 'Autonomy, AI/ML, Quantum, Hypersonics', icon: Zap, pot: ['technology', 'organization'], maturity: 1, status: 'not-started', lastReviewed: null, gapsIdentified: 0, mitigated: 0 },
];

const potLabels = {
    people: { emoji: '🧑', label: 'People', color: 'text-purple-400 bg-purple-500/10' },
    organization: { emoji: '🏛️', label: 'Org', color: 'text-blue-400 bg-blue-500/10' },
    technology: { emoji: '💻', label: 'Tech', color: 'text-emerald-400 bg-emerald-500/10' },
};

const mockGapDetails: Record<number, { title: string; desc: string; severity: 'High' | 'Medium' | 'Low' }[]> = {
    1: [
        { title: 'Phase 3b Transition Logic', desc: 'Criteria for shifting from Dominate to Stabilize are ambiguous in current OPLAN.', severity: 'High' },
        { title: 'ROE-Targeting Mismatch', desc: 'Current ROE constraints conflict with Phase 2 JTB nomination guidance.', severity: 'High' },
        { title: 'Logistic Feasibility Check', desc: 'COPD requires J4 validation for COA 2, which is missing.', severity: 'Medium' },
        { title: 'StratCom Sync', desc: 'Key Leader Engagement (KLE) annex not aligned with kinetic tempo.', severity: 'Low' }
    ]
};

const maturityLabels = ['', 'Initial', 'Managed', 'Defined', 'Measured', 'Optimizing'];

export function GapAnalysisFramework() {
    const [perspectives, setPerspectives] = useState(initialPerspectives);
    const [selectedPerspective, setSelectedPerspective] = useState<Perspective | null>(perspectives[0]);
    const [filter, setFilter] = useState<'all' | 'complete' | 'in-progress' | 'not-started'>('all');
    const [viewMode, setViewMode] = useState<'holistic' | 'detail'>('holistic');
    const [analyzing, setAnalyzing] = useState(false);

    const handleRunAnalysis = () => {
        if (!selectedPerspective) return;
        setAnalyzing(true);
        setTimeout(() => {
            setAnalyzing(false);
            const now = new Date().toISOString().split('T')[0];
            setPerspectives(prev => prev.map(p =>
                p.id === selectedPerspective.id
                    ? { ...p, lastReviewed: now, status: 'complete', gapsIdentified: mockGapDetails[p.id]?.length || 0 }
                    : p
            ));
            // Also update the selected object reference to trigger re-render of detail view immediately
            setSelectedPerspective(prev => prev ? { ...prev, lastReviewed: now, status: 'complete', gapsIdentified: mockGapDetails[prev.id]?.length || 0 } : null);
        }, 1500);
    };

    const filtered = perspectives.filter(p => filter === 'all' || p.status === filter);
    const totalGaps = perspectives.reduce((sum, p) => sum + p.gapsIdentified, 0);
    const totalMitigated = perspectives.reduce((sum, p) => sum + p.mitigated, 0);

    const statusColor = (status: Perspective['status']) => {
        switch (status) {
            case 'complete': return 'text-emerald-500 bg-emerald-500/10';
            case 'in-progress': return 'text-amber-500 bg-amber-500/10';
            case 'not-started': return 'text-slate-500 bg-slate-500/10';
        }
    };

    const statusIcon = (status: Perspective['status']) => {
        switch (status) {
            case 'complete': return CheckCircle2;
            case 'in-progress': return Clock;
            case 'not-started': return AlertTriangle;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-8 border-b border-slate-800 bg-slate-950/40">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-1">
                            <Search className="text-blue-500" size={24} /> Gap Analysis Framework
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Continuous Improvement & Capability Assessment</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-right">
                            <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Total Gaps</span>
                            <span className="text-xl font-black text-amber-500">{totalGaps}</span>
                        </div>
                        <div className="text-right border-l border-slate-800 pl-6">
                            <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Mitigated</span>
                            <span className="text-xl font-black text-emerald-500">{totalMitigated}</span>
                        </div>
                        <div className="text-right border-l border-slate-800 pl-6">
                            <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Perspectives</span>
                            <span className="text-xl font-black text-white">{perspectives.length}</span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs & Hermeneutic Toggle */}
                <div className="flex justify-between items-center mt-6">
                    <div className="flex gap-2">
                        {(['all', 'complete', 'in-progress', 'not-started'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                    filter === f ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-500 hover:text-white"
                                )}
                            >
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('holistic')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                viewMode === 'holistic' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <Layers size={12} /> Holistic
                        </button>
                        <button
                            onClick={() => setViewMode('detail')}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5",
                                viewMode === 'detail' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-white"
                            )}
                        >
                            <ZoomIn size={12} /> Deep Dive
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {viewMode === 'holistic' ? (
                    // Holistic Dashboard View
                    <div className="flex-1 overflow-y-auto p-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(p => {
                                const StatusIcon = statusIcon(p.status);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            setSelectedPerspective(p);
                                            setViewMode('detail');
                                        }}
                                        className="bg-slate-900/40 border border-slate-800 hover:bg-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-left transition-all group relative overflow-hidden flex flex-col h-64"
                                    >
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <p.icon size={100} />
                                        </div>

                                        <div className="mb-4">
                                            <div className={cn("inline-flex p-3 rounded-xl mb-4", statusColor(p.status))}>
                                                <p.icon size={24} />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase leading-tight mb-1 pr-8">{p.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{p.focus}</p>
                                        </div>

                                        <div className="mt-auto space-y-4 relative z-10">
                                            {/* Status Badge */}
                                            <div className="flex items-center justify-between">
                                                <div className={cn("px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1.5", statusColor(p.status).replace('bg-opacity-10', 'bg-opacity-20'))}>
                                                    <StatusIcon size={10} />
                                                    {p.status.replace('-', ' ')}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-400">
                                                    L{p.maturity}
                                                </div>
                                            </div>

                                            {/* Maturity Bar Mini */}
                                            <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                                                    style={{ width: `${(p.maturity / 5) * 100}%` }}
                                                />
                                            </div>

                                            {/* POT Tags */}
                                            <div className="flex gap-1 flex-wrap">
                                                {p.pot.map(cat => (
                                                    <span key={cat} className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold opacity-70 group-hover:opacity-100", potLabels[cat].color)}>
                                                        {potLabels[cat].emoji} {potLabels[cat].label}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    // Deep Dive Split View
                    <>
                        {/* Perspective List */}
                        <div className="w-96 border-r border-slate-800 overflow-y-auto bg-slate-950/20">
                            {filtered.map(p => {
                                const StatusIcon = statusIcon(p.status);
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => setSelectedPerspective(p)}
                                        className={cn(
                                            "w-full p-5 border-b border-slate-800/50 text-left transition-all flex items-center gap-4",
                                            selectedPerspective?.id === p.id ? "bg-blue-600/10 border-l-2 border-l-blue-500" : "hover:bg-slate-900/40"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusColor(p.status))}>
                                            <p.icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-white uppercase truncate">{p.name}</span>
                                                <StatusIcon size={12} className={statusColor(p.status).split(' ')[0]} />
                                            </div>
                                            <span className="text-[9px] text-slate-500 font-medium truncate block">{p.focus}</span>
                                            <div className="flex gap-1 mt-1">
                                                {p.pot.map(cat => (
                                                    <span key={cat} className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold", potLabels[cat].color)}>
                                                        {potLabels[cat].emoji}
                                                    </span>
                                                ))}
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-slate-700 text-slate-300">
                                                    L{p.maturity}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 shrink-0" />
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail Panel */}
                        <div className="flex-1 overflow-y-auto p-10">
                            {selectedPerspective ? (
                                <div className="space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedPerspective.name}</h2>
                                            <p className="text-sm text-slate-400 mt-1">{selectedPerspective.focus}</p>
                                        </div>
                                        <div className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase", statusColor(selectedPerspective.status))}>
                                            {selectedPerspective.status.replace('-', ' ')}
                                        </div>
                                    </div>

                                    {/* POT Categories */}
                                    <div className="flex gap-3">
                                        {selectedPerspective.pot.map(cat => (
                                            <div key={cat} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2", potLabels[cat].color)}>
                                                <span>{potLabels[cat].emoji}</span>
                                                <span>{potLabels[cat].label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Maturity Level */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Maturity Level</span>
                                            <span className="text-sm font-black text-white">{maturityLabels[selectedPerspective.maturity]} (L{selectedPerspective.maturity})</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(level => (
                                                <div
                                                    key={level}
                                                    className={cn(
                                                        "flex-1 h-2 rounded-full transition-all",
                                                        level <= selectedPerspective.maturity ? "bg-gradient-to-r from-amber-500 to-emerald-500" : "bg-slate-800"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-6">
                                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Last Reviewed</span>
                                            <span className="text-lg font-black text-white">{selectedPerspective.lastReviewed || '—'}</span>
                                        </div>
                                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Gaps Identified</span>
                                            <span className="text-lg font-black text-amber-500">{selectedPerspective.gapsIdentified}</span>
                                        </div>
                                        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Mitigated</span>
                                            <span className="text-lg font-black text-emerald-500">{selectedPerspective.mitigated}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-4">
                                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Actions</h3>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={handleRunAnalysis}
                                                disabled={analyzing}
                                                className="flex-1 p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:opacity-50 rounded-xl text-xs font-black uppercase text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                {analyzing ? <Clock size={16} className="animate-spin" /> : <FileText size={16} />}
                                                {analyzing ? 'Analyzing...' : 'Run Analysis'}
                                            </button>
                                            <button className="flex-1 p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black uppercase text-slate-300 transition-all flex items-center justify-center gap-2">
                                                <Eye size={16} /> View Report
                                            </button>
                                        </div>
                                    </div>

                                    {/* Placeholder for gap details */}
                                    {selectedPerspective.gapsIdentified > 0 ? (
                                        <div className="space-y-4">
                                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Identified Gaps</h3>
                                            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3">
                                                {mockGapDetails[selectedPerspective.id] ? (
                                                    mockGapDetails[selectedPerspective.id].map((gap, i) => (
                                                        <div key={i} className="flex items-start gap-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                                            <div className={cn(
                                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                                gap.severity === 'High' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                                                    gap.severity === 'Medium' ? "bg-amber-500" : "bg-blue-500"
                                                            )} />
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="text-xs font-bold text-white uppercase">{gap.title}</h4>
                                                                    <span className="text-[9px] px-1.5 rounded bg-slate-800 text-slate-400 font-mono uppercase">{gap.severity}</span>
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 leading-relaxed">{gap.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-400 italic">No specific gap details currently available for this perspective.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 opacity-50">
                                            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Identified Gaps</h3>
                                            <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 rounded-full bg-slate-800 shadow-inner flex items-center justify-center mb-3">
                                                    <Clock size={20} className="text-slate-600" />
                                                </div>
                                                <h4 className="text-xs font-black text-slate-400 uppercase mb-1">No Analysis Run</h4>
                                                <p className="text-[10px] text-slate-500 max-w-xs">Run an analysis to detect gaps and variances for this perspective.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-600">
                                    <p className="text-sm font-medium">Select a perspective to view details</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
