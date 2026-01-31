// BDA Display Component
// Purpose: Display BDA assessment data with imagery comparison and damage metrics
// Updated: Now uses real BDA API instead of mock service

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaReport, type BdaImagery } from '@/lib/mshnctrl/api/bda';
import { cn } from '@/lib/utils';
import {
    Activity,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Camera,
    Save,
    RotateCcw,
    Loader2
} from 'lucide-react';

interface BDADisplayProps {
    targetId: string;
    onStatusChange?: () => void;
    // Optional: For backward compatibility with old BDAReport format
    reports?: any[];
}

export const BDADisplay: React.FC<BDADisplayProps> = ({ targetId, onStatusChange }) => {
    const [reports, setReports] = useState<BdaReport[]>([]);
    const [imagery, setImagery] = useState<BdaImagery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAssessing, setIsAssessing] = useState(false);
    const [evalPhysical, setEvalPhysical] = useState<string>('ND');
    const [evalFunctional, setEvalFunctional] = useState<string>('FMC');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [reportsData, imageryData] = await Promise.all([
                    BdaApi.getReports({ target_id: targetId }),
                    // Get imagery for the latest report if available
                    Promise.resolve([]) // Will be loaded when we have a report
                ]);
                setReports(reportsData);
                
                // Load imagery for the latest report
                if (reportsData.length > 0) {
                    const latestReport = reportsData[0];
                    const reportImagery = await BdaApi.getReportImagery(latestReport.id);
                    setImagery(reportImagery);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load BDA data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [targetId]);

    useEffect(() => {
        if (reports.length > 0) {
            const latest = reports[0];
            setEvalPhysical(latest.physical_damage);
            setEvalFunctional(latest.functional_damage);
        }
    }, [reports]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-slate-800 rounded bg-slate-950/20">
                <Loader2 size={48} className="text-slate-500 mb-4 animate-spin" />
                <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">Loading BDA Data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-red-800 rounded bg-red-950/20">
                <AlertTriangle size={48} className="text-red-500 mb-4" />
                <p className="text-[10px] uppercase font-black text-red-600 tracking-[0.3em]">Error Loading BDA</p>
                <p className="text-[9px] text-red-700 mt-2 font-mono italic">{error}</p>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed border-slate-800 rounded bg-slate-950/20">
                <Camera size={48} className="text-slate-800 mb-4" />
                <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">No BDA Data Available</p>
                <p className="text-[9px] text-slate-700 mt-2 font-mono italic">[AWAITING POST-STRIKE IMAGERY]</p>
            </div>
        );
    }

    const latestReport = reports[0];
    
    // Map physical damage codes to display names
    const physicalDamageNames: Record<string, string> = {
        'ND': 'No Damage',
        'SD': 'Slight Damage',
        'MD': 'Moderate Damage',
        'SVD': 'Severe Damage',
        'D': 'Destroyed'
    };

    const functionalDamageNames: Record<string, string> = {
        'FMC': 'Fully Mission Capable',
        'PMC': 'Partially Mission Capable',
        'NMC': 'Not Mission Capable'
    };

    const recommendationNames: Record<string, string> = {
        'effect_achieved': 'Effect Achieved',
        'monitor': 'Monitor',
        're_attack': 'Re-strike',
        're_weaponeer': 'Re-weaponeer'
    };

    const calculateRecommendation = (phys: string, func: string): string => {
        if (phys === 'D' || func === 'NMC') return 'effect_achieved';
        if (phys === 'SVD' || phys === 'MD') return 'monitor';
        return 're_attack';
    };

    const recommendation = isAssessing 
        ? calculateRecommendation(evalPhysical, evalFunctional)
        : latestReport.recommendation;

    const handleConfirmAssessment = async () => {
        setIsSubmitting(true);
        try {
            // Update the report with new assessment
            await BdaApi.updateReport(latestReport.id, {
                physical_damage: evalPhysical as any,
                functional_damage: evalFunctional as any,
                recommendation: recommendation as any,
            });
            setIsAssessing(false);
            onStatusChange?.();
            // Reload data
            const updated = await BdaApi.getReports({ target_id: targetId });
            setReports(updated);
        } catch (error) {
            console.error('Failed to update assessment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const preStrikeImagery = imagery.filter(img => img.is_pre_strike_baseline);
    const postStrikeImagery = imagery.filter(img => !img.is_pre_strike_baseline);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Comparison */}
                <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800">
                    <CardHeader className="border-b border-slate-800/50 pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-4">
                            <span>Post-Strike Imagery Analysis</span>
                            <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                                CONF: {(latestReport.confidence_level * 100).toFixed(0)}%
                            </Badge>
                        </CardTitle>
                        {!isAssessing && latestReport.status === 'draft' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAssessing(true)}
                                className="h-7 text-[8px] font-black uppercase border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                                Re-evaluate Effects
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col sm:flex-row h-[300px]">
                        {preStrikeImagery.length > 0 ? (
                            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center border-r border-slate-800 relative group overflow-hidden">
                                <span className="absolute top-2 left-2 text-[8px] font-black text-slate-600 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">PRE-STRIKE [T-24H]</span>
                                <img 
                                    src={preStrikeImagery[0].image_url} 
                                    alt="Pre-strike" 
                                    className="w-full h-full object-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center border-r border-slate-800 relative group overflow-hidden">
                                <span className="absolute top-2 left-2 text-[8px] font-black text-slate-600 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">PRE-STRIKE [T-24H]</span>
                                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 opacity-40" />
                                <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
                            </div>
                        )}
                        {postStrikeImagery.length > 0 ? (
                            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center relative group overflow-hidden">
                                <span className="absolute top-2 left-2 text-[8px] font-black text-red-500 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">POST-STRIKE [T+2H]</span>
                                <img 
                                    src={postStrikeImagery[0].image_url} 
                                    alt="Post-strike" 
                                    className="w-full h-full object-cover opacity-60 contrast-125 sepia group-hover:sepia-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={80} className="text-red-500/20 animate-pulse" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center relative group overflow-hidden">
                                <span className="absolute top-2 left-2 text-[8px] font-black text-red-500 uppercase bg-slate-950/80 px-1.5 py-0.5 rounded z-10">POST-STRIKE [T+2H]</span>
                                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Activity size={80} className="text-red-500/20 animate-pulse" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assessment Summary */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardHeader className="border-b border-slate-800/50 pb-3">
                            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                {isAssessing ? 'Target Evaluation' : 'Damage Metrics'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {/* Physical Damage */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Physical Damage</span>
                                    {isAssessing ? (
                                        <select
                                            value={evalPhysical}
                                            onChange={(e) => setEvalPhysical(e.target.value)}
                                            className="bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="ND">ND - No Damage</option>
                                            <option value="SD">SD - Slight</option>
                                            <option value="MD">MD - Moderate</option>
                                            <option value="SVD">SVD - Severe</option>
                                            <option value="D">D - Destroyed</option>
                                        </select>
                                    ) : (
                                        <span className="text-[10px] font-mono text-white">
                                            {physicalDamageNames[latestReport.physical_damage] || latestReport.physical_damage}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            (isAssessing ? evalPhysical : latestReport.physical_damage) === 'D' ? "bg-red-500" :
                                                (isAssessing ? evalPhysical : latestReport.physical_damage) === 'SVD' ? "bg-orange-500" :
                                                    (isAssessing ? evalPhysical : latestReport.physical_damage) === 'MD' ? "bg-yellow-500" :
                                                        (isAssessing ? evalPhysical : latestReport.physical_damage) === 'SD' ? "bg-blue-500" :
                                                            "bg-slate-700"
                                        )}
                                        style={{
                                            width: latestReport.physical_damage_percentage 
                                                ? `${latestReport.physical_damage_percentage}%`
                                                : (isAssessing ? evalPhysical : latestReport.physical_damage) === 'D' ? '100%' :
                                                    (isAssessing ? evalPhysical : latestReport.physical_damage) === 'SVD' ? '75%' :
                                                        (isAssessing ? evalPhysical : latestReport.physical_damage) === 'MD' ? '40%' :
                                                            (isAssessing ? evalPhysical : latestReport.physical_damage) === 'SD' ? '15%' : '0%'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Functional Damage */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Functional Status</span>
                                    {isAssessing ? (
                                        <select
                                            value={evalFunctional}
                                            onChange={(e) => setEvalFunctional(e.target.value)}
                                            className="bg-slate-950 text-[10px] font-mono text-white border border-slate-800 rounded p-1 focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="FMC">FMC - Fully Capable</option>
                                            <option value="PMC">PMC - Partially Capable</option>
                                            <option value="NMC">NMC - Not Capable</option>
                                        </select>
                                    ) : (
                                        <span className="text-[10px] font-mono text-white">
                                            {functionalDamageNames[latestReport.functional_damage] || latestReport.functional_damage}
                                        </span>
                                    )}
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            (isAssessing ? evalFunctional : latestReport.functional_damage) === 'NMC' ? "bg-red-500" : "bg-orange-500"
                                        )}
                                        style={{
                                            width: (isAssessing ? evalFunctional : latestReport.functional_damage) === 'NMC' ? '100%' :
                                                (isAssessing ? evalFunctional : latestReport.functional_damage) === 'PMC' ? '60%' : '0%'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-800/50">
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Recommendation</span>
                                <div className={cn(
                                    "p-3 rounded border flex items-center gap-3 transition-colors duration-500",
                                    recommendation === 'effect_achieved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                        recommendation === 're_attack' || recommendation === 're_weaponeer' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                            "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                )}>
                                    {recommendation === 'effect_achieved' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {recommendationNames[recommendation] || recommendation}
                                    </span>
                                </div>
                            </div>

                            {isAssessing && (
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase h-9"
                                        onClick={handleConfirmAssessment}
                                        disabled={isSubmitting}
                                    >
                                        <Save size={14} className="mr-2" /> {isSubmitting ? 'SUBMITTING...' : 'CONFIRM BDA'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-slate-800 text-slate-500 hover:text-white text-[9px] font-black uppercase h-9"
                                        onClick={() => setIsAssessing(false)}
                                    >
                                        <RotateCcw size={14} />
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert size={14} className="text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">Collateral Assessment</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono italic">
                                {latestReport.collateral_damage_detected 
                                    ? "COLLATERAL DAMAGE DETECTED. IMMEDIATE REVIEW REQUIRED." 
                                    : "No collateral damage detected within 200m radius of impact site."}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
