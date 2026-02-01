import { useState, useEffect } from 'react';
import { BdaApi, type BdaReport, type BdaStatistics } from '@/lib/mshnctrl/api/bda';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOperationalContext } from '@/lib/mshnctrl/hooks/useOperationalContext';
import { cn } from '@/lib/utils';
import {
    Camera,
    CheckCircle2,
    Clock,
    ChevronRight,
    Search,
    History,
    Plus
} from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { BDAWeaponPerformance } from './BDAWeaponPerformance';
import { BDAIntelligencePanel } from './BDAIntelligencePanel';

export function BDAManagementView() {
    useOperationalContext();
    const [bdaReports, setBdaReports] = useState<BdaReport[]>([]);
    const [statistics, setStatistics] = useState<BdaStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Assess' | 'Re-strike'>('All');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [queue, stats] = await Promise.all([
                    BdaApi.getQueue(),
                    BdaApi.getStatistics()
                ]);
                setBdaReports(queue);
                setStatistics(stats);
            } catch (error) {
                console.error('Failed to load BDA data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);


    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase tracking-widest">Loading Assessment Queue...</div>;


    // Filter reports based on status
    const filteredReports = bdaReports.filter((r: BdaReport) => {
        if (filter === 'All') return true;
        if (filter === 'Assess') return r.status === 'draft' || r.status === 'submitted';
        if (filter === 'Re-strike') return r.recommendation === 're_attack' || r.recommendation === 're_weaponeer';
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-200 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[10px] font-black border border-blue-500/20 rounded uppercase">Assessment Cell</div>
                            <h1 className="text-xl font-black text-white tracking-tight uppercase">BDA Management Workbench</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                            Monitor and validate strike effects. Coordinate with ISR for post-strike imagery and intelligence updates.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="bg-slate-900/20 border-slate-800 p-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Queue Total</span>
                        <span className="text-2xl font-black text-white">{statistics?.total_reports || bdaReports.length}</span>
                    </Card>
                    <Card className="bg-slate-900/20 border-slate-800 p-4">
                        <span className="text-[10px] font-bold text-amber-500 uppercase block mb-1">Draft</span>
                        <span className="text-2xl font-black text-amber-500">{statistics?.by_status.draft || bdaReports.filter(r => r.status === 'draft').length}</span>
                    </Card>
                    <Card className="bg-slate-900/20 border-slate-800 p-4">
                        <span className="text-[10px] font-bold text-blue-400 uppercase block mb-1">Under Assessment</span>
                        <span className="text-2xl font-black text-blue-400">{statistics?.by_status.submitted || bdaReports.filter(r => r.status === 'submitted' || r.status === 'reviewed').length}</span>
                    </Card>
                    <Card className="bg-slate-900/20 border-slate-800 p-4">
                        <span className="text-[10px] font-bold text-red-500 uppercase block mb-1">Re-strike Pending</span>
                        <span className="text-2xl font-black text-red-500">{statistics?.by_recommendation.re_attack || bdaReports.filter(r => r.recommendation === 're_attack' || r.recommendation === 're_weaponeer').length}</span>
                    </Card>
                </div>
            </div>

            {/* Toolbar */}
            <div className="h-12 px-6 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="SEARCH ASSESSMENTS..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-9 py-1.5 text-[10px] font-bold text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                        />
                    </div>
                    <div className="flex bg-slate-950 border border-slate-800 rounded p-0.5">
                        {(['All', 'Assess', 'Re-strike'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-3 py-1 text-[9px] font-black uppercase transition-all rounded",
                                    filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-white gap-2 uppercase font-black text-[10px]"
                    onClick={() => navigate({ to: '/mshnctrl/bda/create' })}
                >
                    <Plus size={14} /> New Assessment
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white gap-2 uppercase font-black text-[10px]">
                    <History size={14} /> View Archived
                </Button>
            </div>

            {/* Content area with queue and weapon performance */}
            <div className="flex-1 overflow-y-auto flex">
                {/* Main Queue Column */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                    {filteredReports.length > 0 ? (
                        filteredReports.map((report: BdaReport) => {
                            // Map backend status to display status
                            const displayStatus = report.status === 'draft' ? 'Draft' :
                                report.status === 'submitted' || report.status === 'reviewed' ? 'Assess' :
                                    report.recommendation === 're_attack' || report.recommendation === 're_weaponeer' ? 'Re-strike' :
                                        'Approved';

                            // Map physical damage codes to display names
                            const physicalDamageNames: Record<string, string> = {
                                'ND': 'No Damage',
                                'SD': 'Slight Damage',
                                'MD': 'Moderate Damage',
                                'SVD': 'Severe Damage',
                                'D': 'Destroyed'
                            };

                            return (
                                <Card
                                    key={report.id}
                                    className="bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer"
                                    onClick={() => navigate({ to: `/mshnctrl/bda/${report.id}` })}
                                >
                                    <CardContent className="p-4 flex gap-6 items-center">
                                        <div className="w-12 h-12 bg-slate-800 rounded flex items-center justify-center border border-slate-700 relative overflow-hidden shrink-0">
                                            <Camera size={20} className="text-slate-500" />
                                            <div className="absolute inset-0 bg-blue-500/10" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-mono font-black text-red-500 bg-red-500/5 px-1.5 py-0.5 rounded border border-red-500/10">
                                                    {report.target_id.substring(0, 8)}
                                                </span>
                                                <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                                                    Target {report.target_id.substring(0, 8)}
                                                </h3>
                                                <Badge className={cn(
                                                    "text-[8px] uppercase font-black py-0",
                                                    displayStatus === 'Re-strike' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        displayStatus === 'Assess' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                                            "bg-slate-800 text-slate-400"
                                                )}>
                                                    {displayStatus}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase truncate">
                                                <span>{report.assessment_type}</span>
                                                <span className="h-3 w-px bg-slate-800" />
                                                <span className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(report.assessment_date).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2 shrink-0">
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-slate-300 uppercase">
                                                    {physicalDamageNames[report.physical_damage] || report.physical_damage}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-500">
                                                    CONF: {(report.confidence_level * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <CheckCircle2 size={48} className="text-slate-800 mb-4" />
                            <p className="text-[10px] uppercase font-black text-slate-600 tracking-[0.3em]">Assessment Queue Clear</p>
                            <p className="text-[9px] text-slate-700 mt-2 font-mono italic">All strikes accounted for or awaiting imagery.</p>
                        </div>
                    )}
                </div>

                {/* Sidebars Column */}
                <div className="w-80 border-l border-slate-800 p-4 space-y-6 overflow-y-auto bg-slate-950/30 shrink-0">
                    <BDAIntelligencePanel targetId={filteredReports[0]?.target_id} />
                    <BDAWeaponPerformance />
                </div>
            </div>
        </div>
    );
}
