/**
 * BDA Weapon Performance Panel
 * 
 * Phase 2: Weaponeering integration - displays weapon system performance
 * summaries from historical strike data.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crosshair, Target, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { BdaApi, type WeaponPerformanceSummary } from '@/lib/mshnctrl/api/bda';
import { cn } from '@/lib/utils';

export function BDAWeaponPerformance() {
    const [performance, setPerformance] = useState<WeaponPerformanceSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await BdaApi.getWeaponPerformance();
                setPerformance(data);
                setError(null);
            } catch (e) {
                setError('Failed to load weapon performance data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getReliabilityColor = (percentage: number) => {
        if (percentage >= 90) return 'text-emerald-500';
        if (percentage >= 75) return 'text-amber-500';
        return 'text-red-500';
    };

    const getCepCategory = (cep: number) => {
        if (cep < 5) return { label: 'Excellent', color: 'text-emerald-500' };
        if (cep < 10) return { label: 'Good', color: 'text-blue-500' };
        if (cep < 20) return { label: 'Acceptable', color: 'text-amber-500' };
        return { label: 'Poor', color: 'text-red-500' };
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Crosshair size={14} className="text-blue-500" /> Weapon Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Crosshair size={14} className="text-blue-500" /> Weapon Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center h-32 text-red-400 text-sm">
                        <AlertTriangle size={16} className="mr-2" />
                        {error}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (performance.length === 0) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Crosshair size={14} className="text-blue-500" /> Weapon Performance
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                        <Target size={32} className="mb-2 opacity-50" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Strike Data Available</p>
                        <p className="text-[9px] text-slate-600 mt-1">Strike correlations will appear here after BDA reports are linked to strikes</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-800/50 bg-gradient-to-r from-slate-950/40 to-blue-950/20 py-3 px-4">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <Crosshair size={14} className="text-blue-500 animate-pulse" /> Weapon System Performance Summary
                    <Badge variant="outline" className="ml-auto text-[8px] font-mono text-blue-400 border-blue-500/30 bg-blue-500/5">
                        {performance.length} ACTIVE SYSTEMS
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {performance.map((wp, index) => {
                    const cep = getCepCategory(wp.avg_cep_meters);
                    const isHighPerformance = wp.reliability_percentage >= 90;

                    return (
                        <div
                            key={`${wp.weapon_system}-${wp.munition_type}-${index}`}
                            className="group relative p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-blue-500/40 hover:bg-slate-900/40 transition-all duration-300 shadow-lg"
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors rounded-l-xl" />

                            <div className="flex items-start justify-between mb-4 pl-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-[11px] font-black text-white uppercase tracking-wider">{wp.weapon_system}</h4>
                                        <Badge className="h-4 text-[7px] font-black bg-blue-600/20 text-blue-400 border-blue-500/30">VALIDATED</Badge>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono tracking-tight">{wp.munition_type}</p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-1.5 mb-1">
                                        {isHighPerformance ? (
                                            <TrendingUp size={14} className="text-emerald-500" />
                                        ) : (
                                            <TrendingDown size={14} className="text-red-500" />
                                        )}
                                        <span className={cn(
                                            "text-xl font-black font-mono leading-none tracking-tighter",
                                            getReliabilityColor(wp.reliability_percentage)
                                        )}>
                                            {wp.reliability_percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">System Reliability</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 text-center pl-2">
                                <div className="bg-slate-900/80 border border-slate-800/50 rounded-lg p-2.5 transition-all group-hover:bg-slate-800/40">
                                    <p className="text-[7px] font-black text-slate-500 uppercase mb-1 tracking-widest">Sorties</p>
                                    <p className="text-base font-black text-white font-mono leading-none">{wp.total_strikes}</p>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800/50 rounded-lg p-2.5 transition-all group-hover:bg-slate-800/40">
                                    <p className="text-[7px] font-black text-slate-500 uppercase mb-1 tracking-widest">Impact</p>
                                    <p className="text-base font-black text-emerald-400 font-mono leading-none">{wp.successful_detonations}</p>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800/50 rounded-lg p-2.5 transition-all group-hover:bg-slate-800/40">
                                    <p className="text-[7px] font-black text-slate-500 uppercase mb-1 tracking-widest">Avg CEP</p>
                                    <p className={cn("text-base font-black font-mono leading-none", cep.color)}>
                                        {wp.avg_cep_meters.toFixed(1)}m
                                    </p>
                                </div>
                                <div className="bg-slate-900/80 border border-slate-800/50 rounded-lg p-2.5 transition-all group-hover:bg-slate-800/40">
                                    <p className="text-[7px] font-black text-slate-500 uppercase mb-1 tracking-widest">Malfunc</p>
                                    <p className={cn(
                                        "text-base font-black font-mono leading-none",
                                        wp.malfunctions > 0 ? "text-red-500" : "text-slate-600"
                                    )}>
                                        {wp.malfunctions}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-[8px] pl-2 border-t border-slate-800/50 pt-2">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                        <span className="text-slate-500 uppercase font-black">Accuracy Rating:</span>
                                        <span className={cn("font-bold uppercase", cep.color)}>{cep.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                        <span className="text-slate-500 uppercase font-black">Blast:</span>
                                        <span className="text-slate-300 font-mono">{wp.avg_blast_radius_meters.toFixed(0)}m</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-24 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className={cn("h-full transition-all duration-1000", isHighPerformance ? "bg-emerald-500" : "bg-blue-600")}
                                        style={{ width: `${wp.reliability_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
