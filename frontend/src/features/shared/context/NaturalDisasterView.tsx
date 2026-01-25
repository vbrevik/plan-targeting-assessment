import { useState, useEffect } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { NaturalDisaster } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { AlertTriangle, MapPin, Activity, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function NaturalDisasterView() {
    const { context } = useOperationalContext();
    const [disasters, setDisasters] = useState<NaturalDisaster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await SmartOpsService.getNaturalDisasters(context.operationId || undefined);
                setDisasters(data);
            } catch (err) {
                console.error('Failed to fetch disasters:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [context.operationId]);

    const getSeverityColor = (severity: number) => {
        if (severity >= 8) return "text-red-500 border-red-500/50 bg-red-500/10";
        if (severity >= 5) return "text-amber-500 border-amber-500/50 bg-amber-500/10";
        return "text-blue-500 border-blue-500/50 bg-blue-500/10";
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {disasters.map(d => (
                    <div key={d.id} className="relative bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all group">
                        {/* Stripe for type */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5",
                            d.disasterType === 'Earthquake' || d.disasterType === 'Wildfire' ? "bg-red-500" :
                                d.disasterType === 'Hurricane' || d.disasterType === 'Flood' ? "bg-blue-500" : "bg-slate-500"
                        )} />

                        <div className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-black text-lg text-slate-200 uppercase tracking-tight">{d.name}</h4>
                                <Badge className={cn("font-bold font-mono", getSeverityColor(d.severity))}>
                                    SEV {d.severity}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                <span className="font-bold uppercase text-slate-500">{d.disasterType}</span>
                                <span>•</span>
                                <span className="font-mono">{format(new Date(d.timestamp), 'dd MMM yyyy')}</span>
                            </div>

                            <p className="text-sm text-slate-300 leading-relaxed mb-4">{d.description}</p>

                            <div className="space-y-3 pt-3 border-t border-slate-800/50">
                                <div className="flex items-center gap-2 text-xs">
                                    <MapPin size={14} className="text-slate-500" />
                                    <span className="text-slate-400">{d.location}</span>
                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-2.5 border border-slate-800/50">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Package size={14} className="text-amber-500" />
                                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Logistics Impact</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full", d.impactOnLogistics > 0.5 ? "bg-red-500" : "bg-amber-500")}
                                            style={{ width: `${d.impactOnLogistics * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-right mt-1">
                                        <span className="text-[10px] font-mono text-slate-400">{(d.impactOnLogistics * 100).toFixed(0)}% Degradation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {disasters.length === 0 && !loading && (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                    <Activity className="mx-auto text-slate-700 mb-3" size={32} />
                    <p className="text-slate-500">No major environmental disasters active in current context.</p>
                </div>
            )}
        </div>
    );
}
