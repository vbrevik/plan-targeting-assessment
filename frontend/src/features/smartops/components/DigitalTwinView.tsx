import { useState } from 'react';
import {
    Box,
    Layers,
    Play,
    Pause,
    FastForward,
    Rewind,
    Globe,
    Satellite,
    Wind,
    Shield,
    Database,
    Zap,
    Cpu,
    GitBranch,
    CheckCircle,
    CircleSlash,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { systemModules, type SystemModule } from '../services/systemGraph';

export function DigitalTwinView() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentTime, setCurrentTime] = useState(50);
    const [isPlaying, setIsPlaying] = useState(false);
    const [layers, setLayers] = useState({
        assets: false,
        terrain: false,
        weather: false,
        adversarial: false,
        comms: false,

        variance: false,
        audit: false,
        system: true
    });

    const toggleLayer = (layer: keyof typeof layers) => {
        setLayers(prev => {
            const newState = { ...prev };
            // If turning on 'system', turn off operational layers for clarity
            if (layer === 'system' && !prev.system) {
                newState.assets = false;
                newState.terrain = false;
                newState.weather = false;
            }
            // If turning on an operational layer, turn off system
            if (layer !== 'system' && !prev[layer]) {
                newState.system = false;
            }
            newState[layer] = !prev[layer];
            return newState;
        });
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar - Twin Controls */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Simulation Control</h3>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Layer Manager */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Visualization Layers</span>
                        <div className="space-y-2">
                            {[
                                { id: 'assets', label: 'Friendly Assets', icon: Globe },
                                { id: 'adversarial', label: 'Threat Environment', icon: Shield },
                                { id: 'weather', label: 'METOC (Weather)', icon: Wind },
                                { id: 'terrain', label: 'HD Terrain (Digital Elevation)', icon: Layers },
                                { id: 'comms', label: 'C2 Network Architecture', icon: Database },
                                { id: 'audit', label: 'Decision Lineage (Audit)', icon: FileText },
                                { id: 'variance', label: 'Plan vs Execute (PEV)', icon: CircleSlash },
                                { id: 'system', label: 'System Architecture (Dev)', icon: Cpu },
                            ].map((layer) => (
                                <button
                                    key={layer.id}
                                    onClick={() => toggleLayer(layer.id as keyof typeof layers)}
                                    className={cn(
                                        "w-full p-3 rounded-md border flex items-center justify-between transition-all",
                                        layers[layer.id as keyof typeof layers]
                                            ? "bg-blue-600/10 border-blue-500/50 text-white"
                                            : "bg-slate-950/40 border-slate-800 text-slate-500"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <layer.icon size={14} className={layers[layer.id as keyof typeof layers] ? "text-blue-400" : "text-slate-600"} />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{layer.label}</span>
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        layers[layer.id as keyof typeof layers] ? "bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]" : "bg-slate-800"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Simulation Engine Status */}
                    <div className="pt-6 border-t border-slate-800/50 space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">State Engine</span>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded flex items-center gap-4">
                            <div className="h-10 w-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Zap size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <span className="text-[11px] font-black text-white uppercase block">Engine: ECS-ALFA</span>
                                <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Real-Time Sync Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Visualizer */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative overflow-hidden">
                {/* 3D Holotable Mockup */}
                <div className="flex-1 relative flex items-center justify-center">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]" />

                    {/* Perspective Container */}
                    <div className="relative w-[800px] h-[500px] [perspective:1200px] flex items-center justify-center">
                        {/* The Map Base */}
                        <div className="absolute w-[1000px] h-[1000px] bg-blue-900/5 border border-blue-500/20 [transform:rotateX(60deg)_rotateZ(-25deg)] transition-all duration-700 overflow-hidden">
                            {/* Grid Detail */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#2563eb_1px,transparent_1px),linear-gradient(to_bottom,#2563eb_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20" />

                            {layers.terrain && (
                                <>
                                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-slate-800/30 blur-2xl rounded-full" />
                                    <div className="absolute bottom-1/4 right-1/3 w-96 h-48 bg-blue-500/5 blur-3xl rounded-full" />
                                </>
                            )}
                        </div>

                        {/* System Architecture Visualization */}
                        {layers.system && systemModules.map((mod: SystemModule) => (
                            <div
                                key={mod.id}
                                className="absolute transition-all duration-1000"
                                style={{
                                    transform: `translate3d(${mod.coordinates.x * 5}px, ${mod.coordinates.y * 5}px, ${mod.coordinates.z}px) rotateX(-10deg)`
                                }}
                            >
                                <div
                                    onClick={() => {
                                        // Specific Routing Logic
                                        if (mod.id === 'targeting') navigate({ to: '/smartops/targeting' });
                                        else if (mod.id === 'proposals' || mod.name.includes('Workflow')) navigate({ to: '/smartops/proposals' });
                                        else if (mod.id === 'digital_twin') toast({ title: 'Digital Twin', description: 'You are already viewing the Digital Twin simulation.' });
                                        else if (mod.id === 'mdo') navigate({ to: '/smartops/mdo' });
                                        else if (mod.id === 'fusion') navigate({ to: '/smartops/rxp' }); // Intel Fusion -> RXP
                                        else if (mod.id === 'dashboard') navigate({ to: '/smartops/dashboard' });
                                        else {
                                            // Fallback for others
                                            toast({
                                                title: `Module: ${mod.name}`,
                                                description: `${mod.description} (Status: ${mod.status})`,
                                            });
                                        }
                                    }}
                                    className={cn(
                                        "p-3 backdrop-blur-md border rounded flex flex-col gap-1 shadow-[0_0_30px_rgba(0,0,0,0.5)] w-48 group hover:scale-110 transition-transform cursor-pointer",
                                        mod.status === 'Verified' ? "bg-emerald-950/80 border-emerald-500/50" :
                                            mod.status === 'Connected' ? "bg-blue-950/80 border-blue-500/50" :
                                                mod.status === 'Mocked' ? "bg-amber-950/80 border-amber-500/50" :
                                                    "bg-slate-900/80 border-slate-700 border-dashed"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            "w-8 h-8 rounded flex items-center justify-center text-white",
                                            mod.status === 'Verified' ? "bg-emerald-600" :
                                                mod.status === 'Connected' ? "bg-blue-600" :
                                                    mod.status === 'Mocked' ? "bg-amber-600" :
                                                        "bg-slate-800"
                                        )}>
                                            {mod.status === 'Verified' ? <CheckCircle size={16} /> :
                                                mod.status === 'Connected' ? <GitBranch size={16} /> :
                                                    <Cpu size={16} />}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black uppercase text-slate-400 block">Health</span>
                                            <div className="h-1 w-12 bg-slate-800 rounded-full mt-1">
                                                <div className={cn("h-full rounded-full", mod.health > 80 ? "bg-emerald-500" : "bg-red-500")} style={{ width: `${mod.health}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-white uppercase block truncate">{mod.name}</span>
                                        <span className={cn(
                                            "text-[8px] font-mono uppercase",
                                            mod.status === 'Verified' ? "text-emerald-400" :
                                                mod.status === 'Connected' ? "text-blue-400" :
                                                    mod.status === 'Mocked' ? "text-amber-400" : "text-slate-500"
                                        )}>
                                            {mod.status} // Sprint {mod.sprint}
                                        </span>
                                    </div>

                                    {/* Connectivity Lines (Visual Only) */}
                                    <div className="absolute top-1/2 left-full w-12 h-px bg-slate-700 -z-10 opacity-30 origin-left rotate-12" />
                                    <div className="absolute bottom-0 left-1/2 h-12 w-px bg-slate-700 -z-10 opacity-30 origin-top rotate-12" />
                                </div>
                            </div>
                        ))}

                        {/* Operational Layers (Assets, etc.) */}
                        {layers.assets && (
                            <div className="relative z-10 [transform:translateY(-50px)] space-y-4 flex flex-col items-center">
                                <div
                                    onClick={() => toast({ title: 'SIGINT-01 Telemetry', description: 'Orbit: LEO // Fuel: 82% // Next Pass: 14m' })}
                                    className="p-3 bg-slate-900/80 backdrop-blur-md border border-blue-500/50 rounded flex items-center gap-4 shadow-[0_0_30px_rgba(37,99,235,0.2)] cursor-pointer hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded bg-blue-600 flex items-center justify-center text-white">
                                        <Satellite size={24} />
                                    </div>
                                    <div className="pr-4">
                                        <span className="text-[11px] font-black text-white uppercase block tracking-tighter">SIGINT PLATFORM-01</span>
                                        <span className="text-[9px] text-blue-400 font-mono">ALT: 18,200m // HDG: 285°</span>
                                    </div>
                                </div>
                                {/* Connection Beam Mockup */}
                                <div className="w-0.5 h-32 bg-gradient-to-t from-blue-500 to-transparent opacity-50 flex items-end">
                                    <div className="w-4 h-4 rounded-full bg-blue-500 blur-sm animate-ping translate-x-[-7px]" />
                                </div>
                            </div>
                        )}

                        {/* Comms / Network Layer */}
                        {layers.comms && (
                            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                                {/* Network Mesh Visualization */}
                                <div className="absolute w-[600px] h-[600px] border border-emerald-500/20 rounded-full animate-[spin_60s_linear_infinite]" />
                                <div className="absolute w-[400px] h-[400px] border border-emerald-500/30 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
                                {/* Nodes */}
                                {[
                                    { x: -100, y: -50, label: 'SATCOM-A' },
                                    { x: 100, y: 150, label: 'LINK-16 HUB' },
                                    { x: 200, y: -100, label: 'FIBER NODE' },
                                    { x: -150, y: 100, label: 'TAC-NET' }
                                ].map((node, i) => (
                                    <div key={i} className="absolute" style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]" />
                                        <div className="text-[8px] font-mono text-emerald-500 mt-1">{node.label}</div>
                                        {/* Links */}
                                        <div className="absolute top-1 left-1 w-[200px] h-px bg-emerald-500/20 origin-top-left rotate-[45deg]" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {layers.adversarial && (
                            <div className="absolute top-20 right-40 z-10 [transform:translateY(30px)]">
                                <div
                                    onClick={() => toast({ title: 'Threat Intelligence', description: 'Emitter correlated with SA-20 Battery. Tasking ISR.' })}
                                    className="p-3 bg-slate-900/80 backdrop-blur-md border border-red-500/50 rounded flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] cursor-pointer hover:bg-slate-800 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded bg-red-600 flex items-center justify-center text-white">
                                        <Shield size={20} />
                                    </div>
                                    <div className="pr-4">
                                        <span className="text-[11px] font-black text-white uppercase block tracking-tighter">UNIDENTIFIED EMITTER</span>
                                        <span className="text-[9px] text-red-500 font-mono">SECTOR 4 // FREQ: 4.2GHz</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {layers.variance && (
                            <>
                                <div className="absolute top-1/2 left-1/3 z-10">
                                    {/* Ghost Unit 1 (Plan) */}
                                    <div className="absolute -top-16 -left-16 opacity-40">
                                        <div className="w-12 h-12 rounded border-2 border-dashed border-white flex items-center justify-center">
                                            <div className="w-8 h-8 bg-blue-500/20" />
                                        </div>
                                        <span className="text-[8px] font-black text-white uppercase mt-1 block w-24 text-center">Plan: PL Bronze</span>
                                    </div>

                                    {/* Connection Line 1 */}
                                    <div className="absolute -top-8 -left-8 w-24 h-0.5 bg-red-500/50 origin-top-left rotate-12" />
                                    <div className="absolute -top-12 -left-4 px-1 py-0.5 bg-red-500 text-white text-[8px] font-black rounded">
                                        -12km DELAY
                                    </div>

                                    {/* Actual Unit 1 */}
                                    <div className="relative p-2 bg-slate-900 border border-blue-500 rounded shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-black text-[10px]">
                                            1-7 AR
                                        </div>
                                    </div>
                                </div>

                                {/* Variance Example 2: Logistics Drift */}
                                <div className="absolute bottom-1/3 right-1/3 z-10">
                                    {/* Ghost Unit 2 (Plan) */}
                                    <div className="absolute -bottom-12 -right-12 opacity-40">
                                        <div className="w-10 h-10 rounded border-2 border-dashed border-yellow-500 flex items-center justify-center">
                                            <div className="w-6 h-6 bg-yellow-500/20" />
                                        </div>
                                        <span className="text-[8px] font-black text-yellow-500 uppercase mt-1 block w-24 text-center">Plan: CSS Alpha</span>
                                    </div>

                                    {/* Connection Line 2 */}
                                    <div className="absolute -bottom-6 -right-6 w-20 h-0.5 bg-yellow-500/50 origin-bottom-right -rotate-12" />
                                    <div className="absolute -bottom-10 -right-2 px-1 py-0.5 bg-yellow-600 text-white text-[8px] font-black rounded">
                                        ROUTE DEV
                                    </div>

                                    {/* Actual Unit 2 */}
                                    <div className="relative p-2 bg-slate-900 border border-yellow-500 rounded shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                        <div className="w-8 h-8 bg-yellow-600 rounded flex items-center justify-center text-white font-black text-[10px]">
                                            CSS-1
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {layers.audit && (
                            <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="max-w-4xl w-full p-8 relative">
                                    <div className="absolute top-0 left-0 text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                                        <FileText size={14} /> Decision Lineage Trace // ID: DL-2026-001
                                    </div>

                                    <div className="flex items-center justify-between relative mt-8">
                                        {/* Connecting Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10" />

                                        {/* Steps */}
                                        {[
                                            { label: 'Proposal', role: 'J3 Ops', status: 'Submitted', time: '0900Z' },
                                            { label: 'Advisory', role: 'LEGAD', status: 'Cleared', time: '0915Z' },
                                            { label: 'Advisory', role: 'POLAD', status: 'Endorsed', time: '0920Z' },
                                            { label: 'Decision', role: 'Commander', status: 'Approved', time: '0930Z', active: true },
                                            { label: 'Effect', role: 'Kinetic', status: 'Pending', time: 'TBD' }
                                        ].map((step, i) => (
                                            <div key={i} className="flex flex-col items-center gap-4 group">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center bg-slate-950 transition-all",
                                                    step.status === 'Pending' ? "border-slate-800 text-slate-700" :
                                                        step.active ? "border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-110" :
                                                            "border-emerald-500 text-emerald-500"
                                                )}>
                                                    <div className={cn("w-2 h-2 rounded-full", step.status === 'Pending' ? "bg-slate-700" : step.active ? "bg-blue-500 animate-pulse" : "bg-emerald-500")} />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-[10px] font-black uppercase text-white mb-1">{step.label}</div>
                                                    <div className="text-[9px] font-bold text-slate-500 uppercase">{step.role}</div>
                                                    <div className="text-[9px] font-mono text-slate-600 mt-1">{step.time}</div>
                                                </div>
                                                {i < 4 && <ArrowRight className="absolute top-1/2 ml-32 text-slate-800 -z-10" size={16} />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-16 p-4 bg-slate-900 border border-slate-800 rounded">
                                        <h4 className="text-[10px] font-black uppercase text-white mb-2">Golden Thread Analysis</h4>
                                        <p className="text-[11px] text-slate-400 font-mono leading-relaxed">
                                            &gt; PROPOSAL T-800 VALIDATED AGAINST LOAC ART. 57<br />
                                            &gt; ADVISORY CONCURRENCE RECEIVED (LEGAD/POLAD)<br />
                                            &gt; COMMANDER INTENT VERIFIED: "NEUTRALIZE C2"<br />
                                            &gt; ROE 421-B AUTHORIZED<br />
                                            &gt; <span className="text-emerald-500">AUDIT COMPLETE: CHAIN OF CUSTODY VALID</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls Overlay */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[600px] p-6 bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl z-20 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-slate-400 hover:text-white transition-colors"><Rewind size={20} /></button>
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40 hover:scale-105 transition-all"
                                >
                                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white transition-colors"><FastForward size={20} /></button>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Timeline Status</span>
                                <span className="text-[12px] font-mono font-black text-white uppercase">T+ 06:24:12 // PHASE: ALPHA</span>
                            </div>
                        </div>

                        <div className="relative pt-2">
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${currentTime}%` }} />
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={currentTime}
                                onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                                className="absolute inset-0 w-full h-1.5 opacity-0 cursor-pointer"
                            />
                            <div className="flex justify-between mt-2">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">04 JAN 0900Z (START)</span>
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">NOW (REAL TIME)</span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-tighter">06 JAN 1200Z (PREDICTIVE)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Overlay - Metadata */}
                <div className="absolute top-8 left-8 p-4 bg-slate-950/40 backdrop-blur-sm border border-slate-800 rounded-md">
                    <div className="flex items-center gap-3">
                        <Box size={16} className="text-blue-500" />
                        <div>
                            <span className="text-[12px] font-black text-white uppercase tracking-tighter">Holotable v4.2</span>
                            <div className="flex gap-4 mt-1">
                                <span className="text-[8px] font-mono text-slate-500 uppercase">LAT: 32.4412 N</span>
                                <span className="text-[8px] font-mono text-slate-500 uppercase">LON: 14.1287 E</span>
                                <span className="text-[8px] font-mono text-slate-500 uppercase text-blue-400">FPS: 60.0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
