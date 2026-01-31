// BDA Component Assessment Component
// Purpose: Display and manage component-level damage assessments

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BdaApi, type BdaComponentAssessment } from '@/lib/mshnctrl/api/bda';
import { Plus, Trash2, Edit2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BDAComponentAssessmentProps {
    reportId: string;
    readOnly?: boolean;
}

export const BDAComponentAssessment: React.FC<BDAComponentAssessmentProps> = ({ 
    reportId,
    readOnly = false 
}) => {
    const [components, setComponents] = useState<BdaComponentAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadComponents();
    }, [reportId]);

    const loadComponents = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await BdaApi.getReportComponents(reportId);
            setComponents(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load components');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this component assessment?')) return;
        
        try {
            await BdaApi.deleteComponentAssessment(id);
            loadComponents();
        } catch (err) {
            alert('Failed to delete component');
        }
    };

    const getDamageColor = (damage: string) => {
        switch (damage) {
            case 'D': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'SVD': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'MD': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'SD': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getCriticalityColor = (criticality?: string) => {
        switch (criticality) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'important': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'supporting': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-800 text-slate-400';
        }
    };

    const getFunctionalStatusIcon = (status: string) => {
        switch (status) {
            case 'FMC': return <CheckCircle2 size={14} className="text-emerald-400" />;
            case 'PMC': return <AlertTriangle size={14} className="text-yellow-400" />;
            case 'NMC': return <XCircle size={14} className="text-red-400" />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <Card className="bg-slate-900/40 border-slate-800">
                <CardContent className="p-6">
                    <div className="text-slate-500 text-sm animate-pulse">Loading components...</div>
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
                        Component-Level Assessment
                    </CardTitle>
                    {!readOnly && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsAdding(true)}
                            className="h-6 px-2 text-[8px]"
                        >
                            <Plus size={10} className="mr-1" />
                            Add Component
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {components.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No component assessments yet
                        {!readOnly && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAdding(true)}
                                className="mt-4 text-[9px]"
                            >
                                <Plus size={12} className="mr-1" />
                                Add First Component
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-800/50">
                        {components.map((component) => (
                            <div key={component.id} className="p-4 hover:bg-slate-800/20 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-black text-white uppercase">
                                                {component.component_name}
                                            </h4>
                                            {component.component_location && (
                                                <span className="text-[9px] text-slate-500">
                                                    ({component.component_location})
                                                </span>
                                            )}
                                            <Badge className={cn(
                                                "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                getDamageColor(component.physical_damage)
                                            )}>
                                                {component.physical_damage}
                                                {component.physical_damage_percentage && ` (${component.physical_damage_percentage}%)`}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                {getFunctionalStatusIcon(component.functional_damage)}
                                                <span className="text-[9px] text-slate-400">
                                                    {component.functional_damage}
                                                </span>
                                            </div>
                                            {component.component_criticality && (
                                                <Badge className={cn(
                                                    "text-[7px] uppercase font-black py-0.5 px-1.5",
                                                    getCriticalityColor(component.component_criticality)
                                                )}>
                                                    {component.component_criticality}
                                                </Badge>
                                            )}
                                            {component.replacement_required && (
                                                <Badge className="text-[7px] uppercase font-black py-0.5 px-1.5 bg-orange-500/10 text-orange-400 border-orange-500/20">
                                                    Replacement Required
                                                </Badge>
                                            )}
                                        </div>
                                        
                                        {component.damage_description && (
                                            <p className="text-[9px] text-slate-400">
                                                {component.damage_description}
                                            </p>
                                        )}
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[8px] text-slate-500">
                                            {component.estimated_repair_time_hours && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Repair Time</span>
                                                    <span className="text-slate-400">{component.estimated_repair_time_hours}h</span>
                                                </div>
                                            )}
                                            {component.repair_cost_estimate_usd && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Repair Cost</span>
                                                    <span className="text-slate-400">${component.repair_cost_estimate_usd.toLocaleString()}</span>
                                                </div>
                                            )}
                                            {component.replacement_availability_days && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Replacement</span>
                                                    <span className="text-slate-400">{component.replacement_availability_days} days</span>
                                                </div>
                                            )}
                                            {component.confidence_level !== undefined && (
                                                <div>
                                                    <span className="block text-slate-600 mb-0.5">Confidence</span>
                                                    <span className="text-slate-400">{Math.round(component.confidence_level * 100)}%</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {component.pre_strike_function && component.post_strike_function && (
                                            <div className="mt-2 p-2 bg-slate-950/40 rounded border border-slate-800/50">
                                                <div className="text-[8px] text-slate-600 mb-1">Function Change</div>
                                                <div className="text-[9px] text-slate-400">
                                                    <span className="line-through text-slate-600">{component.pre_strike_function}</span>
                                                    {' → '}
                                                    <span>{component.post_strike_function}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!readOnly && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    // TODO: Open edit dialog
                                                }}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Edit2 size={10} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(component.id)}
                                                className="h-6 w-6 p-0 text-red-400"
                                            >
                                                <Trash2 size={10} />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
