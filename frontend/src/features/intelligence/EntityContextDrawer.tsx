import { useEffect, useState } from 'react';
import { X, ExternalLink, Shield, Clock, MapPin, FileText, ArrowRightLeft, Network } from 'lucide-react';
import { OntologyService, type Entity, type EntityRelationship } from '@/lib/mshnctrl/services/ontology.service';
import { cn } from '@/lib/utils';


interface EntityContextDrawerProps {
    entityId: string | null;
    onClose: () => void;
    onSelectEntity: (id: string) => void;
}

interface EnrichedRelationship {
    rel: EntityRelationship;
    relatedEntity?: Entity; // The entity on the other end
    direction: 'incoming' | 'outgoing';
}

export function EntityContextDrawer({ entityId, onClose, onSelectEntity }: EntityContextDrawerProps) {
    const [entity, setEntity] = useState<Entity | null>(null);
    const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!entityId) {
            setEntity(null);
            return;
        }

        async function loadContext() {
            if (!entityId) return; // TS guard
            setLoading(true);
            setError(null);
            try {
                // 1. Get the main entity and its raw relationships
                const data = await OntologyService.getEntityWithRelationships(entityId);
                setEntity(data);

                // 2. We need to fetch the names/details of the related entities to show meaningful links
                // This is a "client-side join" for now. In high-scale this moves to backend.

                const outgoingPromises = data.outgoing_relationships.map(async rel => {
                    try {
                        const target = await OntologyService.getEntity(rel.target_id);
                        return { rel, relatedEntity: target, direction: 'outgoing' } as EnrichedRelationship;
                    } catch (e) {
                        return { rel, direction: 'outgoing' } as EnrichedRelationship;
                    }
                });

                const incomingPromises = data.incoming_relationships.map(async rel => {
                    try {
                        const source = await OntologyService.getEntity(rel.source_id);
                        return { rel, relatedEntity: source, direction: 'incoming' } as EnrichedRelationship;
                    } catch (e) {
                        return { rel, direction: 'incoming' } as EnrichedRelationship;
                    }
                });

                const enriched = await Promise.all([...outgoingPromises, ...incomingPromises]);
                setRelationships(enriched);

            } catch (err) {
                console.error("Failed to load entity context", err);
                setError("Failed to retrieve entity details.");
            } finally {
                setLoading(false);
            }
        }

        loadContext();
    }, [entityId]);

    if (!entityId) return null;

    return (
        <div
            data-testid="entity-drawer"
            className={cn(
                "fixed inset-y-0 right-0 w-[480px] bg-slate-950 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col",
                entityId ? "translate-x-0" : "translate-x-full"
            )}>
            {/* Header */}
            <div className="flex-none p-5 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {loading ? 'LOADING...' : entity?.type || 'ENTITY'}
                        </span>
                        {entity?.status && (
                            <span className="text-emerald-500 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {entity.status}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                    {loading ? 'Acquiring Target Data...' : entity?.name}
                </h2>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                        <Shield size={12} className="text-slate-600" />
                        ID: {entityId.substring(0, 8)}
                    </span>
                    {entity?.created_at && (
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-600" />
                            UPDATED: {new Date(entity.updated_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Scroller */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <Network className="animate-pulse opacity-50" size={48} />
                        <span className="text-xs font-mono uppercase">Tracing Ontology Links...</span>
                    </div>
                ) : error ? (
                    <div className="p-6 text-red-400 bg-red-950/20 border-b border-red-900/20 text-sm">
                        {error}
                    </div>
                ) : entity ? (
                    <div className="p-6 space-y-8">

                        {/* Description */}
                        {entity.description && (
                            <div className="bg-slate-900/50 p-4 rounded border border-slate-800">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</h3>
                                <p className="text-sm text-slate-300 leading-relaxed">
                                    {entity.description}
                                </p>
                            </div>
                        )}

                        {/* Extended Properties Grid */}
                        {entity.properties && Object.keys(entity.properties).length > 0 && (
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                    <FileText size={12} /> Metadata
                                </h3>
                                <div className="grid grid-cols-2 gap-px bg-slate-800 border border-slate-800 rounded overflow-hidden">
                                    {Object.entries(entity.properties).map(([key, value]) => {
                                        if (typeof value === 'object' || key === 'description') return null;
                                        return (
                                            <div key={key} className="bg-slate-900/50 p-3">
                                                <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">{key.replace(/_/g, ' ')}</div>
                                                <div className="text-xs text-slate-200 font-mono truncate" title={String(value)}>
                                                    {String(value)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Locations if applicable */}
                        {(entity.location_lat || entity.location_lng) && (
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                                    <MapPin size={12} /> Geo-Spatial
                                </h3>
                                <div className="bg-slate-900/50 p-3 rounded border border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-400">Coordinates</span>
                                    <span className="text-xs font-mono text-purple-400">
                                        {entity.location_lat?.toFixed(6)}, {entity.location_lng?.toFixed(6)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Relationships Graph */}
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                                <ArrowRightLeft size={12} /> Linked Context ({relationships.length})
                            </h3>

                            {relationships.length === 0 ? (
                                <div className="text-xs text-slate-600 italic border-l-2 border-slate-800 pl-3">
                                    No direct relationships found for this entity.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {relationships.map((item, idx) => (
                                        <button
                                            key={`${item.rel.source_id}-${item.rel.target_id}-${idx}`}
                                            onClick={() => item.relatedEntity && onSelectEntity(item.relatedEntity.id)}
                                            className="w-full group flex items-start gap-3 p-3 rounded bg-slate-900/30 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all text-left"
                                        >
                                            <div className={cn(
                                                "mt-0.5 w-6 h-6 rounded flex items-center justify-center shrink-0 border",
                                                item.direction === 'outgoing'
                                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-500"
                                                    : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                                            )}>
                                                <Network size={12} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className="text-[9px] font-black uppercase text-slate-500">
                                                        {item.direction === 'outgoing' ? 'RELATES TO' : 'REFERENCED BY'}
                                                    </span>
                                                    <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                                                        {item.rel.relation_type.replace(/_/g, ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                                                    {item.relatedEntity?.name || 'Unknown Entity'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-1">
                                                    <span className="uppercase">{item.relatedEntity?.type || 'Entity'}</span>
                                                    {item.relatedEntity?.status && (
                                                        <>• <span className="text-emerald-600">{item.relatedEntity.status}</span></>
                                                    )}
                                                </div>
                                            </div>
                                            <ExternalLink size={12} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                ) : null}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-950">
                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded border border-slate-800 transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <FileText size={14} /> View Full Record
                </button>
            </div>
        </div>
    );
}
