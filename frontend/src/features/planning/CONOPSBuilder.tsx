import { useState } from 'react';
import {
    Compass,
    Target,
    Flag,
    ShieldCheck,
    ChevronRight,
    Save,
    History,
    AlertCircle,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MshnCtrlService } from '@/lib/mshnctrl/mock-service';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export function CONOPSBuilder() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [publishing, setPublishing] = useState(false);

    // CONOPS State
    const [conops, setConops] = useState({
        title: 'CONOPS 26-001 (Northern Shield)',
        commanderIntent: '',
        endState: '',
        decisiveConditions: '',
        schemeOfManeuver: '',
        riskAssessment: 'Low',
        resourcesRequired: ''
    });

    const handleSave = async () => {
        setPublishing(true);
        // Simulate product generation
        await MshnCtrlService.generateProductReport(
            conops.title,
            'FRAGO', // Reusing FRAGO type for now as 'CONOPS' isn't in top-level union yet
            conops,
            'COM JTF (Commander)'
        );

        setTimeout(() => {
            setPublishing(false);
            navigate({ to: '/mshnctrl/products' });
        }, 1500);
    };

    const steps = [
        { id: 1, label: 'Commander\'s Intent', icon: Flag },
        { id: 2, label: 'End State & DC', icon: Target },
        { id: 3, label: 'Operational Scheme', icon: Compass },
        { id: 4, label: 'Risk & Resourcing', icon: ShieldCheck }
    ];

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <header className="p-8 border-b border-slate-800 bg-slate-950/40 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3 mb-2">
                        <Compass className="text-emerald-500" size={24} /> Strategic CONOPS Builder
                    </h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xl">
                        Formalizing the transition from Strategic Design to Operational Execution.
                        Aligning Decisive Conditions with the Commander's Operational Scheme.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-800 bg-slate-900/40 text-[10px] font-black uppercase tracking-widest px-6 h-10 hover:bg-slate-800">
                        View History <History size={14} className="ml-2" />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Stepper Sidebar */}
                <div className="w-72 border-r border-slate-800 p-6 space-y-3 bg-slate-950/20">
                    {steps.map((s) => (
                        <button
                            key={s.id}
                            onClick={() => setStep(s.id)}
                            className={cn(
                                "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group",
                                step === s.id
                                    ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                                    : "bg-slate-900/40 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                step === s.id ? "bg-white/20" : "bg-slate-800 group-hover:bg-slate-700"
                            )}>
                                <s.icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-black uppercase tracking-widest leading-tight">{s.label}</div>
                                <div className="text-[8px] font-bold text-slate-500 uppercase mt-1">Step 0{s.id}</div>
                            </div>
                            {step > s.id && <ShieldCheck size={16} className="text-emerald-400" />}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-12 bg-[#020617] relative">
                    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CONOPS Title</label>
                                    <input
                                        type="text"
                                        value={conops.title}
                                        onChange={(e) => setConops({ ...conops, title: e.target.value })}
                                        className="w-full bg-slate-900/40 border-2 border-slate-800 rounded-2xl p-6 text-xl font-black text-white focus:border-emerald-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Flag className="text-emerald-500" size={18} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Commander's Intent</h3>
                                    </div>
                                    <textarea
                                        placeholder="Articulate the purpose, method, and end state..."
                                        className="w-full h-64 bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 text-slate-300 font-medium leading-relaxed focus:border-emerald-500 outline-none transition-all resize-none"
                                        value={conops.commanderIntent}
                                        onChange={(e) => setConops({ ...conops, commanderIntent: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="text-blue-500" size={18} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Operational End State</h3>
                                    </div>
                                    <textarea
                                        placeholder="What does success look like in precise military terms?"
                                        className="w-full h-40 bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 text-slate-300 font-medium leading-relaxed focus:border-blue-500 outline-none transition-all resize-none"
                                        value={conops.endState}
                                        onChange={(e) => setConops({ ...conops, endState: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="text-blue-500" size={18} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Decisive Conditions (Sync)</h3>
                                    </div>
                                    <textarea
                                        placeholder="List key milestones across all domains..."
                                        className="w-full h-40 bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 text-slate-300 font-medium leading-relaxed focus:border-blue-500 outline-none transition-all resize-none"
                                        value={conops.decisiveConditions}
                                        onChange={(e) => setConops({ ...conops, decisiveConditions: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Compass className="text-amber-500" size={18} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Scheme of Maneuver</h3>
                                    </div>
                                    <textarea
                                        placeholder="Describe the convergence of land, air, and cyber effects..."
                                        className="w-full h-80 bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 text-slate-300 font-medium leading-relaxed focus:border-amber-500 outline-none transition-all resize-none"
                                        value={conops.schemeOfManeuver}
                                        onChange={(e) => setConops({ ...conops, schemeOfManeuver: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Risk Appetite</label>
                                        <div className="flex gap-2">
                                            {['Low', 'Medium', 'High'].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setConops({ ...conops, riskAssessment: r as any })}
                                                    className={cn(
                                                        "flex-1 py-4 rounded-xl font-black uppercase text-[10px] border transition-all",
                                                        conops.riskAssessment === r ? "bg-slate-200 text-slate-950 border-white" : "bg-slate-900 text-slate-500 border-slate-800"
                                                    )}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-4">
                                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Commander's Note</div>
                                            <p className="text-[10px] text-amber-200/60 font-medium leading-relaxed italic">High risk is only acceptable for Decisive Conditions 1.2 and 2.1.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Save className="text-emerald-500" size={18} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Resource Allocation</h3>
                                    </div>
                                    <textarea
                                        placeholder="Detail key forces and critical equipment reserves..."
                                        className="w-full h-40 bg-slate-900/40 border-2 border-slate-800 rounded-3xl p-8 text-slate-300 font-medium leading-relaxed focus:border-emerald-500 outline-none transition-all resize-none"
                                        value={conops.resourcesRequired}
                                        onChange={(e) => setConops({ ...conops, resourcesRequired: e.target.value })}
                                    />
                                </div>

                                <div className="pt-8 border-t border-slate-800 flex justify-end gap-4">
                                    <Button
                                        onClick={handleSave}
                                        disabled={publishing}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] text-xs px-12 py-8 rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-105 transition-all"
                                    >
                                        {publishing ? "Finalizing Product..." : "Sign & Publish CONOPS"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sticky Actions */}
            <div className="h-20 border-t border-slate-800 bg-slate-950 px-10 flex items-center justify-between">
                <div className="flex gap-4">
                    {steps.map(s => (
                        <div key={s.id} className={cn("w-2 h-2 rounded-full", step >= s.id ? "bg-emerald-500" : "bg-slate-800")} />
                    ))}
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest"
                    >
                        Previous Step
                    </Button>
                    <Button
                        onClick={() => setStep(Math.min(4, step + 1))}
                        disabled={step === 4}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-12 flex items-center gap-2"
                    >
                        Continue <ChevronRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
