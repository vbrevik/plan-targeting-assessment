import type { Entity } from "@/lib/mshnctrl/services/ontology.service";
import { Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface TimelineViewProps {
    entities: Entity[];
    onEntityClick: (id: string) => void;
}

export function TimelineView({ entities, onEntityClick }: TimelineViewProps) {
    // Sort by created_at descending
    const sorted = [...entities].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Group by Date
    const grouped: Record<string, Entity[]> = {};
    sorted.forEach(entity => {
        const date = new Date(entity.created_at).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entity);
    });

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-black text-white uppercase mb-8 flex items-center gap-3">
                <Clock className="text-purple-500" /> Operational Timeline
            </h2>

            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                {Object.entries(grouped).map(([date, items]) => (
                    <div key={date} className="relative is-active group">
                        <div className="flex items-center justify-center mb-6">
                            <span className="relative z-10 px-4 py-1 bg-slate-900 border border-slate-700 rounded-full text-xs font-mono text-slate-400 uppercase tracking-widest shadow-lg">
                                {date}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {items.map((entity) => (
                                <div
                                    key={entity.id}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group cursor-pointer"
                                    onClick={() => onEntityClick(entity.id)}
                                >
                                    {/* Icon on the line */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 group-hover:bg-purple-500/10 group-hover:border-purple-500/50 transition-all shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-xl">
                                        {entity.type === 'Decision' ? <CheckCircle2 size={18} className="text-emerald-500" /> :
                                            entity.type === 'Meeting' ? <Calendar size={18} className="text-blue-500" /> :
                                                entity.properties?.priority === 'critical' ? <AlertCircle size={18} className="text-red-500" /> :
                                                    <Clock size={18} className="text-slate-500" />}
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900/40 p-4 border border-slate-800 rounded hover:bg-slate-900/80 hover:border-purple-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-bold text-white text-sm">{entity.name}</span>
                                            <span className="text-[10px] uppercase font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{entity.type}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{entity.description || entity.properties?.description || 'No description provided'}</p>
                                        <div className="text-[10px] font-mono text-slate-600">
                                            {new Date(entity.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center text-xs text-slate-600 font-mono uppercase">
                End of history
            </div>
        </div>
    );
}
