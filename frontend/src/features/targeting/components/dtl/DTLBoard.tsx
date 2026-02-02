import React, { useState, useEffect } from 'react';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import type { DtlEntry } from '@/lib/mshnctrl/api/targeting';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TSTAlertBanner } from './TSTAlertBanner';
import { ArrowUp, ArrowDown, RefreshCw, Filter, Target, Shield, Activity, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/components/ui/use-toast";

export const DTLBoard: React.FC = () => {
    const { toast } = useToast();
    const [entries, setEntries] = useState<DtlEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    useEffect(() => {
        loadDtl();
    }, []);

    const loadDtl = async () => {
        try {
            setLoading(true);
            const data = await targetingApi.getDtlEntries({ limit: 50 });
            setEntries(data);
        } catch (error) {
            console.error("Failed to load DTL", error);
            toast({
                title: "Error",
                description: "Failed to load Dynamic Target List.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityUpdate = async (id: string, currentPriority: number, change: number, currentFeasibility: number) => {
        const newPriority = Math.max(0, Math.min(1, currentPriority + change));

        try {
            setIsUpdating(id);
            await targetingApi.updateDtlPriority(id, newPriority, currentFeasibility);

            // Optimistic update
            setEntries(entries.map(e =>
                e.id === id ? { ...e, priority_score: newPriority, combined_score: (newPriority + e.feasibility_score) / 2 } : e
            ));

            toast({
                title: "Priority Updated",
                description: `Target priority updated to ${(newPriority * 100).toFixed(0)}%`,
            });
        } catch (error) {
            console.error("Failed to update priority", error);
            toast({
                title: "Error",
                description: "Failed to update priority.",
                variant: "destructive"
            });
            loadDtl(); // Revert on error
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            <TSTAlertBanner />

            <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-500" />
                        Dynamic Target List (DTL)
                    </h2>
                    <p className="text-slate-400">Prioritized list of actionable targets based on urgency and feasibility</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={loadDtl} className="border-slate-700 hover:bg-slate-800 text-slate-300">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-slate-300">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {entries.map((entry, index) => (
                    <Card key={entry.id} className={`bg-slate-900 border-l-4 border-y border-r border-slate-800 ${index < 3 ? 'border-l-green-500 shadow-[inset_0_0_20px_rgba(34,197,94,0.1)]' : 'border-l-slate-700'
                        }`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            {/* Rank & Basic Info */}
                            <div className="flex items-center space-x-6">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-950 rounded border border-slate-800">
                                    <span className="text-xs text-slate-500 uppercase font-mono">Rank</span>
                                    <span className={`text-xl font-bold ${index < 3 ? 'text-green-500' : 'text-slate-400'}`}>#{index + 1}</span>
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3">
                                        <h3 className="font-bold text-lg text-white uppercase tracking-wide">{entry.target_name}</h3>
                                        {entry.is_tst && <Badge variant="destructive" className="animate-pulse bg-red-600 text-white border-none">TST</Badge>}
                                        {entry.aging_hours > 24 && <Badge variant="outline" className="text-orange-500 border-orange-500/50 bg-orange-950/20">Aging ({entry.aging_hours}h)</Badge>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex space-x-4 font-mono">
                                        <span>ID: {entry.target_id.substring(0, 8)}...</span>
                                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> Added: {entry.aging_hours}h ago</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scores */}
                            <div className="flex items-center space-x-8">
                                <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1 text-slate-400 uppercase font-bold">
                                        <span>Priority</span>
                                        <span className={entry.priority_score > 0.7 ? 'text-red-400' : 'text-slate-400'}>{(entry.priority_score * 100).toFixed(0)}%</span>
                                    </div>
                                    <Progress value={entry.priority_score * 100} className="h-2 bg-slate-800" indicatorClassName={entry.priority_score > 0.7 ? 'bg-red-500' : 'bg-blue-500'} />
                                </div>
                                <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1 text-slate-400 uppercase font-bold">
                                        <span>Feasibility</span>
                                        <span className={entry.feasibility_score > 0.7 ? 'text-green-400' : 'text-slate-400'}>{(entry.feasibility_score * 100).toFixed(0)}%</span>
                                    </div>
                                    <Progress value={entry.feasibility_score * 100} className="h-2 bg-slate-800" indicatorClassName="bg-green-600" />
                                </div>
                                <div className="text-center px-4 border-l border-slate-800">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Combined</div>
                                    <div className="text-2xl font-black text-white">{(entry.combined_score * 100).toFixed(0)}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-green-400 hover:bg-slate-800"
                                        onClick={() => handlePriorityUpdate(entry.id, entry.priority_score, 0.1, entry.feasibility_score)}
                                        disabled={isUpdating === entry.id}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                                        onClick={() => handlePriorityUpdate(entry.id, entry.priority_score, -0.1, entry.feasibility_score)}
                                        disabled={isUpdating === entry.id}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 font-bold uppercase text-xs tracking-wider">
                                    <Target className="w-4 h-4 mr-2" />
                                    Task
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {entries.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                        <Shield className="w-12 h-12 mb-4 opacity-20" />
                        <p>No targets currently on the Dynamic Target List.</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center py-20">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-600" />
                    </div>
                )}
            </div>
        </div>
    );
};
