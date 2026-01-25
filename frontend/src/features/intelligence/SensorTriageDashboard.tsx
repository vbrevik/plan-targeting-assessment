import { useState, useMemo, useEffect } from 'react';
import { Activity, Filter, Layers, Shield, ShieldAlert, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface Track {
    id: string;
    type: 'AIR' | 'SEA' | 'LAND' | 'DECOY';
    confidence: number;
    lethality: number;
    sector: string;
    timestamp: number;
    status: 'TRACKING' | 'TRIAGED' | 'SUPPRESSED';
}

interface Cluster {
    id: string;
    name: string;
    type: 'HOSTILE' | 'AMBIGUOUS' | 'DECOY' | 'NOISE';
    count: number;
    avgConfidence: number;
    avgLethality: number;
    primarySector: string;
    description: string;
    action: string;
}

// Generate massive dataset to simulate saturation
const generateMassiveDataset = (count: number): Track[] => {
    return Array.from({ length: count }, (_, i) => {
        const isDecoy = Math.random() > 0.7;
        const isNoise = Math.random() > 0.8;
        const type = isDecoy ? 'DECOY' : (Math.random() > 0.6 ? 'AIR' : (Math.random() > 0.5 ? 'SEA' : 'LAND'));

        return {
            id: `TRK-${String(i + 1000).padStart(5, '0')}`,
            type,
            // Decoys have low confidence, Real threats have mixed
            confidence: isDecoy ? Math.random() * 0.4 : (isNoise ? Math.random() * 0.3 : 0.6 + Math.random() * 0.4),
            lethality: isDecoy ? 0.1 : (isNoise ? 0 : Math.random()),
            sector: ['Alpha', 'Bravo', 'Charlie', 'Delta'][Math.floor(Math.random() * 4)],
            timestamp: Date.now() - Math.floor(Math.random() * 100000),
            status: 'TRACKING'
        };
    });
};

const INITIAL_TRACKS = generateMassiveDataset(1240); // Overwhelming number

export function SensorTriageDashboard() {
    const [triageEnabled, setTriageEnabled] = useState(false);
    const [tracks] = useState<Track[]>(INITIAL_TRACKS);
    const { toast } = useToast();

    // Derived Saturation Level based on track count
    const saturationLevel = Math.min(100, Math.floor((tracks.length / 500) * 100));

    // Clustering Logic
    const clusters = useMemo(() => {
        if (!triageEnabled) return [];

        const c: Cluster[] = [
            {
                id: 'C-01',
                name: 'Priority Hostiles',
                type: 'HOSTILE',
                count: tracks.filter(t => t.confidence > 0.8 && t.lethality > 0.7 && t.type !== 'DECOY').length,
                avgConfidence: 0.92,
                avgLethality: 0.88,
                primarySector: 'Alpha',
                description: 'High-confidence lethal actors requiring immediate engagement.',
                action: 'ENGAGE'
            },
            {
                id: 'C-02',
                name: 'Ghost Swarm',
                type: 'DECOY',
                count: tracks.filter(t => t.type === 'DECOY').length,
                avgConfidence: 0.25,
                avgLethality: 0.1,
                primarySector: 'Bravo',
                description: 'Pattern-matched electronic duplicates. Likely generators in Sector Bravo.',
                action: 'SUPPRESS'
            },
            {
                id: 'C-03',
                name: 'Ambiguous Surface',
                type: 'AMBIGUOUS',
                count: tracks.filter(t => t.type === 'SEA' && t.confidence > 0.4 && t.confidence < 0.8).length,
                avgConfidence: 0.55,
                avgLethality: 0.4,
                primarySector: 'Charlie',
                description: 'Unidentified maritime traffic mixing effectively with civilian lanes.',
                action: 'INVESTIGATE'
            },
            {
                id: 'C-04',
                name: 'Sensor Noise',
                type: 'NOISE',
                count: tracks.filter(t => t.confidence < 0.3 && t.type !== 'DECOY').length,
                avgConfidence: 0.15,
                avgLethality: 0.0,
                primarySector: 'Global',
                description: 'Atmospheric interference and ground clutter.',
                action: 'FILTER'
            }
        ];
        return c;
    }, [tracks, triageEnabled]);

    useEffect(() => {
        if (triageEnabled) {
            toast({
                title: "Cognitive Shield Activated",
                description: `Aggregating ${tracks.length} signals into ${clusters.length} actionable groups.`
            });
        }
    }, [triageEnabled]);

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-screen font-sans text-slate-100 relative overflow-hidden">
            {/* Background Grid Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
                style={{ backgroundImage: 'linear-gradient(rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30, 41, 59, 0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <header className="relative z-10 flex justify-between items-center bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-lg shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "h-14 w-14 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg border border-slate-700",
                        triageEnabled ? "bg-blue-600 shadow-blue-900/40 border-blue-500" : "bg-red-950/30 animate-pulse border-red-900/50"
                    )}>
                        {triageEnabled ? <Shield className="text-white" size={28} /> : <Activity className="text-red-500" size={28} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            Sensor Triage Control
                            {!triageEnabled && <Badge variant="destructive" className="animate-pulse">SYSTEM SATURATED</Badge>}
                        </h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                            Input Stream: {tracks.length.toLocaleString()} signals | Load: {saturationLevel}%
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Metrics */}
                    <div className="flex gap-6 text-right">
                        <div>
                            <div className="text-[9px] font-black text-slate-500 uppercase">Input Rate</div>
                            <div className="text-lg font-mono font-bold text-white">42Gb/s</div>
                        </div>
                        <div>
                            <div className="text-[9px] font-black text-slate-500 uppercase">Processing</div>
                            <div className={cn("text-lg font-mono font-bold", triageEnabled ? "text-blue-400" : "text-red-500")}>
                                {triageEnabled ? 'OPTIMAL' : 'CRITICAL'}
                            </div>
                        </div>
                    </div>

                    {/* Main Toggle */}
                    <div className="flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-xl border border-slate-700 shadow-inner">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cognitive Shield</span>
                            <span className={cn("text-[10px] font-black uppercase transition-colors", triageEnabled ? "text-blue-500" : "text-slate-600")}>
                                {triageEnabled ? 'ACTIVE' : 'DISABLED'}
                            </span>
                        </div>
                        <Switch
                            checked={triageEnabled}
                            onCheckedChange={setTriageEnabled}
                            className="scale-125 data-[state=checked]:bg-blue-600"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left: Metrics & System State */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
                        <CardHeader className="py-3">
                            <CardTitle className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Signal Saturation</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-300">
                                    <span>Capacity Use</span>
                                    <span className={saturationLevel > 90 ? "text-red-500" : "text-blue-500"}>{saturationLevel}%</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full transition-all duration-300", saturationLevel > 80 ? "bg-red-600" : "bg-blue-600")}
                                        style={{ width: `${saturationLevel}%` }}
                                    />
                                </div>
                                <div className="text-[9px] text-slate-500 mt-2">
                                    Buffers starting to overflow in Sector Bravo. Auto-decimation recommended.
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className={cn(
                        "bg-slate-900/50 border-slate-800 backdrop-blur transition-all duration-500",
                        triageEnabled ? "border-blue-500/50 bg-blue-900/10" : "opacity-60"
                    )}>
                        <CardHeader className="py-3">
                            <CardTitle className="text-[10px] font-black uppercase text-blue-400 tracking-widest flex items-center gap-2">
                                <Cpu size={14} /> AI Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400">Noise Reduction</span>
                                <span className="text-xl font-black text-white">{triageEnabled ? '-84%' : '0%'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400">Actionable Targets</span>
                                <span className="text-xl font-black text-white">{triageEnabled ? clusters.find(c => c.type === 'HOSTILE')?.count || 0 : tracks.filter(t => t.lethality > 0.8).length}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Center/Right: Data Visualization */}
                <div className="lg:col-span-9">
                    {triageEnabled ? (
                        // CLUSTER VIEW
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-300">
                            {clusters.map((cluster) => (
                                <Card key={cluster.id} className={cn(
                                    "border-l-4 shadow-lg transition-all hover:scale-[1.01] cursor-pointer group relative overflow-hidden",
                                    cluster.type === 'HOSTILE' ? "bg-red-950/20 border-l-red-500 border-y-slate-800 border-r-slate-800" :
                                        cluster.type === 'DECOY' ? "bg-purple-900/20 border-l-purple-500 border-y-slate-800 border-r-slate-800" :
                                            cluster.type === 'AMBIGUOUS' ? "bg-amber-900/20 border-l-amber-500 border-y-slate-800 border-r-slate-800" :
                                                "bg-slate-900/50 border-l-slate-500 border-y-slate-800 border-r-slate-800"
                                )}>
                                    {/* Background decoration */}
                                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        {cluster.type === 'HOSTILE' ? <ShieldAlert size={120} /> :
                                            cluster.type === 'DECOY' ? <Layers size={120} /> :
                                                <Activity size={120} />}
                                    </div>

                                    <CardContent className="p-6 relative">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <Badge variant="outline" className={cn(
                                                    "mb-2 text-[9px] font-black uppercase tracking-widest border-opacity-50",
                                                    cluster.type === 'HOSTILE' ? "text-red-400 border-red-500" :
                                                        cluster.type === 'DECOY' ? "text-purple-400 border-purple-500" :
                                                            "text-slate-400 border-slate-500"
                                                )}>{cluster.type} GROUP</Badge>
                                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{cluster.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-4xl font-black text-white">{cluster.count}</div>
                                                <div className="text-[10px] font-bold text-slate-500 uppercase">Signals</div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-300 font-medium mb-6 leading-relaxed border-l-2 border-slate-700 pl-3">
                                            {cluster.description}
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            <div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase">Confidence</div>
                                                <div className={cn("text-lg font-mono font-bold", cluster.avgConfidence > 0.8 ? "text-emerald-400" : "text-slate-300")}>
                                                    {Math.floor(cluster.avgConfidence * 100)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase">Lethality</div>
                                                <div className={cn("text-lg font-mono font-bold", cluster.avgLethality > 0.5 ? "text-red-400" : "text-slate-300")}>
                                                    {Math.floor(cluster.avgLethality * 100)}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-black text-slate-500 uppercase">Sector</div>
                                                <div className="text-lg font-mono font-bold text-white">
                                                    {cluster.primarySector}
                                                </div>
                                            </div>
                                        </div>

                                        <Button className={cn(
                                            "w-full font-black text-xs uppercase tracking-widest h-10 shadow-lg",
                                            cluster.type === 'HOSTILE' ? "bg-red-600 hover:bg-red-700 text-white" :
                                                cluster.type === 'DECOY' ? "bg-purple-600 hover:bg-purple-700 text-white" :
                                                    "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                        )}>
                                            {cluster.action} ENTIRE CLUSTER
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        // RAW LIST VIEW (Overwhelming)
                        <Card className="bg-slate-900 border-slate-800 h-[600px] flex flex-col relative overflow-hidden">
                            {/* Glitch Overlay Effect */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-20 animate-pulse" />

                            <CardHeader className="py-3 bg-slate-950 border-b border-slate-800 flex-shrink-0">
                                <CardTitle className="text-[10px] font-black text-red-500 tracking-widest flex justify-between items-center">
                                    <span className="animate-pulse">WARNING: RAW SENSOR STREAM UNFILTERED</span>
                                    <Filter size={14} />
                                </CardTitle>
                            </CardHeader>
                            <div className="overflow-auto flex-1 p-0 font-mono text-xs relative">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-900 sticky top-0 z-10 text-[9px] uppercase text-slate-500">
                                        <tr>
                                            <th className="p-2 border-b border-slate-800">ID</th>
                                            <th className="p-2 border-b border-slate-800">Type</th>
                                            <th className="p-2 border-b border-slate-800">Cnf</th>
                                            <th className="p-2 border-b border-slate-800">Lth</th>
                                            <th className="p-2 border-b border-slate-800">Sector</th>
                                            <th className="p-2 border-b border-slate-800">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {tracks.map((track) => (
                                            <tr key={track.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-2 text-slate-300">{track.id}</td>
                                                <td className={cn(
                                                    "p-2 font-bold",
                                                    track.type === 'DECOY' ? "text-purple-400" :
                                                        track.type === 'AIR' ? "text-blue-400" : "text-emerald-400"
                                                )}>{track.type}</td>
                                                <td className="p-2 text-slate-400">{Math.floor(track.confidence * 100)}%</td>
                                                <td className="p-2 text-slate-400">{Math.floor(track.lethality * 100)}%</td>
                                                <td className="p-2 text-slate-300">{track.sector}</td>
                                                <td className="p-2 text-red-500/50 animate-pulse">PENDING</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none flex items-end justify-center pb-4 z-20">
                                <span className="bg-red-950/80 text-red-400 px-3 py-1 rounded text-[10px] font-black uppercase border border-red-900 animate-bounce">
                                    Scroll Overflow - {tracks.length - 20} more records
                                </span>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}


