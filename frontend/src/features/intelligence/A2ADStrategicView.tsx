import { useState } from 'react';
import { ShieldAlert, Cpu, Play, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Bubble {
    id: string;
    name: string;
    type: 'AIR_DENIAL' | 'SEA_DENIAL' | 'SIGNAL_JAM';
    radius: number;
    intensity: number; // 0 to 1
    status: 'ACTIVE' | 'DEGRADED' | 'SUPPRESSED';
    color: string;
}

const MOCK_BUBBLES: Bubble[] = [
    { id: 'B-01', name: 'S-400 Bastion North', type: 'AIR_DENIAL', radius: 180, intensity: 0.9, status: 'ACTIVE', color: 'red' },
    { id: 'B-02', name: 'Bastion-P Anti-Ship', type: 'SEA_DENIAL', radius: 150, intensity: 0.8, status: 'ACTIVE', color: 'orange' },
    { id: 'B-03', name: 'Krasukha-4 Jamming', type: 'SIGNAL_JAM', radius: 100, intensity: 0.95, status: 'ACTIVE', color: 'purple' },
    { id: 'B-04', name: 'SAM Battery Coast', type: 'AIR_DENIAL', radius: 120, intensity: 0.6, status: 'DEGRADED', color: 'red' }
];

export function A2ADStrategicView() {
    const [bubbles, setBubbles] = useState<Bubble[]>(MOCK_BUBBLES);
    const [simulating, setSimulating] = useState(false);
    const [timeline, setTimeline] = useState(0); // 0 to 100

    const runSimulation = () => {
        setSimulating(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setTimeline(progress);

            // Randomly degrade bubbles during sim
            if (progress % 20 === 0) {
                setBubbles(prev => prev.map(b => {
                    if (Math.random() > 0.7 && b.status === 'ACTIVE') {
                        return { ...b, status: 'DEGRADED', intensity: b.intensity * 0.5 };
                    }
                    return b;
                }));
            }

            if (progress >= 100) {
                clearInterval(interval);
                setSimulating(false);
            }
        }, 500);
    };

    const resetSim = () => {
        setBubbles(MOCK_BUBBLES);
        setTimeline(0);
        setSimulating(false);
    };

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-full font-sans text-slate-100 uppercase tracking-tight">
            <header className="flex justify-between items-center bg-slate-900/50 p-4 border-b border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-red-600 rounded flex items-center justify-center shadow-lg shadow-red-900/20">
                        <ShieldAlert className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic">A2/AD Strategic Planner</h1>
                        <div className="flex gap-2 mt-1">
                            <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black">Adversary Envelopes</Badge>
                            <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px] font-black">Counter-A2AD Simulation</Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={runSimulation}
                        disabled={simulating}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] gap-2 shadow-lg shadow-blue-900/20"
                    >
                        {simulating ? <RefreshCw className="animate-spin" size={14} /> : <Play size={14} />}
                        RUN MULTI-DOMAIN SIM
                    </Button>
                    <Button
                        onClick={resetSim}
                        variant="outline"
                        className="border-slate-700 text-slate-400 font-black text-[10px]"
                    >
                        RESET OPTION
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel: Target Systems Analysis */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                        <CardHeader className="border-b border-slate-800 py-3">
                            <CardTitle className="text-[10px] font-black tracking-widest text-slate-500">DENIAL NODES</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-slate-800">
                                {bubbles.map(b => (
                                    <div key={b.id} className="p-3 hover:bg-slate-800/50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[11px] font-black text-white">{b.name}</span>
                                            <Badge className={cn(
                                                "text-[8px] font-black",
                                                b.status === 'ACTIVE' ? "bg-red-500" : "bg-amber-600"
                                            )}>{b.status}</Badge>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-mono text-slate-500">{b.id}</span>
                                            <span className="text-[9px] font-bold text-slate-400">{b.type}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000",
                                                    b.color === 'red' ? 'bg-red-500' : b.color === 'orange' ? 'bg-orange-500' : 'bg-purple-500'
                                                )}
                                                style={{ width: `${b.intensity * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 shadow-2xl p-4">
                        <h3 className="text-[10px] font-black text-blue-400 mb-3 tracking-widest">IA ADVISORY</h3>
                        <div className="space-y-3">
                            <div className="bg-blue-600/10 border-l-2 border-blue-600 p-2 text-[10px] text-blue-200">
                                AI suggests Cyber effect on B-03 (Krasukha) to open 30-min window for F-35 entry.
                            </div>
                            <div className="bg-red-600/10 border-l-2 border-red-600 p-2 text-[10px] text-red-200">
                                CRITICAL: B-01 (S-400) has redundant radar sites. SEAD mission requires 4+ assets.
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Center Panel: Strategic Map Viz */}
                <div className="lg:col-span-2 relative min-h-[500px] bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #1e293b 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                        <div className="absolute top-1/2 w-full h-px bg-slate-700" />
                        <div className="absolute left-1/2 h-full w-px bg-slate-700" />
                    </div>

                    {/* Stylized Bubble Viz */}
                    <div className="absolute inset-0 flex items-center justify-center scale-75">
                        {bubbles.map((b, i) => (
                            <div
                                key={b.id}
                                className={cn(
                                    "absolute border-2 transition-all duration-1000 flex items-center justify-center",
                                    b.color === 'red' ? 'border-red-500/40 bg-red-500/5' : b.color === 'orange' ? 'border-orange-500/40 bg-orange-500/5' : 'border-purple-500/40 bg-purple-500/5'
                                )}
                                style={{
                                    width: `${b.radius * 2}px`,
                                    height: `${b.radius * 2}px`,
                                    borderRadius: '50%',
                                    left: `${40 + (i * 10)}%`,
                                    top: `${30 + (i * 8)}%`,
                                    opacity: b.status === 'SUPPRESSED' ? 0.1 : 1,
                                    transform: `scale(${b.intensity})`
                                }}
                            >
                                <span className="text-[10px] font-black opacity-20">{b.id}</span>
                            </div>
                        ))}

                        {/* Simulation Arrow */}
                        {simulating && (
                            <div
                                className="absolute border-t-2 border-blue-400 border-dashed animate-pulse"
                                style={{
                                    width: `${timeline}%`,
                                    left: '10%',
                                    top: '40%',
                                    transform: 'rotate(-10deg)',
                                    transformOrigin: 'left'
                                }}
                            >
                                <ChevronRight className="absolute -right-2 -top-2 text-blue-400" />
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-400">JCO Corridor 7A</span>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 border border-slate-800 p-3 rounded backdrop-blur">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-slate-500 tracking-widest">TIMELINE INJECTION</span>
                            <span className="text-[10px] font-mono text-blue-400">T + {Math.floor(timeline)} HOURS</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${timeline}%` }} />
                        </div>
                    </div>
                </div>

                {/* Right Panel: Simulation Outcomes */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                        <CardHeader className="py-3 bg-slate-950">
                            <CardTitle className="text-[10px] font-black tracking-widest text-slate-500 flex items-center justify-between">
                                OPTION GENERATOR
                                <Cpu size={14} className="text-blue-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-4">
                                <OptionItem
                                    title="Attrit \u0026 Punch"
                                    probability={0.72}
                                    cost="HIGH"
                                    domains={['Air', 'Land', 'Sea']}
                                />
                                <OptionItem
                                    title="Non-Kinetic Entry"
                                    probability={0.45}
                                    cost="LOW"
                                    domains={['Cyber', 'Space']}
                                    active
                                />
                                <OptionItem
                                    title="Saturation Overload"
                                    probability={0.88}
                                    cost="EXREME"
                                    domains={['Air', 'Sea', 'Cyber']}
                                />
                            </div>

                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-[10px] mt-4 border border-slate-700">
                                GENERATE ADDITIONAL COAs
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800 shadow-2xl p-4">
                        <h3 className="text-[10px] font-black text-purple-400 mb-3 tracking-widest">MDO SYNCHRONIZATION</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-500">CYBER DEGRADATION</span>
                                <span className="text-emerald-500">SYNCED</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-500">SPACE PNT JAM</span>
                                <span className="text-amber-500">CONFLICT</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-bold">
                                <span className="text-slate-500">ASW SCREENING</span>
                                <span className="text-slate-600">WAITING</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function OptionItem({ title, probability, cost, domains, active = false }: { title: string, probability: number, cost: string, domains: string[], active?: boolean }) {
    return (
        <div className={cn(
            "p-3 rounded border transition-all cursor-pointer",
            active ? "bg-blue-600/10 border-blue-600" : "bg-slate-800/50 border-slate-700 hover:border-slate-500"
        )}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-black text-white">{title}</span>
                <span className="text-blue-400 font-mono text-[10px]">{Math.floor(probability * 100)}% POS</span>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
                {domains.map(d => (
                    <span key={d} className="text-[8px] font-black bg-slate-950 px-1 rounded text-slate-400 border border-slate-800">{d}</span>
                ))}
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-500 italic">COST: {cost}</span>
                {active && <Badge className="bg-blue-600 text-white text-[8px] font-black h-4 px-1">SELECTED</Badge>}
            </div>
        </div>
    );
}
