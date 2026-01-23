import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { cn } from '@/lib/utils';
import {
    Shield,
    Target as TargetIcon,
    Database,
    AlertTriangle,
    Activity,
    Info,
    Globe,
    ExternalLink,
    Network,
    Crosshair,
    BarChart3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SmartTagProps {
    type: string;
    id: string;
    label: string;
}

export function SmartTag({ type, id, label }: SmartTagProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let entity = null;
                const typeLower = type.toLowerCase();

                if (typeLower === 'unit') {
                    const units = await SmartOpsService.getUnits();
                    entity = units.find(u => u.id === id || u.designator === id);
                } else if (typeLower === 'target') {
                    const targets = await SmartOpsService.getTargets();
                    entity = targets.find(t => t.id === id || t.designator === id);
                } else if (typeLower === 'cog') {
                    const cogs = await SmartOpsService.getCOGs();
                    entity = cogs.find(c => c.id === id);
                } else if (typeLower === 'political') {
                    const pols = await SmartOpsService.getPoliticalStatements();
                    entity = pols.find(p => p.id === id);
                } else if (typeLower === 'disaster') {
                    const disasters = await SmartOpsService.getNaturalDisasters();
                    entity = disasters.find(d => d.id === id);
                } else if (typeLower === 'info' || typeLower === 'disinfo') {
                    const events = await SmartOpsService.getDisinformationEvents();
                    entity = events.find(e => e.id === id);
                }
                setData(entity);
            } catch (error) {
                console.error('Error fetching SmartTag data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [type, id]);

    const getIcon = () => {
        switch (type.toLowerCase()) {
            case 'unit': return <Shield size={12} />;
            case 'target': return <TargetIcon size={12} />;
            case 'cog': return <Database size={12} />;
            case 'political': return <Globe size={12} />;
            case 'disaster': return <AlertTriangle size={12} />;
            default: return <Info size={12} />;
        }
    };

    const getStatusColor = (isBadge = true) => {
        if (!data) return isBadge ? "bg-slate-800 text-slate-500 border-slate-700" : "text-slate-500";
        const status = (data.status || data.targetStatus || data.readiness || data.impactLevel || "").toString().toLowerCase();

        if (status === 'active' || status === 'ready' || status === 'executing' || status === 'achieved')
            return isBadge ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10" : "text-emerald-500";
        if (status === 'degraded' || status === 'warning' || status === 'atrisk' || status === 'pending')
            return isBadge ? "text-amber-500 border-amber-500/30 bg-amber-500/10" : "text-amber-500";
        if (status === 'destroyed' || status === 'critical' || status === 'high')
            return isBadge ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-red-500";

        return isBadge ? "text-blue-400 border-blue-500/30 bg-blue-500/10" : "text-blue-400";
    };

    const handleAction = () => {
        const typeLower = type.toLowerCase();
        if (typeLower === 'unit' && data) {
            navigate({ to: '/smartops/orbat', search: { unitId: data.id } });
        } else if (typeLower === 'target' && data) {
            navigate({ to: '/smartops/targeting', search: { targetId: data.id } });
        } else if (typeLower === 'cog' && data) {
            navigate({ to: '/smartops/cog', search: { cogId: data.id } });
        } else if (['political', 'disinfo', 'disaster', 'fakemedia'].includes(typeLower) && data) {
            navigate({ to: '/smartops/external-context' });
        }
    };

    return (
        <span
            className="relative inline-block align-middle"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-black uppercase tracking-tighter cursor-help transition-all hover:scale-105 active:scale-95 mx-0.5",
                getStatusColor()
            )}>
                {getIcon()}
                {label}
                {data && (
                    <span className="ml-1 opacity-70">
                        {type.toLowerCase() === 'unit' ? `[${data.readiness}%]` :
                            type.toLowerCase() === 'target' ? `[${data.targetStatus}]` : ''}
                    </span>
                )}
            </span>

            {isHovered && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-[#020617] border border-slate-800 rounded-xl shadow-2xl p-4 z-[100]">
                    {loading ? (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Activity className="animate-spin" size={12} />
                            Syncing with Live Data...
                        </div>
                    ) : data ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{type} Entity Detail</div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">{data.name}</h4>
                                </div>
                                <Badge className={cn("text-[9px] font-bold uppercase", getStatusColor())}>
                                    {data.status || data.targetStatus || (data.readiness ? data.readiness + "%" : "N/A")}
                                </Badge>
                            </div>

                            <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                {data.description || data.subject || data.objective || 'No description available for this entity in current intelligence store.'}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-900">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Affiliation</span>
                                    <div className={cn("text-[10px] font-bold uppercase",
                                        data.affiliation === 'Blue' ? "text-blue-500" :
                                            data.affiliation === 'Red' ? "text-red-500" : "text-white"
                                    )}>
                                        {data.affiliation || 'N/A'}
                                    </div>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Confidence</span>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                                        {Math.round((0.85 + Math.random() * 0.1) * 100)}%
                                    </div>
                                </div>
                            </div>

                            {data.location && (
                                <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe size={12} className="text-slate-500" />
                                        <span className="text-[10px] font-mono text-blue-400 uppercase">
                                            {data.location.mgrs || `${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-slate-600 uppercase font-bold">GRID LOC</span>
                                </div>
                            )}

                            <div className="pt-2 flex flex-col gap-2">
                                {type.toLowerCase() === 'unit' && (
                                    <button
                                        onClick={handleAction}
                                        className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-[10px] font-black uppercase text-blue-400 rounded border border-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Network size={10} />
                                        Open in Order of Battle
                                    </button>
                                )}
                                {type.toLowerCase() === 'target' && (
                                    <button
                                        onClick={handleAction}
                                        className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-[10px] font-black uppercase text-red-400 rounded border border-red-500/30 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <Crosshair size={10} />
                                        Open in Targeting
                                    </button>
                                )}
                                {type.toLowerCase() === 'cog' && (
                                    <button
                                        onClick={handleAction}
                                        className="w-full py-2 bg-purple-600/10 hover:bg-purple-600/20 text-[10px] font-black uppercase text-purple-400 rounded border border-purple-500/30 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        <BarChart3 size={10} />
                                        Open in COG Analysis
                                    </button>
                                )}
                                <button className="w-full py-2 bg-slate-900/50 hover:bg-slate-800 text-[10px] font-black uppercase text-slate-400 rounded border border-slate-800/50 transition-all flex items-center justify-center gap-2 group">
                                    View in Combat Picture
                                    <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-red-400 flex items-center gap-2 p-2">
                            <AlertTriangle size={14} />
                            Entity [{id}] not found in current operational context or intelligence state.
                        </div>
                    )}
                </div>
            )}
        </span>
    );
}
