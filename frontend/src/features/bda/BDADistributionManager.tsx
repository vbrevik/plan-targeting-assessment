// BDA Distribution Manager Component
// Purpose: Manage report distribution to stakeholders

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaDistributionList, type BdaReportDistribution, type BdaDistributionSummary } from '@/lib/smartops/api/bda';
import { Send, Users, CheckCircle2, Clock, XCircle, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BDADistributionManagerProps {
    reportId: string;
    reportStatus: string;
}

export const BDADistributionManager: React.FC<BDADistributionManagerProps> = ({ 
    reportId,
    reportStatus 
}) => {
    const [distributionLists, setDistributionLists] = useState<BdaDistributionList[]>([]);
    const [distributions, setDistributions] = useState<BdaReportDistribution[]>([]);
    const [summary, setSummary] = useState<BdaDistributionSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    const [selectedLists, setSelectedLists] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, [reportId]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [lists, dists, summ] = await Promise.all([
                BdaApi.getDistributionLists(),
                BdaApi.getReportDistributions(reportId),
                BdaApi.getReportDistributionSummary(reportId),
            ]);
            setDistributionLists(lists);
            setDistributions(dists);
            setSummary(summ);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load distribution data');
        } finally {
            setLoading(false);
        }
    };

    const handleDistribute = async () => {
        if (selectedLists.length === 0) {
            alert('Please select at least one distribution list');
            return;
        }

        try {
            await BdaApi.distributeReport(reportId, {
                distribution_list_ids: selectedLists,
                report_format: 'html',
                report_template_type: 'final',
                classification_level: 'SECRET',
                delivery_method: 'system',
            });
            setShowDistributeModal(false);
            setSelectedLists([]);
            loadData();
        } catch (err) {
            alert('Failed to distribute report: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'sent': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'delivered': return <CheckCircle2 size={12} className="text-emerald-400" />;
            case 'sent': return <Send size={12} className="text-blue-400" />;
            case 'pending': return <Clock size={12} className="text-yellow-400" />;
            case 'failed': return <XCircle size={12} className="text-red-400" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading distribution data...</div>
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

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Report Distribution
                    </CardTitle>
                    {reportStatus !== 'draft' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDistributeModal(true)}
                            className="h-6 px-2 text-[8px]"
                        >
                            <Send size={10} className="mr-1" />
                            Distribute
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Summary */}
                {summary && summary.total_distributions > 0 && (
                    <div className="p-4 border-b border-slate-800/50 bg-slate-950/40">
                        <div className="grid grid-cols-5 gap-4 text-center">
                            <div>
                                <div className="text-[8px] text-slate-500 mb-1">Total</div>
                                <div className="text-sm font-black text-slate-300">{summary.total_distributions}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-slate-500 mb-1">Delivered</div>
                                <div className="text-sm font-black text-emerald-400">{summary.delivered_count}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-slate-500 mb-1">Sent</div>
                                <div className="text-sm font-black text-blue-400">{summary.sent_count}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-slate-500 mb-1">Pending</div>
                                <div className="text-sm font-black text-yellow-400">{summary.pending_count}</div>
                            </div>
                            <div>
                                <div className="text-[8px] text-slate-500 mb-1">Failed</div>
                                <div className="text-sm font-black text-red-400">{summary.failed_count}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Distribution List */}
                {distributions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No distributions yet
                        {reportStatus !== 'draft' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDistributeModal(true)}
                                className="mt-4 text-[9px]"
                            >
                                <Send size={12} className="mr-1" />
                                Distribute Report
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/50">
                        {distributions.map((dist) => (
                            <div key={dist.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <Users size={12} className="text-slate-500" />
                                            <span className="text-sm font-black text-white">
                                                {dist.recipient_name}
                                            </span>
                                            {dist.recipient_email && (
                                                <span className="text-[9px] text-slate-500">
                                                    ({dist.recipient_email})
                                                </span>
                                            )}
                                            <Badge className={cn(
                                                "text-[7px] uppercase font-black py-0.5 px-1.5 flex items-center gap-1",
                                                getStatusColor(dist.delivery_status)
                                            )}>
                                                {getStatusIcon(dist.delivery_status)}
                                                {dist.delivery_status}
                                            </Badge>
                                            <Badge className="text-[7px] uppercase font-black py-0.5 px-1.5 bg-slate-800">
                                                {dist.report_format.toUpperCase()}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[8px] text-slate-500 mt-2">
                                            <div>
                                                <span className="block text-slate-600 mb-0.5">Method</span>
                                                <span className="text-slate-400">{dist.delivery_method}</span>
                                            </div>
                                            {dist.sent_at && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Sent</span>
                                                    <span className="text-slate-400">
                                                        {new Date(dist.sent_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {dist.delivered_at && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Delivered</span>
                                                    <span className="text-slate-400">
                                                        {new Date(dist.delivered_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {dist.delivery_attempts > 0 && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Attempts</span>
                                                    <span className="text-slate-400">{dist.delivery_attempts}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {dist.last_error && (
                                            <div className="mt-2 p-2 bg-red-500/5 rounded border border-red-500/20">
                                                <div className="text-[8px] text-red-400 mb-1 uppercase font-black">
                                                    Error
                                                </div>
                                                <p className="text-[9px] text-slate-400">{dist.last_error}</p>
                                            </div>
                                        )}
                                        
                                        {dist.delivery_confirmation_received && (
                                            <div className="mt-2 flex items-center gap-1 text-[8px] text-emerald-400">
                                                <CheckCircle2 size={10} />
                                                <span>Delivery confirmed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Distribute Modal */}
                {showDistributeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="bg-slate-900 border-slate-800 w-full max-w-md m-4">
                            <CardHeader className="border-b border-slate-800/50 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Distribute Report
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDistributeModal(false)}
                                        className="h-6 w-6 p-0"
                                    >
                                        <XCircle size={12} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                                        Select Distribution Lists
                                    </label>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {distributionLists.map((list) => (
                                            <label key={list.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-800/50 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedLists.includes(list.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedLists([...selectedLists, list.id]);
                                                        } else {
                                                            setSelectedLists(selectedLists.filter(id => id !== list.id));
                                                        }
                                                    }}
                                                    className="w-3 h-3 rounded border-slate-700 bg-slate-900 text-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-[9px] font-black text-white">{list.name}</span>
                                                    {list.description && (
                                                        <p className="text-[8px] text-slate-500">{list.description}</p>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {distributionLists.length === 0 && (
                                        <p className="text-[9px] text-slate-500">No distribution lists available</p>
                                    )}
                                </div>
                                
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        onClick={handleDistribute}
                                        disabled={selectedLists.length === 0}
                                        className="flex-1 text-[9px] font-black uppercase py-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Send size={12} className="mr-2" />
                                        Distribute
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDistributeModal(false)}
                                        className="text-[9px] font-black uppercase py-2"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
