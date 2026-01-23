// BDA Report History Component
// Purpose: Display assessment history and version timeline

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaReportHistory, type ReportHistoryResponse } from '@/lib/smartops/api/bda';
import { Clock, User, GitBranch, Eye, FileDiff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BDAReportHistoryProps {
    reportId: string;
    onVersionSelect?: (version: BdaReportHistory) => void;
}

export const BDAReportHistory: React.FC<BDAReportHistoryProps> = ({ 
    reportId,
    onVersionSelect 
}) => {
    const [history, setHistory] = useState<ReportHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await BdaApi.getReportHistory(reportId);
                setHistory(data);
                if (data.history.length > 0) {
                    setSelectedVersion(data.latest_version);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [reportId]);

    const getChangeTypeColor = (changeType: string) => {
        switch (changeType) {
            case 'created': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'updated': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            case 'submitted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'reviewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'submitted': case 'reviewed': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading history...</div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-red-400 text-sm">{error}</div>
                </CardContent>
            </Card>
        );
    }

    if (!history || history.history.length === 0) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm">No history available</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Assessment History
                    </CardTitle>
                    <Badge className="text-[8px] uppercase font-black py-1 px-2 bg-slate-800 text-slate-400">
                        {history.total} versions
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-800/50">
                    {history.history.map((entry, index) => {
                        const isSelected = selectedVersion === entry.version_number;
                        const isLatest = entry.version_number === history.latest_version;
                        
                        return (
                            <div
                                key={entry.id}
                                className={cn(
                                    "p-4 hover:bg-slate-800/20 transition-colors cursor-pointer",
                                    isSelected && "bg-blue-500/5 border-l-2 border-blue-500"
                                )}
                                onClick={() => {
                                    setSelectedVersion(entry.version_number);
                                    onVersionSelect?.(entry);
                                }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <GitBranch size={14} className="text-slate-500" />
                                            <span className="text-xs font-mono text-slate-400">
                                                v{entry.version_number}
                                            </span>
                                            {isLatest && (
                                                <Badge className="text-[7px] uppercase font-black py-0.5 px-1.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    Latest
                                                </Badge>
                                            )}
                                            <Badge className={cn(
                                                "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                getChangeTypeColor(entry.change_type)
                                            )}>
                                                {entry.change_type}
                                            </Badge>
                                            <Badge className={cn(
                                                "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                getStatusColor(entry.status)
                                            )}>
                                                {entry.status}
                                            </Badge>
                                        </div>
                                        
                                        {entry.change_description && (
                                            <p className="text-[9px] text-slate-400">
                                                {entry.change_description}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center gap-4 text-[8px] text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <User size={10} />
                                                <span>{entry.changed_by}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={10} />
                                                <span>
                                                    {format(new Date(entry.changed_at), 'MMM d, yyyy HH:mm')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {isSelected && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // TODO: Show version details
                                                }}
                                                className="h-6 px-2 text-[8px]"
                                            >
                                                <Eye size={10} className="mr-1" />
                                                View
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
