import { createFileRoute, useParams } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { BdaApi, type BdaReport, type BdaImagery } from '@/lib/smartops/api/bda';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle2, X, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BDAImageAnnotator } from '@/features/smartops/components/BDAImageAnnotator';
import { BDAImageComparisonViewer } from '@/features/smartops/components/BDAImageComparisonViewer';
import { BDAReportHistory } from '@/features/smartops/components/BDAReportHistory';
import { BDAComponentAssessment } from '@/features/smartops/components/BDAComponentAssessment';
import { BDAPeerReview } from '@/features/smartops/components/BDAPeerReview';
import { BDAVersionComparison } from '@/features/smartops/components/BDAVersionComparison';
import { BDAReportGenerator } from '@/features/smartops/components/BDAReportGenerator';
import { BDADistributionManager } from '@/features/smartops/components/BDADistributionManager';

export const Route = createFileRoute('/smartops/bda/$reportId')({
    component: BDADetailPage
});

function BDADetailPage() {
    const { reportId } = useParams({ from: '/smartops/bda/$reportId' });
    const [report, setReport] = useState<BdaReport | null>(null);
    const [imagery, setImagery] = useState<BdaImagery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [r, img] = await Promise.all([
                    BdaApi.getReport(reportId),
                    BdaApi.getReportImagery(reportId)
                ]);
                setReport(r);
                setImagery(img);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load BDA report');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [reportId]);

    if (loading) {
        return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase tracking-widest">Loading BDA Report...</div>;
    }

    if (error || !report) {
        return (
            <div className="p-8 text-red-500 font-mono text-xs">
                {error || 'BDA report not found'}
            </div>
        );
    }

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
        're_attack': 'Re-attack',
        're_weaponeer': 'Re-weaponeer'
    };

    const preStrikeImagery = imagery.filter(img => img.is_pre_strike_baseline);
    const postStrikeImagery = imagery.filter(img => !img.is_pre_strike_baseline);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">BDA Report</h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Target: {report.target_id} | Assessment Date: {new Date(report.assessment_date).toLocaleString()}
                    </p>
                </div>
                <Badge className={cn(
                    "text-[8px] uppercase font-black py-1 px-2",
                    report.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    report.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    report.status === 'submitted' || report.status === 'reviewed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-slate-800 text-slate-400"
                )}>
                    {report.status.toUpperCase()}
                </Badge>
            </div>

            {/* Imagery Comparison */}
            {(preStrikeImagery.length > 0 || postStrikeImagery.length > 0) && (
                <div className="space-y-4">
                    {/* Enhanced Comparison Viewer with Zoom/Pan */}
                    <BDAImageComparisonViewer
                        preStrikeImagery={preStrikeImagery[0]}
                        postStrikeImagery={postStrikeImagery[0]}
                        syncZoom={true}
                        syncPan={true}
                    />

                    {/* Image Annotator for Post-Strike Imagery */}
                    {postStrikeImagery.length > 0 && (
                        <BDAImageAnnotator 
                            imagery={postStrikeImagery[0]} 
                            readOnly={report.status === 'approved'}
                            onSave={(annotations) => {
                                console.log('Annotations saved:', annotations);
                            }}
                        />
                    )}
                </div>
            )}

            {/* Assessment Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800">
                    <CardHeader className="border-b border-slate-800/50 pb-3">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Damage Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {/* Physical Damage */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Physical Damage</span>
                                <span className="text-[10px] font-mono text-white">
                                    {physicalDamageNames[report.physical_damage] || report.physical_damage}
                                    {report.physical_damage_percentage && ` (${report.physical_damage_percentage}%)`}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        report.physical_damage === 'D' ? "bg-red-500" :
                                        report.physical_damage === 'SVD' ? "bg-orange-500" :
                                        report.physical_damage === 'MD' ? "bg-yellow-500" :
                                        report.physical_damage === 'SD' ? "bg-blue-500" :
                                        "bg-slate-700"
                                    )}
                                    style={{
                                        width: report.physical_damage_percentage ? `${report.physical_damage_percentage}%` :
                                            report.physical_damage === 'D' ? '100%' :
                                            report.physical_damage === 'SVD' ? '75%' :
                                            report.physical_damage === 'MD' ? '40%' :
                                            report.physical_damage === 'SD' ? '15%' : '0%'
                                    }}
                                />
                            </div>
                            {report.damage_description && (
                                <p className="text-[10px] text-slate-400 font-mono italic mt-2">{report.damage_description}</p>
                            )}
                        </div>

                        {/* Functional Damage */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[9px] font-black text-slate-500 uppercase">Functional Status</span>
                                <span className="text-[10px] font-mono text-white">
                                    {functionalDamageNames[report.functional_damage] || report.functional_damage}
                                </span>
                            </div>
                            <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500",
                                        report.functional_damage === 'NMC' ? "bg-red-500" : "bg-orange-500"
                                    )}
                                    style={{
                                        width: report.functional_damage === 'NMC' ? '100%' :
                                            report.functional_damage === 'PMC' ? '60%' : '0%'
                                    }}
                                />
                            </div>
                            {report.estimated_repair_time_hours && (
                                <p className="text-[10px] text-slate-400 font-mono italic mt-2">
                                    Estimated repair time: {report.estimated_repair_time_hours} hours
                                </p>
                            )}
                        </div>

                        {/* Effects Assessment */}
                        <div className="pt-4 border-t border-slate-800/50 space-y-2">
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Desired Effect</span>
                                <p className="text-[10px] text-slate-300 font-mono">{report.desired_effect}</p>
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Achieved Effect</span>
                                <p className="text-[10px] text-slate-300 font-mono">{report.achieved_effect}</p>
                            </div>
                            {report.effect_level && (
                                <Badge variant="outline" className="border-blue-500/20 text-blue-400 text-[8px]">
                                    {report.effect_level.replace('_', ' ').toUpperCase()}
                                </Badge>
                            )}
                        </div>

                        {/* Recommendation */}
                        <div className="pt-4 border-t border-slate-800/50">
                            <span className="text-[9px] font-black text-slate-500 uppercase block mb-2">Recommendation</span>
                            <div className={cn(
                                "p-3 rounded border flex items-center gap-3 transition-colors duration-500",
                                report.recommendation === 'effect_achieved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                    report.recommendation === 're_attack' || report.recommendation === 're_weaponeer' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                                        "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            )}>
                                {report.recommendation === 'effect_achieved' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {recommendationNames[report.recommendation] || report.recommendation}
                                </span>
                            </div>
                            {report.re_attack_rationale && (
                                <p className="text-[10px] text-slate-400 font-mono italic mt-2">{report.re_attack_rationale}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-4 space-y-4">
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Confidence Level</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${report.confidence_level * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono text-white">
                                        {(report.confidence_level * 100).toFixed(0)}%
                                    </span>
                                </div>
                            </div>

                            {report.limiting_factors && (
                                <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Limiting Factors</span>
                                    <p className="text-[10px] text-slate-400 font-mono italic">{report.limiting_factors}</p>
                                </div>
                            )}

                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Assessment Type</span>
                                <Badge variant="outline" className="border-slate-800 text-slate-400 text-[8px] uppercase">
                                    {report.assessment_type}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert size={14} className="text-slate-500" />
                                <span className="text-[9px] font-black text-slate-500 uppercase">Collateral Assessment</span>
                            </div>
                            <p className="text-[10px] text-slate-300 font-mono italic">
                                {report.collateral_damage_detected 
                                    ? "COLLATERAL DAMAGE DETECTED. IMMEDIATE REVIEW REQUIRED." 
                                    : "No collateral damage detected within 200m radius of impact site."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    {report.status === 'draft' && (
                        <div className="space-y-2">
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase h-9"
                                onClick={async () => {
                                    try {
                                        await BdaApi.submitReport(report.id);
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Failed to submit report:', err);
                                    }
                                }}
                            >
                                Submit for Review
                            </Button>
                        </div>
                    )}

                    {report.status === 'submitted' || report.status === 'reviewed' ? (
                        <div className="space-y-2">
                            <Button
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase h-9"
                                onClick={async () => {
                                    try {
                                        await BdaApi.approveReport(report.id);
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Failed to approve report:', err);
                                    }
                                }}
                            >
                                Approve
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase h-9"
                                onClick={async () => {
                                    const comments = prompt('Rejection comments:');
                                    if (comments) {
                                        try {
                                            await BdaApi.rejectReport(report.id, comments);
                                            window.location.reload();
                                        } catch (err) {
                                            console.error('Failed to reject report:', err);
                                        }
                                    }
                                }}
                            >
                                Reject
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Notes */}
            {report.notes && (
                <Card className="bg-slate-900/40 border-slate-800">
                    <CardHeader className="border-b border-slate-800/50 pb-3">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Analyst Notes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <p className="text-[10px] text-slate-300 font-mono whitespace-pre-wrap">{report.notes}</p>
                    </CardContent>
                </Card>
            )}

            {/* Component-Level Assessment */}
            <BDAComponentAssessment 
                reportId={reportId}
                readOnly={report.status === 'approved'}
            />

            {/* Peer Review Quality Control */}
            <BDAPeerReview 
                reportId={reportId}
                readOnly={report.status === 'approved'}
            />

            {/* Report Generation */}
            <BDAReportGenerator 
                reportId={reportId}
                reportStatus={report.status}
            />

            {/* Distribution Management */}
            <BDADistributionManager 
                reportId={reportId}
                reportStatus={report.status}
            />

            {/* Version Comparison */}
            <BDAVersionComparison 
                reportId={reportId}
            />

            {/* Assessment History */}
            <BDAReportHistory 
                reportId={reportId}
                onVersionSelect={(version) => {
                    console.log('Version selected:', version);
                    // TODO: Show version comparison or details
                }}
            />
        </div>
    );
}
