import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Target, WeaponSystem } from '@/lib/smartops/types';
import { Crosshair, ShieldAlert, Target as TargetIcon, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeaponeeringCalculatorProps {
    target: Target;
    weapons: WeaponSystem[];
}

export function WeaponeeringCalculator({ target, weapons }: WeaponeeringCalculatorProps) {
    const [selectedWeapon, setSelectedWeapon] = useState<WeaponSystem | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [pd, setPd] = useState<number | null>(null);

    const handleSelectWeapon = (weapon: WeaponSystem) => {
        setSelectedWeapon(weapon);
        setCalculating(true);
        // Simulate calculation
        setTimeout(() => {
            // Mock Pd calculation logic
            const basePd = 0.85;
            const variance = Math.random() * 0.1;
            setPd(basePd - variance);
            setCalculating(false);
        }, 800);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3 bg-slate-900/40 border-slate-800 min-h-[400px]">
                <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                    <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Crosshair size={14} className="text-blue-500" /> Precision Effects Calculator
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Weapon System</label>
                            <div className="grid gap-2">
                                {weapons.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => handleSelectWeapon(w)}
                                        className={cn(
                                            "flex items-center justify-between p-3 border rounded transition-all text-left group",
                                            selectedWeapon?.id === w.id
                                                ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                                                : "bg-slate-950 border-slate-800 hover:border-slate-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-8 h-8 rounded flex items-center justify-center",
                                                selectedWeapon?.id === w.id ? "bg-blue-500 text-white" : "bg-slate-900 text-slate-500"
                                            )}>
                                                <Zap size={14} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-white block uppercase">{w.name}</span>
                                                <span className="text-[9px] text-slate-500 font-mono italic">{w.warhead}</span>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={cn(
                                            "text-[8px] uppercase",
                                            w.collateralRisk === 'Low' ? "text-emerald-500 border-emerald-500/20" :
                                                w.collateralRisk === 'Medium' ? "text-amber-500 border-amber-500/20" :
                                                    "text-red-500 border-red-500/20"
                                        )}>
                                            {w.collateralRisk} RISK
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-950/50 rounded-lg border border-slate-800 flex flex-col items-center justify-center p-8 border-dashed min-h-[300px] relative overflow-hidden">
                            {selectedWeapon ? (
                                <div className="text-center z-10">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150" />
                                        <div className="relative w-32 h-32 border-2 border-slate-800 rounded-full flex items-center justify-center">
                                            <div className="absolute inset-0 border border-blue-500/20 rounded-full animate-ping" />
                                            <div className="absolute inset-4 border border-blue-500/10 rounded-full" />
                                            <TargetIcon size={40} className="text-blue-500/50" />

                                            {/* Simulated Blast Radius */}
                                            <div
                                                className="absolute inset-0 border-2 border-orange-500/50 rounded-full bg-orange-500/10 transition-transform duration-1000"
                                                style={{ transform: calculating ? 'scale(0)' : 'scale(0.8)' }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estimated Impact Zone</p>
                                        <p className="text-xs font-mono text-slate-400">R: {selectedWeapon.blastRadius}m // CEP: 3m</p>
                                    </div>

                                    {calculating && (
                                        <div className="mt-4 flex items-center gap-2 justify-center">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <Crosshair size={32} className="text-slate-700 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Awaiting Weapon Selection</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="border-b border-slate-800/50 bg-slate-950/20">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Target Vulnerability</span>
                            <span className="text-xs font-bold text-white uppercase">{target.category} / Hardened</span>
                        </div>

                        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                            <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">Probability of Destruction (Pd)</span>
                            <div className="mt-1">
                                {calculating ? (
                                    <span className="text-xl font-black text-slate-700 font-mono animate-pulse">--%</span>
                                ) : pd ? (
                                    <span className={cn(
                                        "text-xl font-black font-mono",
                                        pd > 0.8 ? "text-emerald-500" : "text-amber-500"
                                    )}>
                                        {(pd * 100).toFixed(1)}%
                                    </span>
                                ) : (
                                    <span className="text-xl font-black text-slate-700 font-mono">--%</span>
                                )}
                            </div>
                        </div>

                        <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert size={14} className={cn(
                                    selectedWeapon?.collateralRisk === 'High' ? "text-red-500" : "text-emerald-500"
                                )} />
                                <span className="text-[8px] font-black text-slate-500 uppercase">CDE Assessment</span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic leading-tight">
                                {selectedWeapon
                                    ? `Weapon choice results in ${selectedWeapon.collateralRisk.toLowerCase()} collateral risk for this CDE Tier-1 target.`
                                    : "Select weapon to run CDE assessment."}
                            </p>
                        </div>

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase py-4 mt-2"
                            disabled={!selectedWeapon || calculating}
                        >
                            Confirm Weapon Matching
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
