import { useEffect, useState, useRef } from 'react';
import { OntologyService, type Entity, type EntityRelationship } from '@/lib/mshnctrl/services/ontology.service';
import { cn } from '@/lib/utils';
import {
    Network,
    Search,
    Target as TargetIcon,
    Box,
    X,
    Activity,
    Layers,
    Cpu,
    ArrowRight
} from 'lucide-react';

// --- Graph Types ---
interface GraphNode extends Entity {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
}

interface GraphLink {
    source: string;
    target: string;
    type: string;
}

// --- Inspector Component ---
function Inspector({ entityId, onClose }: { entityId: string | null; onClose: () => void }) {
    const [data, setData] = useState<{ entity: Entity; outgoing: EntityRelationship[]; incoming: EntityRelationship[] } | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (entityId) {
            setLoading(true);
            OntologyService.getEntityWithRelationships(entityId)
                .then(res => {
                    setData({
                        entity: res,
                        outgoing: res.outgoing_relationships,
                        incoming: res.incoming_relationships
                    });
                })
                .finally(() => setLoading(false));
        } else {
            setData(null);
        }
    }, [entityId]);

    if (!entityId || loading) {
        if (loading) {
            return (
                <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-950/95 border-l border-slate-800 backdrop-blur-md p-4 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-2">
                        <Activity className="text-blue-500 animate-pulse" size={24} />
                        <span className="text-[10px] font-black uppercase text-slate-500">Decrypting...</span>
                    </div>
                </div>
            );
        }
        return null;
    }

    if (!data) return null;

    const { entity, outgoing, incoming } = data;

    return (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-slate-950/95 border-l border-slate-800 backdrop-blur-md p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out shadow-2xl z-20">
            <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entity Inspector</span>
                <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center",
                        entity.type === 'UNIT' ? "bg-blue-600 shadow-[0_0_10px_#2563eb]" :
                            entity.type === 'TARGET' ? "bg-red-600 shadow-[0_0_10px_#dc2626]" : "bg-purple-600 shadow-[0_0_10px_#9333ea]"
                    )}>
                        {entity.type === 'UNIT' ? <Box className="text-white" size={20} /> : <TargetIcon className="text-white" size={20} />}
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase text-white leading-tight">{entity.name}</h2>
                        <span className="text-[10px] font-mono text-slate-400">{entity.id.substring(0, 8)}...</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Trusted Data Fields */}
                    <div>
                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1">Confidence Score</span>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full",
                                        (entity.confidence || 0) < 0.5 ? "bg-red-500" :
                                            (entity.confidence || 0) < 0.8 ? "bg-yellow-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${(entity.confidence || 0) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-white uppercase">
                                {((entity.confidence || 0) * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-[8px] font-black text-slate-500 uppercase block">Status</span>
                            <span className="text-[10px] font-bold uppercase text-blue-400">{entity.status || 'ACTIVE'}</span>
                        </div>
                        <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-[8px] font-black text-slate-500 uppercase block">Classification</span>
                            <span className="text-[10px] font-bold uppercase text-red-500 font-mono tracking-tighter">{entity.classification || 'SECRET'}</span>
                        </div>
                    </div>

                    {/* Relationships Section */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Network size={10} className="text-blue-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase block">Semantic Neighbors</span>
                        </div>
                        <div className="space-y-1">
                            {outgoing.length === 0 && incoming.length === 0 && (
                                <span className="text-[10px] text-slate-600 italic">No direct relationships in graph</span>
                            )}
                            {outgoing.map((rel, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-900 p-1.5 rounded border border-slate-800/50">
                                    <span className="text-slate-400 flex items-center gap-1">--- {rel.relation_type} <ArrowRight size={8} /></span>
                                    <span className="text-white font-bold">{rel.target_id.substring(0, 8)}</span>
                                </div>
                            ))}
                            {incoming.map((rel, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[10px] bg-slate-900 p-1.5 rounded border border-slate-800/50">
                                    <span className="text-white font-bold">{rel.source_id.substring(0, 8)}</span>
                                    <span className="text-slate-400 flex items-center gap-1"><ArrowRight size={8} /> {rel.relation_type} --- ME</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Extended Properties */}
                    <div className="pt-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers size={10} className="text-purple-500" />
                            <span className="text-[9px] font-black text-slate-500 uppercase block">Extended Properties</span>
                        </div>
                        <pre className="text-[9px] font-mono text-slate-400 bg-slate-950 p-2 rounded overflow-x-auto max-h-40 border border-slate-800/50">
                            {JSON.stringify(entity.properties || {}, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function OntologyManager() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [links, setLinks] = useState<GraphLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'Instance' | 'Schema'>('Instance');
    const requestRef = useRef<number | null>(null);

    // --- Physics Constants ---
    const REPULSION = 3000;
    const CENTER_PULL = 0.04;
    const DAMPING = 0.8;
    const SPRING_LENGTH = 150;
    const SPRING_STRENGTH = 0.05;

    // Load Data
    useEffect(() => {
        async function load() {
            setLoading(true);

            if (viewMode === 'Instance') {
                const [entities, relationships] = await Promise.all([
                    OntologyService.getEntities({}),
                    OntologyService.getRelationships()
                ]);

                const width = window.innerWidth;
                const height = window.innerHeight;
                const center = { x: width / 2, y: height / 2 };

                const graphNodes: GraphNode[] = entities.map(e => ({
                    ...e,
                    x: center.x + (Math.random() - 0.5) * 600,
                    y: center.y + (Math.random() - 0.5) * 600,
                    vx: 0,
                    vy: 0,
                    radius: e.type === 'TARGET' ? 10 : 15,
                    color: e.type === 'TARGET' ? '#ef4444' : e.type === 'UNIT' ? '#3b82f6' : '#a855f7'
                }));

                const graphLinks: GraphLink[] = relationships.map(r => ({
                    source: r.source_id,
                    target: r.target_id,
                    type: r.relation_type
                }));

                setNodes(graphNodes);
                setLinks(graphLinks);
            } else {
                // Schema View - Static for prototype
                const width = window.innerWidth;
                const height = window.innerHeight;
                const cx = width / 2;
                const cy = height / 2;

                const schemaNodes: GraphNode[] = [
                    { id: 'S-Unit', name: 'Unit Definition', type: 'META', x: cx - 150, y: cy, vx: 0, vy: 0, radius: 25, color: '#3b82f6', created_at: '', updated_at: '' },
                    { id: 'S-Target', name: 'Target Definition', type: 'META', x: cx + 150, y: cy, vx: 0, vy: 0, radius: 25, color: '#ef4444', created_at: '', updated_at: '' },
                    { id: 'S-Relationship', name: 'Link Specification', type: 'META', x: cx, y: cy + 150, vx: 0, vy: 0, radius: 20, color: '#a855f7', created_at: '', updated_at: '' }
                ];
                setNodes(schemaNodes);
                setLinks([]);
            }
            setLoading(false);
        }
        load();
    }, [viewMode]);

    // Simulation & Render Loop
    useEffect(() => {
        if (loading || nodes.length === 0) return;

        const currentNodes = [...nodes];
        const currentLinks = [...links];

        const render = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear with dark blue tint
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Physics Iteration
            for (let i = 0; i < currentNodes.length; i++) {
                const node = currentNodes[i];

                // Center Pull
                node.vx += ((canvas.width / 2) - node.x) * CENTER_PULL * 0.1;
                node.vy += ((canvas.height / 2) - node.y) * CENTER_PULL * 0.1;

                // Repulsion
                for (let j = 0; j < currentNodes.length; j++) {
                    if (i === j) continue;
                    const other = currentNodes[j];
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq) || 0.1;

                    if (dist < 300) {
                        const force = REPULSION / (distSq + 50);
                        node.vx += (dx / dist) * force;
                        node.vy += (dy / dist) * force;
                    }

                    // Cluster by type (gentle attraction)
                    if (node.type === other.type) {
                        node.vx -= (dx / dist) * 0.05;
                        node.vy -= (dy / dist) * 0.05;
                    }
                }

                // Spring Forces (Links)
                // This is O(Links * Nodes), could be optimized with a map but fine for <1000 nodes
                currentLinks.forEach(link => {
                    if (link.source === node.id) {
                        const targetNode = currentNodes.find(n => n.id === link.target);
                        if (targetNode) {
                            const dx = node.x - targetNode.x;
                            const dy = node.y - targetNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const displacement = dist - SPRING_LENGTH;
                            const force = displacement * SPRING_STRENGTH;

                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;

                            node.vx -= fx;
                            node.vy -= fy;
                        }
                    } else if (link.target === node.id) {
                        const sourceNode = currentNodes.find(n => n.id === link.source);
                        if (sourceNode) {
                            const dx = node.x - sourceNode.x;
                            const dy = node.y - sourceNode.y;
                            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                            const displacement = dist - SPRING_LENGTH;
                            const force = displacement * SPRING_STRENGTH;

                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;

                            node.vx -= fx;
                            node.vy -= fy;
                        }
                    }
                });

                node.vx *= DAMPING;
                node.vy *= DAMPING;
                node.x += node.vx;
                node.y += node.vy;
            }

            // Draw Links
            ctx.lineWidth = 1;
            currentLinks.forEach(link => {
                const source = currentNodes.find(n => n.id === link.source);
                const target = currentNodes.find(n => n.id === link.target);

                if (source && target) {
                    // Focus Mode: Dim links not connected to selection
                    let linkOpacity = 0.3;
                    if (selectedEntityId) {
                        const isConnected = link.source === selectedEntityId || link.target === selectedEntityId;
                        linkOpacity = isConnected ? 0.8 : 0.05;
                    }

                    ctx.globalAlpha = linkOpacity;

                    ctx.beginPath();
                    ctx.moveTo(source.x, source.y);
                    ctx.lineTo(target.x, target.y);

                    const gradient = ctx.createLinearGradient(source.x, source.y, target.x, target.y);
                    gradient.addColorStop(0, source.color);
                    gradient.addColorStop(1, target.color);
                    ctx.strokeStyle = gradient;
                    ctx.stroke();

                    // Arrows and Labels only if visible enough
                    if (linkOpacity > 0.1) {
                        // Draw Directional Arrow (midpoint)
                        const midX = (source.x + target.x) / 2;
                        const midY = (source.y + target.y) / 2;
                        const angle = Math.atan2(target.y - source.y, target.x - source.x);

                        ctx.save();
                        ctx.translate(midX, midY);
                        ctx.rotate(angle);

                        // Arrow
                        ctx.beginPath();
                        ctx.moveTo(-3, -3);
                        ctx.lineTo(3, 0);
                        ctx.lineTo(-3, 3);
                        ctx.fillStyle = '#64748b'; // slate-500
                        ctx.fill();

                        // Label Background and Text
                        if (viewMode === 'Instance' && nodes.length < 100) {
                            const label = link.type.replace(/_/g, ' ');
                            ctx.font = 'bold 8px monospace';
                            const metrics = ctx.measureText(label);
                            const padding = 2;

                            // Draw background for readability
                            ctx.fillStyle = '#020617';
                            ctx.fillRect(-metrics.width / 2 - padding, -10, metrics.width + padding * 2, 8);

                            ctx.fillStyle = '#475569'; // slate-600
                            ctx.textAlign = 'center';
                            ctx.fillText(label, 0, -3);
                        }

                        ctx.restore();
                    }

                    ctx.globalAlpha = 1.0;
                }
            });

            // Draw Nodes
            currentNodes.forEach(node => {
                // Focus Mode Opacity
                let opacity = 1.0;
                if (selectedEntityId) {
                    if (node.id === selectedEntityId) {
                        opacity = 1.0;
                    } else {
                        // Check if neighbor
                        const isNeighbor = currentLinks.some(l =>
                            (l.source === selectedEntityId && l.target === node.id) ||
                            (l.target === selectedEntityId && l.source === node.id)
                        );
                        opacity = isNeighbor ? 0.8 : 0.1;
                    }
                }

                ctx.globalAlpha = opacity;

                // --- SHAPE RENDERING ---

                if (node.type === 'UNIT') {
                    // Draw Box for Units
                    const size = node.radius * 2;
                    const x = node.x - node.radius;
                    const y = node.y - node.radius;

                    ctx.fillStyle = node.color;
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = selectedEntityId === node.id ? 20 : 0;

                    ctx.fillRect(x, y, size, size);

                    // Inner detail
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);

                } else if (node.type === 'TARGET') {
                    // Draw Crosshair/Scope for Targets
                    ctx.shadowColor = node.color;
                    ctx.shadowBlur = selectedEntityId === node.id ? 20 : 0;

                    // Main Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `${node.color}40`; // Transparent fill
                    ctx.fill();
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Crosshairs
                    ctx.beginPath();
                    ctx.moveTo(node.x - node.radius - 2, node.y);
                    ctx.lineTo(node.x + node.radius + 2, node.y);
                    ctx.moveTo(node.x, node.y - node.radius - 2);
                    ctx.lineTo(node.x, node.y + node.radius + 2);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                } else {
                    // Default Circle (Meta/Other)
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                    if (selectedEntityId === node.id) {
                        ctx.shadowColor = '#fff';
                        ctx.shadowBlur = 20;
                        ctx.fillStyle = '#fff';
                    } else {
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = node.color;
                    }
                    ctx.fill();
                }

                // Ring Effect for Selection - Universal
                if (selectedEntityId === node.id) {
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
                    ctx.setLineDash([2, 4]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Label
                if (opacity > 0.3) {
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = 'bold 9px monospace';
                    ctx.fillText(node.name.toUpperCase().substring(0, 18), node.x + node.radius + 8, node.y + 3);
                }

                ctx.globalAlpha = 1.0;
            });

            requestRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loading, nodes.length, selectedEntityId, links.length]);

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden font-sans relative">
            <Inspector entityId={selectedEntityId} onClose={() => setSelectedEntityId(null)} />

            {/* Sidebar UI */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="bg-slate-900/90 border border-slate-800 rounded p-4 flex flex-col gap-4 backdrop-blur shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/20 rounded border border-blue-500/50">
                            <Network size={20} className="text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">System Intelligence</span>
                            <h1 className="text-lg font-black text-white uppercase tracking-tighter">Ontology Graph</h1>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className={cn("flex-1 px-3 py-1.5 text-[10px] font-black uppercase rounded border transition-all duration-200",
                                viewMode === 'Instance' ? "bg-blue-600 text-white border-blue-400" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            )}
                            onClick={() => setViewMode('Instance')}
                        >
                            Instance View
                        </button>
                        <button
                            className={cn("flex-1 px-3 py-1.5 text-[10px] font-black uppercase rounded border transition-all duration-200",
                                viewMode === 'Schema' ? "bg-purple-600 text-white border-purple-400" : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                            )}
                            onClick={() => setViewMode('Schema')}
                        >
                            Schema View
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 font-mono uppercase">
                        <div>Nodes: <span className="text-white font-bold">{nodes.length}</span></div>
                        <div>Links: <span className="text-white font-bold">{links.length}</span></div>
                    </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded w-64 max-h-[60vh] overflow-hidden flex flex-col backdrop-blur shadow-2xl">
                    <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                        <Search size={14} className="text-slate-500" />
                        <input type="text" placeholder="Filter entities..." className="bg-transparent border-none text-[11px] text-white focus:outline-none w-full uppercase font-black" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {nodes.map(node => (
                            <div
                                key={node.id}
                                onClick={() => setSelectedEntityId(node.id)}
                                className={cn(
                                    "px-4 py-2.5 text-[10px] font-bold uppercase cursor-pointer hover:bg-slate-800 transition-all border-b border-slate-800/50 group",
                                    selectedEntityId === node.id ? "bg-blue-600/20 text-blue-400 border-l-2 border-l-blue-500" : "text-slate-400"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {node.type === 'UNIT' ? <Box size={10} /> : <TargetIcon size={10} />}
                                        <span className="group-hover:text-white">{node.name}</span>
                                    </div>
                                    <span className={cn("text-[8px] px-1.5 rounded-full border",
                                        node.type === 'UNIT' ? "border-blue-500/50 text-blue-500" :
                                            node.type === 'TARGET' ? "border-red-500/50 text-red-500" : "border-slate-500/50 text-slate-500"
                                    )}>
                                        {node.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[#020617]">
                <canvas
                    ref={canvasRef}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    className="block absolute inset-0"
                />

                {/* Background Grid */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)',
                        backgroundSize: '40px 40px',
                        opacity: 0.2
                    }}
                />

                {!loading && nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-8 border border-dashed border-slate-800 rounded-2xl">
                            <Cpu className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No spectral data detected in graph</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
