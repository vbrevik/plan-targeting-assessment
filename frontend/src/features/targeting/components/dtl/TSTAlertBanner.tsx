import React, { useState, useEffect } from 'react';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import type { DtlEntry } from '@/lib/mshnctrl/api/targeting';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Siren, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export const TSTAlertBanner: React.FC = () => {
    const [tsts, setTsts] = useState<DtlEntry[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkTSTs = async () => {
            try {
                const activeTsts = await targetingApi.getActiveTsts();
                setTsts(activeTsts);
            } catch (error) {
                console.error("Failed to check TSTs", error);
            }
        };

        // Initial check
        checkTSTs();

        // Poll every 30 seconds
        const interval = setInterval(checkTSTs, 30000);
        return () => clearInterval(interval);
    }, []);

    if (tsts.length === 0) return null;

    // Sort by deadline (earliest first)
    const sortedTsts = [...tsts].sort((a, b) => {
        if (!a.tst_deadline) return 1;
        if (!b.tst_deadline) return -1;
        return new Date(a.tst_deadline).getTime() - new Date(b.tst_deadline).getTime();
    });

    const getRemainingTime = (deadline?: string) => {
        if (!deadline) return 'ASAP';
        const now = new Date().getTime();
        const due = new Date(deadline).getTime();
        const diff = due - now;

        if (diff <= 0) return 'OVERDUE';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-4 border-red-500/50 bg-red-950/30 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <Siren className="h-5 w-5 text-red-500 animate-pulse" />
            <AlertTitle className="ml-2 flex items-center justify-between">
                <span className="font-bold tracking-wide flex items-center gap-2">
                    <span className="text-red-500">CRITICAL:</span>
                    TIME SENSITIVE TARGETS ACTIVE ({tsts.length})
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-red-300 hover:text-white hover:bg-red-900/50"
                    onClick={() => navigate({ to: '/mshnctrl/targeting/dtl' })}
                >
                    View Status Board <ArrowRight className="ml-1 w-3 h-3" />
                </Button>
            </AlertTitle>
            <AlertDescription className="ml-2 mt-3 grid gap-2">
                {sortedTsts.slice(0, 2).map((tst) => (
                    <div key={tst.id} className="flex items-center justify-between text-sm bg-red-950/40 p-2 rounded border border-red-900/50">
                        <div className="flex items-center font-medium">
                            <Clock className="w-3.5 h-3.5 mr-2 text-red-400" />
                            <span className="text-white mr-2">{tst.target_name}</span>
                            <span className="text-xs font-mono text-red-400 ml-1">ID: {tst.target_id.substring(0, 8)}...</span>
                        </div>
                        <div className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${getRemainingTime(tst.tst_deadline) === 'OVERDUE' ? 'bg-red-600 text-white' : 'bg-red-900/50 text-red-300'
                            }`}>
                            T-MINUS: {getRemainingTime(tst.tst_deadline)}
                        </div>
                    </div>
                ))}
                {tsts.length > 2 && <div className="text-xs text-red-400 text-center font-bold mt-1">+{tsts.length - 2} ADDITIONAL TARGETS PENDING</div>}
            </AlertDescription>
        </Alert>
    );
};
