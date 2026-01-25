import { useEffect, useState } from 'react';
import {
    Presentation,
    ChevronLeft,
    ChevronRight,
    Layout,
    Clock,
    User,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Monitor,
    Scale,
    Globe,
    ShieldCheck,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import type { Brief } from '@/lib/smartops/types';

interface AdvisoryStatus {
    legad: 'PENDING' | 'CLEARED' | 'CAVEATED' | 'BLOCKED';
    polad: 'PENDING' | 'CLEARED' | 'SENSITIVE' | 'ESCALATION_RISK';
    notes: string;
}

const MOCK_ADVISORY: Record<string, AdvisoryStatus> = {
    'br-jfc-001': { legad: 'CLEARED', polad: 'CLEARED', notes: "LOAC verified for all proposed targets." },
    'br-air-002': { legad: 'CAVEATED', polad: 'SENSITIVE', notes: "Sector B overflight requires Host Nation verbal approval." },
    'br-intel-003': { legad: 'PENDING', polad: 'PENDING', notes: "Awaiting final target pack validation." }
};




export function BriefingManagement() {
    const [briefs, setBriefs] = useState<Brief[]>([]);
    const [selectedBrief, setSelectedBrief] = useState<Brief | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [advisoryState, setAdvisoryState] = useState<Record<string, AdvisoryStatus>>(MOCK_ADVISORY);

    const handleSignOff = (role: 'legad' | 'polad', status: string, briefId: string) => {
        setAdvisoryState(prev => ({
            ...prev,
            [briefId]: {
                ...prev[briefId],
                [role]: status
            }
        }));
    };

    useEffect(() => {
        async function loadData() {
            const data = await SmartOpsService.getBriefs() as Brief[];
            setBriefs(data);
            if (data.length > 0) {
                setSelectedBrief(data[0]);
            }
            setLoading(false);
        }
        loadData();
    }, []);

    const handleNext = () => {
        if (selectedBrief && currentSlideIndex < selectedBrief.slides.length - 1) {
            setCurrentSlideIndex(currentSlideIndex + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(currentSlideIndex - 1);
        }
    };

    const currentSlide = selectedBrief?.slides[currentSlideIndex];

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Retrieving Intelligence Briefs...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">

            {/* Sidebar - Brief List */}
            <div className="w-80 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950/30">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready Briefs</h3>
                    <Presentation size={14} className="text-slate-600" />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {briefs.map(b => (
                        <button
                            key={b.id}
                            onClick={() => {
                                setSelectedBrief(b);
                                setCurrentSlideIndex(0);
                            }}
                            className={cn(
                                "w-full p-4 rounded text-left transition-all border flex flex-col gap-2",
                                selectedBrief?.id === b.id
                                    ? "bg-blue-600/10 border-blue-500/50"
                                    : "bg-transparent border-transparent hover:bg-slate-900/50 text-slate-400"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className="text-[11px] font-black uppercase text-white tracking-tight">{b.title}</span>
                                <span className={cn(
                                    "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase",
                                    b.status === 'Final' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                )}>{b.status}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500">
                                <span className="flex items-center gap-1"><User size={10} /> {b.ownerCell}</span>
                                <span className="flex items-center gap-1"><Layout size={10} /> {b.slides.length} Slides</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Presentation Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
                {selectedBrief && currentSlide ? (
                    <>
                        {/* HUD Scanline Effect Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-10 opacity-30"></div>

                        {/* Slide Content Header */}
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 z-20 backdrop-blur-sm">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{selectedBrief.title}</h2>
                                <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500">
                                    <span className="flex items-center gap-1.5 uppercase font-bold"><Clock size={12} /> ISSUED: {new Date(selectedBrief.createdAt).toLocaleString()}</span>
                                    <span className="flex items-center gap-1.5 uppercase font-bold text-blue-400"><Monitor size={12} /> MODE: INTERACTIVE SESSION</span>
                                </div>
                            </div>
                            <div className="flex bg-slate-900 border border-slate-800 rounded p-1">
                                <button onClick={handlePrev} disabled={currentSlideIndex === 0} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronLeft size={20} />
                                </button>
                                <div className="px-4 flex items-center text-[10px] font-black text-slate-500 border-x border-slate-800">
                                    PAGE {currentSlideIndex + 1} / {selectedBrief.slides.length}
                                </div>
                                <button onClick={handleNext} disabled={currentSlideIndex === selectedBrief.slides.length - 1} className="p-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Slide Body */}
                        <div className="flex-1 p-12 overflow-y-auto scrollbar-hide z-0">
                            <div className="max-w-5xl mx-auto space-y-12">

                                {/* BLUF - Only on First and Last slides */}
                                {(currentSlideIndex === 0 || currentSlideIndex === selectedBrief.slides.length - 1) && (
                                    <section className="p-8 bg-blue-600/10 border border-blue-500/30 rounded-lg relative">
                                        <div className="absolute top-0 right-0 p-3 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl rounded-tr-lg">
                                            BLUF: Bottom Line Up Front
                                        </div>
                                        <p className="text-lg font-bold text-blue-100 leading-relaxed italic">
                                            "{selectedBrief.bluf}"
                                        </p>
                                    </section>
                                )}

                                <section className="space-y-6">
                                    <h3 className="text-xl font-black text-white uppercase border-b border-slate-800 pb-4 flex items-center gap-3">
                                        <ArrowRight className="text-blue-500" /> {currentSlide.title}
                                    </h3>

                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-base text-slate-300 leading-loose font-bold bg-slate-900/50 p-6 rounded-lg border border-slate-800">
                                            {currentSlide.content}
                                        </p>
                                    </div>
                                </section>

                                {/* Dynamic Instruction Boxes */}
                                <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-900">
                                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg flex gap-4">
                                        <AlertCircle className="text-yellow-500 shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-black text-white uppercase mb-2">System Instruction</h4>
                                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                                Use the **Targeting Hub** to nominate identified nodes. Ensure the **ROE Hub** has released the required engagement authority before requesting execution.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-lg flex gap-4">
                                        <CheckCircle2 className="text-emerald-500 shrink-0" />
                                        <div>
                                            <h4 className="text-[10px] font-black text-white uppercase mb-2">Next Steps</h4>
                                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                                                Once the brief is concluded, navigate to the **Joint Decision Board** to formalize the approvals briefed in this session.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Presentation Footer */}
                        <div className="h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 z-20 relative">
                            <div className="flex items-center gap-4">
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                    Slide {currentSlideIndex + 1} / {selectedBrief.slides.length}
                                </span>
                                <div className="h-4 w-px bg-slate-800" />
                                <div className="flex gap-2">
                                    <button className="p-1 hover:bg-slate-800 rounded text-slate-400"><Layout size={14} /></button>
                                    <button className="p-1 hover:bg-slate-800 rounded text-slate-400"><Monitor size={14} /></button>
                                </div>
                            </div>

                            {/* Advisory Status Bar */}
                            <div className="flex items-center gap-4 flex-1 justify-center">
                                {advisoryState[selectedBrief.id] && (
                                    <div className="flex gap-4 bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-800">
                                        <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                                            <span className="text-[9px] font-black text-slate-500 uppercase">LEGAD</span>
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 rounded uppercase",
                                                advisoryState[selectedBrief.id].legad === 'CLEARED' ? "bg-emerald-500/10 text-emerald-500" :
                                                    advisoryState[selectedBrief.id].legad === 'PENDING' ? "bg-slate-800 text-slate-500" :
                                                        "bg-amber-500/10 text-amber-500"
                                            )}>{advisoryState[selectedBrief.id].legad}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-slate-500 uppercase">POLAD</span>
                                            <span className={cn(
                                                "text-[9px] font-bold px-1.5 rounded uppercase",
                                                advisoryState[selectedBrief.id].polad === 'CLEARED' ? "bg-emerald-500/10 text-emerald-500" :
                                                    advisoryState[selectedBrief.id].polad === 'PENDING' ? "bg-slate-800 text-slate-500" :
                                                        "bg-amber-500/10 text-amber-500"
                                            )}>{advisoryState[selectedBrief.id].polad}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentSlideIndex === 0}
                                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentSlideIndex === selectedBrief.slides.length - 1}
                                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Advisory Review Side Panel Overlay - Triggered on last slide or manual toggle */}
                        <div className={cn(
                            "absolute right-0 top-16 bottom-16 w-80 bg-slate-950/95 border-l border-slate-800 p-6 backdrop-blur-xl transform transition-transform duration-300 z-30 shadow-2xl",
                            currentSlideIndex === selectedBrief.slides.length - 1 ? "translate-x-0" : "translate-x-full"
                        )}>
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                                <ShieldCheck className="text-blue-500" size={18} />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">Advisory Review</h3>
                            </div>

                            {advisoryState[selectedBrief.id] ? (
                                <div className="space-y-6">
                                    {/* LEGAD Section */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Scale size={14} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Legal (LOAC)</span>
                                            </div>
                                            {advisoryState[selectedBrief.id].legad === 'CLEARED' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={cn("text-[9px] font-bold h-8 border-slate-700", advisoryState[selectedBrief.id].legad === 'CLEARED' && "bg-emerald-900/20 text-emerald-500 border-emerald-500/50")}
                                                onClick={() => handleSignOff('legad', 'CLEARED', selectedBrief.id)}
                                            >
                                                CLEAR
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={cn("text-[9px] font-bold h-8 border-slate-700", advisoryState[selectedBrief.id].legad === 'CAVEATED' && "bg-amber-900/20 text-amber-500 border-amber-500/50")}
                                                onClick={() => handleSignOff('legad', 'CAVEATED', selectedBrief.id)}
                                            >
                                                CAVEAT
                                            </Button>
                                        </div>
                                    </div>

                                    {/* POLAD Section */}
                                    <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Globe size={14} className="text-slate-500" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase">Political (ROE)</span>
                                            </div>
                                            {advisoryState[selectedBrief.id].polad === 'CLEARED' && <CheckCircle2 size={14} className="text-emerald-500" />}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={cn("text-[9px] font-bold h-8 border-slate-700", advisoryState[selectedBrief.id].polad === 'CLEARED' && "bg-emerald-900/20 text-emerald-500 border-emerald-500/50")}
                                                onClick={() => handleSignOff('polad', 'CLEARED', selectedBrief.id)}
                                            >
                                                ENDORSE
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className={cn("text-[9px] font-bold h-8 border-slate-700", advisoryState[selectedBrief.id].polad === 'SENSITIVE' && "bg-amber-900/20 text-amber-500 border-amber-500/50")}
                                                onClick={() => handleSignOff('polad', 'SENSITIVE', selectedBrief.id)}
                                            >
                                                FLAG
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-2 bg-slate-900/50 p-3 rounded border border-slate-800">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Advisory Notes</span>
                                        <p className="text-[10px] text-slate-300 italic leading-relaxed">
                                            "{advisoryState[selectedBrief.id].notes}"
                                        </p>
                                    </div>

                                    {(advisoryState[selectedBrief.id].legad === 'CLEARED' && advisoryState[selectedBrief.id].polad === 'CLEARED') ? (
                                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                                            <Check className="text-emerald-500" size={20} />
                                            <div>
                                                <div className="text-[10px] font-black text-emerald-500 uppercase">Mission Approved</div>
                                                <div className="text-[9px] text-emerald-400/80">Brief cleared for execution</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 justify-center pt-2 opacity-50">
                                            <span className="text-[9px] font-bold text-slate-600 uppercase">Awaiting Sign-off</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500 italic text-xs">
                                    No advisory record linked to this brief ID.
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <div className="p-8 rounded-full bg-slate-900 animate-pulse border border-slate-800">
                            <Presentation size={64} className="opacity-20" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">Select Intelligent Brief to Begin Session</span>
                    </div>
                )}
            </div>

        </div>
    );
}
