import { useEffect, useState, useRef } from 'react';
import { OntologyService, type Entity } from '@/lib/mshnctrl/services/ontology.service';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle, HelpCircle, FileText, Gavel, X } from 'lucide-react';

interface DecisionGraphProps {
    sessionId?: string;
    onClose?: () => void;
}

interface GraphNode {
    id: string;
    type: 'AgendaPoint' | 'Decision' | 'Assumption';
    data: Entity;
    x: number;
    y: number;
}

interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
}

export function DecisionGraph({ sessionId, onClose }: DecisionGraphProps) {
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<GraphEdge[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        async function loadGraphData() {
            setLoading(true);
            try {
                // 1. Fetch relevant data
                // Optimisation: Backend filtering. Here we fetch generic types.

                const decisions = await OntologyService.getEntities({ type: 'Decision' });
                const assumptions = await OntologyService.getEntities({ type: 'Assumption' });
                const agendaPoints = await OntologyService.getEntities({ type: 'AgendaPoint' });

                // Fetch relationships
                const allRelationships = await OntologyService.getRelationships();

                const graphNodes: GraphNode[] = [];
                const graphEdges: GraphEdge[] = [];

                const X_START = 100;
                const X_GAP = 400;
                const Y_GAP = 120;

                let yAgenda = 50;
                let yDecision = 50;
                let yAssumption = 50;

                // Map for quick lookup
                const decisionMap = new Map<string, Entity>(decisions.map((d: Entity) => [d.id, d]));
                const assumptionMap = new Map<string, Entity>(assumptions.map((a: Entity) => [a.id, a]));
                const agendaMap = new Map<string, Entity>(agendaPoints.map((a: Entity) => [a.id, a]));

                // Build Graph
                // 1. Add Agenda Points (Column 1)
                agendaPoints.forEach((ap: Entity) => {
                    graphNodes.push({
                        id: ap.id,
                        type: 'AgendaPoint',
                        data: ap,
                        x: X_START,
                        y: yAgenda
                    });
                    yAgenda += Y_GAP;
                });

                // 2. Add Decisions (Column 2)
                for (const dec of decisions) {
                    graphNodes.push({
                        id: dec.id,
                        type: 'Decision',
                        data: dec,
                        x: X_START + X_GAP,
                        y: yDecision
                    });

                    // Find relations
                    // Filter from allRelationships
                    const leadsToRelations = allRelationships.filter(r => r.target_id === dec.id && r.relation_type === 'LEADS_TO');
                    leadsToRelations.forEach(r => {
                        if (agendaMap.has(r.source_id)) {
                            graphEdges.push({
                                id: `e-${r.source_id}-${dec.id}`,
                                source: r.source_id,
                                target: dec.id,
                                label: 'Leads To'
                            });
                        }
                    });

                    // Relations to Assumptions
                    const basedOnRelations = allRelationships.filter(r => r.source_id === dec.id && r.relation_type === 'BASED_ON');
                    basedOnRelations.forEach(r => {
                        if (assumptionMap.has(r.target_id)) {
                            graphEdges.push({
                                id: `e-${dec.id}-${r.target_id}`,
                                source: dec.id,
                                target: r.target_id,
                                label: 'Based On'
                            });
                        }
                    });

                    yDecision += Y_GAP;
                }

                // 3. Add Assumptions (Column 3)
                // We only add assumptions that are linked, or all? Let's add all for now but position them.
                assumptions.forEach((ass: Entity) => {
                    graphNodes.push({
                        id: ass.id,
                        type: 'Assumption',
                        data: ass,
                        x: X_START + (X_GAP * 2),
                        y: yAssumption
                    });
                    yAssumption += Y_GAP;
                });

                setNodes(graphNodes);
                setEdges(graphEdges);

            } catch (e) {
                console.error("Failed to load graph", e);
            } finally {
                setLoading(false);
            }
        }
        loadGraphData();
    }, [sessionId]);

    const getNodeColor = (type: string, data: Entity) => {
        switch (type) {
            case 'AgendaPoint': return 'border-blue-500 bg-blue-950/20 text-blue-400';
            case 'Decision':
                if (data.properties?.outcome === 'Approved') return 'border-emerald-500 bg-emerald-950/20 text-emerald-400';
                if (data.properties?.outcome === 'Rejected') return 'border-red-500 bg-red-950/20 text-red-400';
                return 'border-amber-500 bg-amber-950/20 text-amber-400';
            case 'Assumption':
                const conf = data.properties?.confidence;
                if (conf === 'HIGH') return 'border-emerald-400/50 bg-emerald-950/30 text-emerald-300';
                if (conf === 'MEDIUM') return 'border-amber-400/50 bg-amber-950/30 text-amber-300';
                return 'border-red-400/50 bg-red-950/30 text-red-300';
            default: return 'border-slate-500 bg-slate-900';
        }
    };

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'AgendaPoint': return <FileText size={16} />;
            case 'Decision': return <Gavel size={16} />;
            case 'Assumption': return <HelpCircle size={16} />;
            default: return <div />;
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500 uppercase font-black tracking-widest animate-pulse">Tracing Decision Causality...</div>;

    return (
        <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="w-full h-full bg-[#0B1121] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500"><AlertTriangle size={20} /></div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-tight">Assumption-Decision Traceability</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Causal Graph Verification Mode</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto relative custom-scrollbar bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]" ref={containerRef}>

                    {/* SVG Layer for Edges */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none min-w-[1200px] min-h-[1000px]">
                        <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
                            </marker>
                        </defs>
                        {edges.map(edge => {
                            const sourceNode = nodes.find(n => n.id === edge.source);
                            const targetNode = nodes.find(n => n.id === edge.target);
                            if (!sourceNode || !targetNode) return null;

                            const startX = sourceNode.x + 250; // Approximating card width
                            const startY = sourceNode.y + 40; // Mid height
                            const endX = targetNode.x;
                            const endY = targetNode.y + 40;

                            const controlPoint1X = startX + (endX - startX) / 2;
                            const controlPoint1Y = startY;
                            const controlPoint2X = startX + (endX - startX) / 2;
                            const controlPoint2Y = endY;

                            return (
                                <g key={edge.id}>
                                    <path
                                        d={`M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`}
                                        stroke="#334155"
                                        strokeWidth="2"
                                        fill="none"
                                        markerEnd="url(#arrowhead)"
                                        className="opacity-40"
                                    />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes Layer */}
                    <div className="relative min-w-[1200px] min-h-[1000px]">
                        {nodes.map(node => (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "absolute w-64 p-4 rounded-xl border-2 shadow-lg backdrop-blur-md transition-all hover:z-50 hover:scale-105 cursor-pointer",
                                    getNodeColor(node.type, node.data)
                                )}
                                style={{ left: node.x, top: node.y }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {getNodeIcon(node.type)}
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{node.type}</span>
                                    </div>
                                    {node.type === 'Assumption' && (
                                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded bg-black/30",
                                            node.data.properties?.confidence === 'HIGH' ? "text-emerald-400" :
                                                node.data.properties?.confidence === 'MEDIUM' ? "text-amber-400" : "text-red-400"
                                        )}>
                                            {node.data.properties?.confidence?.substring(0, 3) || 'MED'}
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-sm font-bold leading-tight mb-2">{node.data.name}</h4>
                                <p className="text-[10px] opacity-70 line-clamp-3 leading-relaxed">
                                    {node.data.description || 'No details provided.'}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
