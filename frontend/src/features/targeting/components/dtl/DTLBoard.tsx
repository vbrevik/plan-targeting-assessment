import React, { useState, useEffect } from 'react';
import { targetingApi } from '@/lib/targeting';
import type { DtlEntry } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TSTAlertBanner } from './TSTAlertBanner';
import { ArrowUp, ArrowDown, RefreshCw, Filter, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';


export const DTLBoard: React.FC = () => {
    const [entries, setEntries] = useState<DtlEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDtl();
    }, []);

    const loadDtl = async () => {
        try {
            setLoading(true);
            const data = await targetingApi.listDtlEntries(50);
            setEntries(data);
        } catch (error) {
            console.error("Failed to load DTL", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePriorityUpdate = async (id: string, currentPriority: number, change: number) => {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;

        // Clamp betweem 0 and 1
        const newPriority = Math.max(0, Math.min(1, currentPriority + change));

        try {
            await targetingApi.updateDtlPriority(id, newPriority, entry.feasibilityScore);
            loadDtl();
        } catch (error) {
            console.error("Failed to update priority", error);
        }
    };

    return (
        <div className="space-y-6">
            <TSTAlertBanner />

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dynamic Target List (DTL)</h2>
                    <p className="text-muted-foreground">Prioritized list of actionable targets based on urgency and feasibility</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={loadDtl}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                </div>
            </div>

            <div className="grid gap-4">
                {entries.map((entry, index) => (
                    <Card key={entry.id} className={`border-l-4 ${index < 3 ? 'border-l-green-500' : 'border-l-slate-200'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            {/* Rank & Basic Info */}
                            <div className="flex items-center space-x-4">
                                <div className="text-2xl font-bold text-slate-300 w-8 text-center">#{index + 1}</div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="font-semibold text-lg">{entry.targetName}</h3>
                                        {entry.isTst && <Badge variant="destructive" className="animate-pulse">TST</Badge>}
                                        {entry.agingHours > 24 && <Badge variant="outline" className="text-orange-500 border-orange-200">Aging</Badge>}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 flex space-x-4">
                                        <span>ID: {entry.targetId}</span>
                                        <span>Added: {new Date(entry.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Scores */}
                            <div className="flex items-center space-x-8">
                                <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Priority</span>
                                        <span className="font-mono">{(entry.priorityScore * 100).toFixed(0)}%</span>
                                    </div>
                                    <Progress value={entry.priorityScore * 100} className="h-2" />
                                </div>
                                <div className="w-32">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>Feasibility</span>
                                        <span className="font-mono">{(entry.feasibilityScore * 100).toFixed(0)}%</span>
                                    </div>
                                    <Progress value={entry.feasibilityScore * 100} className="h-2 bg-slate-100" />
                                </div>
                                <div className="text-center px-4">
                                    <div className="text-xs text-muted-foreground">Combined</div>
                                    <div className="text-xl font-bold text-blue-600">{(entry.combinedScore * 100).toFixed(0)}</div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                                <div className="flex flex-col space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handlePriorityUpdate(entry.id, entry.priorityScore, 0.1)}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handlePriorityUpdate(entry.id, entry.priorityScore, -0.1)}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button size="sm">
                                    <Target className="w-4 h-4 mr-2" />
                                    Task Asset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {entries.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        No targets currently on the Dynamic Target List.
                    </div>
                )}
            </div>
        </div>
    );
};
