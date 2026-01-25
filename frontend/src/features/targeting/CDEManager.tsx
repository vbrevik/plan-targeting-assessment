import { useState, useEffect } from 'react';
import {
    Target,
    AlertTriangle,
    Home,
    FileText,
    CheckCircle2,
    Search,
    BrainCircuit,
    Layers,
    Activity,
    Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Mock Data Types
interface CDETarget {
    id: string;
    designator: string;
    name: string;
    location: string;
    weaponSystem: string;
    warhead: string;
    blastRadius: number; // meters
    populationDensity: number; // people/sqkm
    category: 'High' | 'Medium' | 'Low'; // CDE Level
    status: 'Pending' | 'Analyzing' | 'Cleared' | 'Restricted';
    estimatedCasualties: number;
    collateralStructures: number;
    analyst: string;
    updatedAt: string;
}

export function CDEManager() {
    const [targets, setTargets] = useState<CDETarget[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTarget, setSelectedTarget] = useState<CDETarget | null>(null);

    useEffect(() => {
        // Mock data load
        const mockData: CDETarget[] = [
            {
                id: 'TGT-24-901',
                designator: 'T-1044',
                name: 'Sector 4 Comm Node',
                location: '34.552, 45.112',
                weaponSystem: 'GBU-12',
                warhead: 'MK-82',
                blastRadius: 85,
                populationDensity: 120,
                category: 'Low',
                status: 'Cleared',
                estimatedCasualties: 0,
                collateralStructures: 1,
                analyst: 'Lt. Anderson',
                updatedAt: new Date().toISOString()
            },
            {
                id: 'TGT-24-902',
                designator: 'T-2201',
                name: 'Logistics Depot Alpha',
                location: '34.881, 45.201',
                weaponSystem: 'GBU-31',
                warhead: 'MK-84',
                blastRadius: 380,
                populationDensity: 450,
                category: 'High',
                status: 'Pending',
                estimatedCasualties: 12,
                collateralStructures: 4,
                analyst: 'Pending',
                updatedAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: 'TGT-24-905',
                designator: 'T-1099',
                name: 'Radar Site South',
                location: '33.112, 44.901',
                weaponSystem: 'AGM-114',
                warhead: 'K-Charge',
                blastRadius: 15,
                populationDensity: 0,
                category: 'Low',
                status: 'Analyzing',
                estimatedCasualties: 0,
                collateralStructures: 0,
                analyst: 'Maj. Briggs',
                updatedAt: new Date(Date.now() - 7200000).toISOString()
            }
        ];

        setTimeout(() => {
            setTargets(mockData);
            setSelectedTarget(mockData[1]); // Default select the high CDE one
            setLoading(false);
        }, 800);
    }, []);

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Initializing CDE Engine (Bug Splat Integration)...</div>;

    const riskData = [
        { name: 'Casualties', value: selectedTarget?.estimatedCasualties || 0, fill: '#ef4444' },
        { name: 'Structures', value: selectedTarget?.collateralStructures || 0, fill: '#f59e0b' },
    ];

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 shrink-0">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] font-black border border-amber-500/20 rounded uppercase flex items-center gap-1">
                                <Target size={10} /> Target Assessment
                            </div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">Collateral Damage Estimation (CDE)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Pattern matching and blast effect analysis for No-Strike List (NSL) and Restricted Target List (RTL) validation.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div className="p-3 bg-slate-900/50 border border-slate-800 rounded flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">Pending Review</span>
                            <span className="text-2xl font-black text-white">{targets.filter(t => t.status === 'Pending').length}</span>
                        </div>
                        <Activity className="text-slate-700" size={20} />
                    </div>
                    <div className="p-3 bg-amber-950/10 border border-amber-900/20 rounded flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-amber-500 uppercase font-bold block">High CDE (Level 5)</span>
                            <span className="text-2xl font-black text-amber-500">{targets.filter(t => t.category === 'High').length}</span>
                        </div>
                        <AlertTriangle className="text-amber-500/50" size={20} />
                    </div>
                    <div className="p-3 bg-emerald-950/10 border border-emerald-900/20 rounded flex items-center justify-between">
                        <div>
                            <span className="text-[10px] text-emerald-500 uppercase font-bold block">Cleared for Engage</span>
                            <span className="text-2xl font-black text-emerald-500">{targets.filter(t => t.status === 'Cleared').length}</span>
                        </div>
                        <CheckCircle2 className="text-emerald-500/50" size={20} />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Target List Sidebar */}
                <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col">
                    <div className="p-4 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-2 top-2 h-3 w-3 text-slate-500" />
                            <Input placeholder="Search targets..." className="h-8 pl-8 bg-slate-900 text-xs border-slate-800" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {targets.map(target => (
                            <div
                                key={target.id}
                                onClick={() => setSelectedTarget(target)}
                                className={cn(
                                    "p-3 rounded border cursor-pointer hover:bg-slate-800/50 transition-all",
                                    selectedTarget?.id === target.id ? "bg-slate-800 border-slate-700" : "bg-transparent border-transparent",
                                    target.category === 'High' ? "border-l-2 border-l-red-500" : "border-l-2 border-l-emerald-500"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-black text-white">{target.designator}</span>
                                    <Badge className={cn(
                                        "text-[9px] uppercase px-1 h-4",
                                        target.status === 'Cleared' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                    )}>{target.status}</Badge>
                                </div>
                                <h4 className="text-[11px] text-slate-300 font-bold truncate mb-1">{target.name}</h4>
                                <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                    <span>Level: {target.category}</span>
                                    <span>•</span>
                                    <span>Pop: {target.populationDensity}/km²</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Analysis View */}
                {selectedTarget ? (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                            {/* Analysis Card */}
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase text-white flex items-center gap-2">
                                        <BrainCircuit size={14} className="text-blue-400" /> Estimation Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                                <span className="text-[10px] text-slate-500 uppercase block mb-1">Weapon System</span>
                                                <span className="text-sm font-bold text-white">{selectedTarget.weaponSystem} / {selectedTarget.warhead}</span>
                                            </div>
                                            <div className="p-3 bg-slate-950 rounded border border-slate-800">
                                                <span className="text-[10px] text-slate-500 uppercase block mb-1">Blast Radius 100%</span>
                                                <span className="text-sm font-bold text-white">{selectedTarget.blastRadius}m</span>
                                            </div>
                                        </div>

                                        <div className="h-48 w-full mt-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={riskData} layout="vertical">
                                                    <XAxis type="number" stroke="#64748b" fontSize={10} />
                                                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={80} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '12px' }}
                                                        itemStyle={{ color: '#e2e8f0' }}
                                                        cursor={{ fill: 'transparent' }}
                                                    />
                                                    <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                                                        {riskData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="p-3 bg-red-950/10 border border-red-900/20 rounded">
                                            <span className="text-[10px] font-bold text-red-500 uppercase flex items-center gap-2 mb-2">
                                                <AlertTriangle size={12} /> Critical Warning
                                            </span>
                                            <p className="text-xs text-red-400 leading-relaxed">
                                                Projected casualty count ({selectedTarget.estimatedCasualties}) exceeds Level 3 authorization threshold.
                                                Requires secondary validation and J3 approval before engagement.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Map Visualization Placeholder */}
                            <Card className="bg-slate-900 border-slate-800 flex flex-col">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase text-white flex items-center gap-2">
                                        <Layers size={14} className="text-emerald-400" /> Blast Zone Visualization
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1 min-h-[300px] relative bg-slate-950 m-4 rounded border border-slate-800/50 flex items-center justify-center overflow-hidden">
                                    {/* Abstract Rings */}
                                    <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-red-500/30 bg-red-500/5 flex items-center justify-center animate-pulse">
                                        <div className="absolute w-[120px] h-[120px] rounded-full border-2 border-red-500/60 bg-red-500/10 flex items-center justify-center">
                                            <div className="absolute w-[40px] h-[40px] rounded-full bg-red-500 blur-sm animate-ping" />
                                            <Target size={24} className="text-white z-10" />
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded backdrop-blur border border-slate-700">
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400 mb-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500" /> 100% Lethality ({(selectedTarget.blastRadius * 0.4).toFixed(0)}m)
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400">
                                            <div className="w-2 h-2 rounded-full border border-red-500" /> Frag Range ({selectedTarget.blastRadius}m)
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Approval Actions */}
                        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-800 rounded-full">
                                    <Shield size={20} className="text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase">Engagement Authority</h4>
                                    <p className="text-xs text-slate-500">Current Assessment: <span className="text-white font-mono">{selectedTarget.category} Risk</span></p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" className="border-slate-700 text-slate-400 hover:text-white uppercase text-xs font-bold">
                                    Request Recalculation
                                </Button>
                                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-xs font-black">
                                    <FileText size={14} className="mr-2" /> Validate & Sign-Off
                                </Button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-xs uppercase font-mono">
                        Select a target to analyze
                    </div>
                )}
            </div>
        </div>
    );
}
