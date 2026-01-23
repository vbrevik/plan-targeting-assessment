import { useState, useEffect } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { PoliticalStatement } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { Search, MapPin, Calendar, ExternalLink, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function PoliticalStatementsView() {
    const { context } = useOperationalContext();
    const [statements, setStatements] = useState<PoliticalStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStatements = async () => {
            setLoading(true);
            try {
                const data = await SmartOpsService.getPoliticalStatements(context.operationId || undefined);
                setStatements(data);
            } catch (err) {
                console.error('Failed to fetch political statements:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStatements();
    }, [context.operationId]);

    const filteredStatements = statements.filter(s =>
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="relative w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search statements by speaker or content..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="text-xs text-slate-500 font-mono uppercase">
                    Showing {filteredStatements.length} statements
                </div>
            </div>

            <div className="grid gap-4">
                {filteredStatements.map(stmt => (
                    <div key={stmt.id} className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 hover:bg-slate-900/60 transition-colors group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                                    <span className="font-bold text-xs">{stmt.speaker.substring(0, 2).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-200">{stmt.speaker}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{stmt.role || "Official"}</span>
                                        <span>•</span>
                                        <Calendar size={12} />
                                        <span>{format(new Date(stmt.timestamp), 'dd MMM yyyy HH:mm')}</span>
                                    </div>
                                </div>
                            </div>
                            <Badge className={cn(
                                "uppercase text-[10px] tracking-wider",
                                stmt.impactLevel === 'Strategic' ? "bg-red-900/50 text-red-200 border-red-700 hover:bg-red-900/50" :
                                    stmt.impactLevel === 'Operational' ? "bg-amber-900/50 text-amber-200 border-amber-700 hover:bg-amber-900/50" :
                                        "bg-blue-900/50 text-blue-200 border-blue-700 hover:bg-blue-900/50"
                            )}>
                                {stmt.impactLevel} Impact
                            </Badge>
                        </div>

                        <div className="ml-13 pl-13">
                            <p className="text-slate-300 italic text-sm border-l-2 border-slate-700 pl-4 py-1 mb-4">
                                "{stmt.content}"
                            </p>

                            <div className="flex items-center gap-6 text-xs border-t border-slate-800 pt-3 mt-3">
                                {stmt.location && (
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MapPin size={12} />
                                        <span>{stmt.location.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <AlertTriangle size={12} />
                                    <span>Triggers: {stmt.requiresAction ? 'Action Required' : 'Monitoring'}</span>
                                </div>
                                <button className="ml-auto text-blue-400 hover:text-blue-300 flex items-center gap-1 uppercase font-bold text-[10px] tracking-wider">
                                    Analyze Impact
                                    <ExternalLink size={10} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredStatements.length === 0 && (
                    <div className="text-center py-12 bg-slate-900/20 border border-slate-800 border-dashed rounded-lg text-slate-500">
                        No political statements found matching your filter.
                    </div>
                )}
            </div>
        </div>
    );
}
