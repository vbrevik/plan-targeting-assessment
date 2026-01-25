// BDA Version Comparison Component
// Purpose: Compare two versions of a BDA report side-by-side

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaReportHistory, type ReportHistoryResponse } from '@/lib/smartops/api/bda';
import { GitCompare, ArrowLeft, ArrowRight, X, Eye, FileDiff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface BDAVersionComparisonProps {
    reportId: string;
    onClose?: () => void;
}

interface ComparisonField {
    field: string;
    label: string;
    oldValue: any;
    newValue: any;
    changed: boolean;
}

export const BDAVersionComparison: React.FC<BDAVersionComparisonProps> = ({ 
    reportId,
    onClose 
}) => {
    const [history, setHistory] = useState<ReportHistoryResponse | null>(null);
    const [version1, setVersion1] = useState<BdaReportHistory | null>(null);
    const [version2, setVersion2] = useState<BdaReportHistory | null>(null);
    const [comparison, setComparison] = useState<ComparisonField[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadHistory();
    }, [reportId]);

    useEffect(() => {
        if (version1 && version2) {
            compareVersions(version1, version2);
        }
    }, [version1, version2]);

    const loadHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await BdaApi.getReportHistory(reportId);
            setHistory(data);
            
            // Auto-select latest and previous version if available
            if (data.history.length >= 2) {
                setVersion1(data.history[data.history.length - 2]);
                setVersion2(data.history[data.history.length - 1]);
            } else if (data.history.length === 1) {
                setVersion1(data.history[0]);
                setVersion2(data.history[0]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const compareVersions = async (v1: BdaReportHistory, v2: BdaReportHistory) => {
        try {
            const [data1, data2] = await Promise.all([
                BdaApi.getReportVersion(reportId, v1.version_number),
                BdaApi.getReportVersion(reportId, v2.version_number),
            ]);

            const report1 = JSON.parse(data1.report_data_json);
            const report2 = JSON.parse(data2.report_data_json);

            const fields: ComparisonField[] = [
                {
                    field: 'physical_damage',
                    label: 'Physical Damage',
                    oldValue: report1.physical_damage,
                    newValue: report2.physical_damage,
                    changed: report1.physical_damage !== report2.physical_damage,
                },
                {
                    field: 'physical_damage_percentage',
                    label: 'Damage Percentage',
                    oldValue: report1.physical_damage_percentage,
                    newValue: report2.physical_damage_percentage,
                    changed: report1.physical_damage_percentage !== report2.physical_damage_percentage,
                },
                {
                    field: 'damage_description',
                    label: 'Damage Description',
                    oldValue: report1.damage_description,
                    newValue: report2.damage_description,
                    changed: report1.damage_description !== report2.damage_description,
                },
                {
                    field: 'functional_damage',
                    label: 'Functional Damage',
                    oldValue: report1.functional_damage,
                    newValue: report2.functional_damage,
                    changed: report1.functional_damage !== report2.functional_damage,
                },
                {
                    field: 'estimated_repair_time_hours',
                    label: 'Repair Time (hours)',
                    oldValue: report1.estimated_repair_time_hours,
                    newValue: report2.estimated_repair_time_hours,
                    changed: report1.estimated_repair_time_hours !== report2.estimated_repair_time_hours,
                },
                {
                    field: 'desired_effect',
                    label: 'Desired Effect',
                    oldValue: report1.desired_effect,
                    newValue: report2.desired_effect,
                    changed: report1.desired_effect !== report2.desired_effect,
                },
                {
                    field: 'achieved_effect',
                    label: 'Achieved Effect',
                    oldValue: report1.achieved_effect,
                    newValue: report2.achieved_effect,
                    changed: report1.achieved_effect !== report2.achieved_effect,
                },
                {
                    field: 'confidence_level',
                    label: 'Confidence Level',
                    oldValue: report1.confidence_level ? `${Math.round(report1.confidence_level * 100)}%` : null,
                    newValue: report2.confidence_level ? `${Math.round(report2.confidence_level * 100)}%` : null,
                    changed: report1.confidence_level !== report2.confidence_level,
                },
                {
                    field: 'recommendation',
                    label: 'Recommendation',
                    oldValue: report1.recommendation,
                    newValue: report2.recommendation,
                    changed: report1.recommendation !== report2.recommendation,
                },
                {
                    field: 're_attack_priority',
                    label: 'Re-Attack Priority',
                    oldValue: report1.re_attack_priority,
                    newValue: report2.re_attack_priority,
                    changed: report1.re_attack_priority !== report2.re_attack_priority,
                },
                {
                    field: 'collateral_damage_detected',
                    label: 'Collateral Damage Detected',
                    oldValue: report1.collateral_damage_detected ? 'Yes' : 'No',
                    newValue: report2.collateral_damage_detected ? 'Yes' : 'No',
                    changed: report1.collateral_damage_detected !== report2.collateral_damage_detected,
                },
                {
                    field: 'status',
                    label: 'Status',
                    oldValue: report1.status,
                    newValue: report2.status,
                    changed: report1.status !== report2.status,
                },
            ];

            setComparison(fields);
        } catch (err) {
            console.error('Failed to compare versions:', err);
        }
    };

    const formatValue = (value: any): string => {
        if (value === null || value === undefined) return '—';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading versions...</div>
                </CardContent>
            </Card>
        );
    }

    if (error || !history || history.history.length < 2) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-red-400 text-sm">
                        {error || 'Not enough versions to compare (need at least 2)'}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const changedFields = comparison.filter(f => f.changed).length;
    const totalFields = comparison.length;

    return (
        <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/50 pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GitCompare size={14} className="text-slate-400" />
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Version Comparison
                        </CardTitle>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                        >
                            <X size={12} />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Version Selectors */}
                <div className="p-4 border-b border-slate-800/50 bg-slate-950/40">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Version 1 Selector */}
                        <div>
                            <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                                Version 1 (Old)
                            </label>
                            <select
                                value={version1?.version_number || ''}
                                onChange={(e) => {
                                    const v = history.history.find(h => h.version_number === parseInt(e.target.value));
                                    if (v) setVersion1(v);
                                }}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[9px] px-2 py-1 rounded"
                            >
                                {history.history.map((h) => (
                                    <option key={h.version_number} value={h.version_number}>
                                        v{h.version_number} - {h.change_type} ({format(new Date(h.changed_at), 'MMM d, HH:mm')})
                                    </option>
                                ))}
                            </select>
                            {version1 && (
                                <div className="mt-1 text-[8px] text-slate-500">
                                    {format(new Date(version1.changed_at), 'MMM d, yyyy HH:mm')} by {version1.changed_by}
                                </div>
                            )}
                        </div>

                        {/* Version 2 Selector */}
                        <div>
                            <label className="text-[8px] text-slate-500 uppercase font-black block mb-2">
                                Version 2 (New)
                            </label>
                            <select
                                value={version2?.version_number || ''}
                                onChange={(e) => {
                                    const v = history.history.find(h => h.version_number === parseInt(e.target.value));
                                    if (v) setVersion2(v);
                                }}
                                className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-[9px] px-2 py-1 rounded"
                            >
                                {history.history.map((h) => (
                                    <option key={h.version_number} value={h.version_number}>
                                        v{h.version_number} - {h.change_type} ({format(new Date(h.changed_at), 'MMM d, HH:mm')})
                                    </option>
                                ))}
                            </select>
                            {version2 && (
                                <div className="mt-1 text-[8px] text-slate-500">
                                    {format(new Date(version2.changed_at), 'MMM d, yyyy HH:mm')} by {version2.changed_by}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {comparison.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-800/50">
                            <div className="flex items-center gap-4 text-[9px] text-slate-500">
                                <span>
                                    <span className="font-black text-slate-400">{changedFields}</span> of <span className="font-black text-slate-400">{totalFields}</span> fields changed
                                </span>
                                {changedFields > 0 && (
                                    <Badge className="text-[7px] uppercase font-black py-0.5 px-1.5 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                                        {Math.round((changedFields / totalFields) * 100)}% modified
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Comparison Table */}
                {comparison.length > 0 ? (
                    <div className="divide-y divide-slate-800/50">
                        {comparison.map((field, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-4 grid grid-cols-3 gap-4 hover:bg-slate-800/20 transition-colors",
                                    field.changed && "bg-yellow-500/5 border-l-2 border-yellow-500/30"
                                )}
                            >
                                <div className="text-[9px] font-black text-slate-400 uppercase">
                                    {field.label}
                                </div>
                                <div className={cn(
                                    "text-[9px] text-slate-300 font-mono",
                                    field.changed && "line-through text-slate-600"
                                )}>
                                    {formatValue(field.oldValue)}
                                </div>
                                <div className={cn(
                                    "text-[9px] text-slate-300 font-mono",
                                    field.changed && "text-yellow-400 font-bold"
                                )}>
                                    {formatValue(field.newValue)}
                                    {field.changed && (
                                        <ArrowRight size={10} className="inline ml-1 text-yellow-400" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        Select two versions to compare
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
