import React, { useState, useEffect } from 'react';
import { targetingApi } from '@/lib/targeting';
import type { DtlEntry } from '@/lib/mshnctrl/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Siren, Clock } from 'lucide-react';
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

    return (
        <Alert variant="destructive" className="mb-4 animate-pulse border-red-600 bg-red-950/10">
            <Siren className="h-5 w-5" />
            <AlertTitle className="ml-2 flex items-center justify-between">
                <span>TIME SENSITIVE TARGETS ACTIVE ({tsts.length})</span>
                <Button
                    variant="destructive"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => navigate({ to: '/smartops/targeting/dtl' })}
                >
                    View Board
                </Button>
            </AlertTitle>
            <AlertDescription className="ml-2 mt-2">
                {tsts.slice(0, 2).map((tst, idx) => (
                    <div key={tst.id} className="flex items-center text-sm font-medium">
                        <Clock className="w-3 h-3 mr-2" />
                        Target {tst.targetId.substring(0, 8)}... -
                        Deadline: {tst.tstDeadline ? new Date(tst.tstDeadline).toLocaleTimeString() : 'ASAP'}
                    </div>
                ))}
                {tsts.length > 2 && <div className="text-xs mt-1">and {tsts.length - 2} more...</div>}
            </AlertDescription>
        </Alert>
    );
};
