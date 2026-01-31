import { useEffect, useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    Eye,
    XCircle,
    Shield,
    Plus,
    Edit,
    Trash2,
    ArrowRight,
    BarChart3,
    Link as LinkIcon,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { assumptionsApi, type Assumption, type CreateAssumptionRequest, type UpdateAssumptionRequest } from '@/lib/assumptions';
import { Link } from '@tanstack/react-router';

const CATEGORIES = ['Enemy', 'Friendly', 'Environmental', 'Political', 'Logistical', 'Intelligence', 'Temporal', 'Technical'];
const STATUS_OPTIONS = ['Valid', 'Monitoring', 'Challenged', 'Broken'];
const RISK_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export function AssumptionManagement() {
    const [assumptions, setAssumptions] = useState<Assumption[]>([]);
    const [summary, setSummary] = useState({ total: 0, valid: 0, monitoring: 0, challenged: 0, broken: 0, high_risk: 0, critical_risk: 0 });
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingAssumption, setEditingAssumption] = useState<Assumption | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        loadData();
    }, [filterStatus]);

    async function loadData() {
        try {
            const [assumptionsData, summaryData] = await Promise.all([
                assumptionsApi.getAll(filterStatus ? { status: filterStatus } : {}),
                assumptionsApi.getSummary(),
            ]);
            setAssumptions(assumptionsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Failed to load assumptions:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(data: CreateAssumptionRequest) {
        try {
            await assumptionsApi.create(data);
            setShowCreateModal(false);
            loadData();
        } catch (error) {
            console.error('Failed to create assumption:', error);
        }
    }

    async function handleUpdate(id: string, data: UpdateAssumptionRequest) {
        try {
            await assumptionsApi.update(id, data);
            setEditingAssumption(null);
            loadData();
        } catch (error) {
            console.error('Failed to update assumption:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this assumption?')) return;
        try {
            await assumptionsApi.delete(id);
            loadData();
        } catch (error) {
            console.error('Failed to delete assumption:', error);
        }
    }

    // Priority-based filtering
    const criticalAssumptions = assumptions.filter(
        a => (a.status === 'Broken' || a.status === 'Challenged') && (a.risk_level === 'High' || a.risk_level === 'Critical')
    );
    
    const brokenAssumptions = assumptions.filter(a => a.status === 'Broken');
    const challengedAssumptions = assumptions.filter(a => a.status === 'Challenged');
    const validAssumptions = assumptions.filter(a => a.status === 'Valid');
    const monitoringAssumptions = assumptions.filter(a => a.status === 'Monitoring');
    
    // Smart visibility: Only show detailed lists if no critical issues
    const hasCriticalIssues = criticalAssumptions.length > 0;
    const hasAnyIssues = brokenAssumptions.length > 0 || challengedAssumptions.length > 0;

    if (loading) return <div className="p-8 text-slate-500 animate-pulse font-mono text-[10px] uppercase">Loading Planning Assumptions...</div>;

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar - Priority-Based Summary */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        {hasCriticalIssues ? '🚨 Critical Status' : 'Status Overview'}
                    </h3>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Critical Alert Badge */}
                    {hasCriticalIssues && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertCircle className="text-red-500 animate-pulse" size={16} />
                                <span className="text-[11px] font-black text-red-500 uppercase">System Alert</span>
                            </div>
                            <p className="text-[9px] text-slate-300 font-bold uppercase leading-relaxed">
                                {criticalAssumptions.length} critical failure{criticalAssumptions.length > 1 ? 's' : ''} require immediate action
                            </p>
                        </div>
                    )}

                    {/* Priority Status Distribution */}
                    <div className="space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">
                            {hasCriticalIssues ? 'Priority Items' : 'Status Distribution'}
                        </span>
                        <div className="space-y-3">
                            {/* Only show problem statuses when critical issues exist */}
                            {(hasCriticalIssues ? [
                                { label: 'Broken', count: summary.broken, color: 'red', icon: XCircle, priority: true },
                                { label: 'Challenged', count: summary.challenged, color: 'yellow', icon: AlertTriangle, priority: true },
                            ] : [
                                { label: 'Broken', count: summary.broken, color: 'red', icon: XCircle },
                                { label: 'Challenged', count: summary.challenged, color: 'yellow', icon: AlertTriangle },
                                { label: 'Monitoring', count: summary.monitoring, color: 'blue', icon: Eye },
                                { label: 'Valid', count: summary.valid, color: 'emerald', icon: CheckCircle2 },
                            ]).map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => setFilterStatus(filterStatus === item.label ? '' : item.label)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded border transition-all",
                                        filterStatus === item.label
                                            ? `bg-${item.color}-500/20 border-${item.color}-500/40`
                                            : "bg-slate-900/40 border-slate-800 hover:border-slate-700",
                                        item.count === 0 && hasCriticalIssues && "opacity-40"
                                    )}
                                    disabled={item.count === 0}
                                >
                                    <div className="flex items-center gap-2">
                                        <item.icon size={14} className={`text-${item.color}-500`} />
                                        <span className="text-[10px] font-bold text-slate-300 uppercase">{item.label}</span>
                                    </div>
                                    <span className="text-[12px] font-black text-white">{item.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Risk Levels - Only show when issues exist */}
                    {(summary.high_risk > 0 || summary.critical_risk > 0) && (
                        <div className="pt-6 border-t border-slate-800/50 space-y-4">
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Risk Assessment</span>
                            <div className="space-y-2">
                                {summary.critical_risk > 0 && (
                                    <div className="flex justify-between text-[10px] p-2 bg-red-500/10 rounded">
                                        <span className="text-red-400 uppercase font-bold">Critical Risk</span>
                                        <span className="text-red-500 font-black">{summary.critical_risk}</span>
                                    </div>
                                )}
                                {summary.high_risk > 0 && (
                                    <div className="flex justify-between text-[10px] p-2 bg-orange-500/10 rounded">
                                        <span className="text-orange-400 uppercase font-bold">High Risk</span>
                                        <span className="text-orange-500 font-black">{summary.high_risk}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Related System */}
                    <div className="pt-6 border-t border-slate-800/50 space-y-4">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block">Related System</span>
                        <Link
                            to="/mshnctrl/uncertainty"
                            className="flex items-center justify-between p-3 bg-slate-900/40 border border-slate-800 rounded hover:border-blue-500/40 transition-all group"
                        >
                            <div className="flex items-center gap-2">
                                <BarChart3 size={14} className="text-blue-500" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase">Uncertainty Analysis</span>
                            </div>
                            <ArrowRight size={12} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                        </Link>
                    </div>

                    {/* System Health Indicator */}
                    {!hasAnyIssues && (
                        <div className="pt-6 border-t border-slate-800/50">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={20} />
                                <span className="text-[9px] font-black text-emerald-500 uppercase block">All Assumptions Valid</span>
                                <span className="text-[8px] text-slate-400 uppercase block mt-1">No Issues Detected</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm z-10 flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="text-blue-500" size={20} />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Planning Assumptions</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                            Track and validate critical planning assumptions. A broken assumption represents a major risk requiring
                            immediate plan revision and risk acceptance decisions.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded text-right">
                            <span className="text-[8px] font-black text-slate-500 uppercase block">Total Assumptions</span>
                            <span className="text-lg font-black text-white">{summary.total}</span>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded transition-all shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center gap-2"
                        >
                            <Plus size={14} />
                            New Assumption
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* PRIORITY 1: Critical Failures - Always Visible */}
                    {criticalAssumptions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="text-red-500 animate-pulse" size={16} />
                                    <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-500">
                                        🚨 Critical Assumption Failures ({criticalAssumptions.length})
                                    </h2>
                                </div>
                                <span className="text-[9px] font-black text-red-500 uppercase px-3 py-1 bg-red-500/10 border border-red-500/30 rounded">
                                    Immediate Action Required
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {criticalAssumptions.map((assumption) => (
                                    <AssumptionCard
                                        key={assumption.id}
                                        assumption={assumption}
                                        onEdit={setEditingAssumption}
                                        onDelete={handleDelete}
                                        critical
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRIORITY 2: Broken/Challenged Assumptions - Visible when exists */}
                    {!hasCriticalIssues && (brokenAssumptions.length > 0 || challengedAssumptions.length > 0) && (
                        <div className="space-y-4">
                            {brokenAssumptions.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="text-red-500" size={14} />
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            Broken Assumptions ({brokenAssumptions.length})
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {brokenAssumptions.map((assumption) => (
                                            <AssumptionCard
                                                key={assumption.id}
                                                assumption={assumption}
                                                onEdit={setEditingAssumption}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                            {challengedAssumptions.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2 mt-6">
                                        <AlertTriangle className="text-yellow-500" size={14} />
                                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            Challenged Assumptions ({challengedAssumptions.length})
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {challengedAssumptions.map((assumption) => (
                                            <AssumptionCard
                                                key={assumption.id}
                                                assumption={assumption}
                                                onEdit={setEditingAssumption}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Hidden Content Indicator */}
                    {hasCriticalIssues && (brokenAssumptions.length + challengedAssumptions.length - criticalAssumptions.length > 0 || validAssumptions.length > 0 || monitoringAssumptions.length > 0) && (
                        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg text-center">
                            <Eye className="text-slate-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                                {(brokenAssumptions.length + challengedAssumptions.length - criticalAssumptions.length) + validAssumptions.length + monitoringAssumptions.length} additional assumptions hidden
                            </p>
                            <p className="text-[9px] text-slate-500">
                                Resolve critical failures above to view all assumptions
                            </p>
                        </div>
                    )}

                    {/* PRIORITY 3: Monitoring Assumptions - Only visible when no issues */}
                    {!hasAnyIssues && monitoringAssumptions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Eye className="text-blue-500" size={14} />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    Under Monitoring ({monitoringAssumptions.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {monitoringAssumptions.map((assumption) => (
                                    <AssumptionCard
                                        key={assumption.id}
                                        assumption={assumption}
                                        onEdit={setEditingAssumption}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PRIORITY 4: Valid Assumptions - Only visible when no issues */}
                    {!hasAnyIssues && validAssumptions.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" size={14} />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    Valid Assumptions ({validAssumptions.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {validAssumptions.slice(0, 6).map((assumption) => (
                                    <AssumptionCard
                                        key={assumption.id}
                                        assumption={assumption}
                                        onEdit={setEditingAssumption}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                            {validAssumptions.length > 6 && (
                                <div className="text-center">
                                    <button className="text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase">
                                        Show {validAssumptions.length - 6} More Valid Assumptions
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Empty State */}
                    {assumptions.length === 0 && (
                        <div className="p-12 text-center text-slate-600 border border-slate-900 rounded bg-slate-950/50 uppercase text-[10px] font-bold">
                            No assumptions found. Create your first planning assumption.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="h-12 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-4">
                            <span>System: ASSUMPTION-TRACKER v1.0</span>
                            <span>|</span>
                            <span>Live Monitoring: ACTIVE</span>
                        </span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">J5-PLANS // J2-INTEL</span>
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <AssumptionModal
                    onClose={() => setShowCreateModal(false)}
                    onSave={handleCreate}
                />
            )}
            {editingAssumption && (
                <AssumptionModal
                    assumption={editingAssumption}
                    onClose={() => setEditingAssumption(null)}
                    onSave={(data) => handleUpdate(editingAssumption.id, data)}
                />
            )}
        </div>
    );
}

interface AssumptionCardProps {
    assumption: Assumption;
    onEdit: (assumption: Assumption) => void;
    onDelete: (id: string) => void;
    critical?: boolean;
}

function AssumptionCard({ assumption, onEdit, onDelete, critical }: AssumptionCardProps) {
    const statusColors = {
        Valid: 'emerald',
        Monitoring: 'blue',
        Challenged: 'yellow',
        Broken: 'red',
    };

    const riskColors = {
        Low: 'slate',
        Medium: 'yellow',
        High: 'orange',
        Critical: 'red',
    };

    const color = statusColors[assumption.status as keyof typeof statusColors];
    const riskColor = riskColors[assumption.risk_level as keyof typeof riskColors];

    return (
        <div className={cn(
            "p-5 rounded-lg transition-all group border",
            critical
                ? "bg-red-500/5 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                    <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                        `bg-${color}-500/10 text-${color}-500 border-${color}-500/20`
                    )}>
                        {assumption.status}
                    </span>
                    <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                        `bg-${riskColor}-500/10 text-${riskColor}-500 border-${riskColor}-500/20`
                    )}>
                        {assumption.risk_level} Risk
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(assumption)}
                        className="text-slate-600 hover:text-blue-500 transition-colors"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={() => onDelete(assumption.id)}
                        className="text-slate-600 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <p className="text-[13px] font-bold text-white mb-2 tracking-tight leading-snug">{assumption.title}</p>
            {assumption.description && (
                <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">{assumption.description}</p>
            )}

            <div className="flex items-center gap-3 text-[9px] text-slate-500 uppercase font-bold">
                <span className="flex items-center gap-1">
                    <LinkIcon size={10} />
                    {assumption.category}
                </span>
                {assumption.confidence_score && (
                    <>
                        <span>|</span>
                        <span>Confidence: {assumption.confidence_score}%</span>
                    </>
                )}
            </div>

            {assumption.impact_notes && (
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <span className="text-[8px] font-black text-slate-600 uppercase block mb-1">Impact if Broken</span>
                    <p className="text-[10px] text-slate-400">{assumption.impact_notes}</p>
                </div>
            )}
        </div>
    );
}

interface AssumptionModalProps {
    assumption?: Assumption;
    onClose: () => void;
    onSave: (data: CreateAssumptionRequest | UpdateAssumptionRequest) => void;
}

function AssumptionModal({ assumption, onClose, onSave }: AssumptionModalProps) {
    const [formData, setFormData] = useState({
        title: assumption?.title || '',
        description: assumption?.description || '',
        category: assumption?.category || 'Enemy',
        status: assumption?.status || 'Valid',
        risk_level: assumption?.risk_level || 'Low',
        confidence_score: assumption?.confidence_score || 80,
        impact_notes: assumption?.impact_notes || '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-lg font-black text-white uppercase">
                        {assumption ? 'Edit Assumption' : 'Create New Assumption'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Confidence Score</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.confidence_score}
                                onChange={(e) => setFormData({ ...formData, confidence_score: parseInt(e.target.value) })}
                                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    {assumption && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                >
                                    {STATUS_OPTIONS.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Risk Level</label>
                                <select
                                    value={formData.risk_level}
                                    onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                >
                                    {RISK_LEVELS.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Impact if Broken</label>
                        <textarea
                            value={formData.impact_notes}
                            onChange={(e) => setFormData({ ...formData, impact_notes: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            rows={2}
                            placeholder="Describe what happens if this assumption is broken..."
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase rounded transition-all"
                        >
                            {assumption ? 'Update' : 'Create'} Assumption
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase rounded transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
