// Ontology Future-Proofing Matrix
// Visualizes the intersection of Level of War x Domain to ensure full strategic coverage.
// Supports Multi-Operation Context filtering.

import { useState, useMemo, useEffect } from 'react';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import type { Target, Domain, LevelOfWar } from '@/lib/mshnctrl/api/targeting.api';
import { OntologyManager } from '@/features/planning/OntologyManager';
import { cn } from '@/lib/utils';
import { Layers, Globe, Zap, Users, Brain, Activity, Filter, Network } from 'lucide-react';

interface OntologyProofViewProps {
    mockData?: boolean;
}

export function OntologyProofView({ mockData = true }: OntologyProofViewProps) {
    const [selectedOp, setSelectedOp] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'MATRIX' | 'LIST' | 'GRAPH'>('MATRIX');

    // Dynamic Schema State
    const [domains, setDomains] = useState<string[]>(['LAND', 'AIR', 'MARITIME', 'CYBER', 'SPACE']); // Fallback defaults
    const [levels, setLevels] = useState<string[]>(['STRATEGIC', 'OPERATIONAL', 'TACTICAL']); // Fallback defaults

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const schemaData = await targetingApi.getOntologySchema();
                setDomains(schemaData.domains);
                setLevels(schemaData.levels_of_war);
            } catch (error) {
                console.error("Failed to fetch ontology schema, using fallbacks:", error);
            }
        };
        fetchSchema();
    }, []);

    // Mock Data Generator for verification
    const data: Target[] = useMemo(() => {
        if (!mockData) return [];
        return [
            // Political Level
            { id: 'T-POL-01', name: 'Ministry of Defense Infrastructure', domain: 'LAND', level_of_war: 'POLITICAL', target_type: 'INFRASTRUCTURE', priority: 'PRIORITY_1', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },
            { id: 'T-POL-02', name: 'National Narrative Center', domain: 'INFO', level_of_war: 'POLITICAL', target_type: 'INFLUENCE_NODE', priority: 'PRIORITY_1', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA', 'OP-BETA'] },

            // Strategic Level
            { id: 'T-STR-01', name: 'Deep Strike Capability', domain: 'AIR', level_of_war: 'STRATEGIC', target_type: 'MILITARY', priority: 'PRIORITY_1', target_status: 'TRACKED', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },
            { id: 'T-STR-02', name: 'National Grid Control', domain: 'CYBER', level_of_war: 'STRATEGIC', target_type: 'INFRASTRUCTURE', priority: 'PRIORITY_2', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-BETA'], cyber_attributes: { logical_nodes: [], access_status: 'PERSISTENT', vulnerabilities: [] } },

            // Operational Level
            { id: 'T-OP-01', name: 'Forward Logistics Hub', domain: 'LAND', level_of_war: 'OPERATIONAL', target_type: 'LOGISTICS', priority: 'PRIORITY_2', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },
            { id: 'T-OP-02', name: 'Integrated Air Defense', domain: 'EMS', level_of_war: 'OPERATIONAL', target_type: 'RADAR', priority: 'PRIORITY_1', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },

            // Tactical Level
            { id: 'T-TAC-01', name: 'Tank Battalion', domain: 'LAND', level_of_war: 'TACTICAL', target_type: 'UNIT', priority: 'PRIORITY_3', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },
            { id: 'T-TAC-02', name: 'Local Radio Station', domain: 'HUMAN', level_of_war: 'TACTICAL', target_type: 'MEDIA', priority: 'PRIORITY_4', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },

            // Sub-Tactical
            { id: 'T-SUB-01', name: 'Sniper Position', domain: 'LAND', level_of_war: 'SUB_TACTICAL', target_type: 'PERSONNEL', priority: 'PRIORITY_5', target_status: 'NEUTRALIZED', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'] },
            { id: 'T-SUB-02', name: 'IoT Sensor Node', domain: 'CYBER', level_of_war: 'SUB_TACTICAL', target_type: 'SENSOR', priority: 'PRIORITY_5', target_status: 'ACTIVE', coordinates: 'UNKNOWN', operation_ids: ['OP-ALPHA'], cyber_attributes: { logical_nodes: [], access_status: 'INITIAL', vulnerabilities: [] } }
        ] as Target[];
    }, [mockData]);

    const filteredData = useMemo(() => {
        return selectedOp === 'ALL' ? data : data.filter(t => t.operation_ids?.includes(selectedOp));
    }, [data, selectedOp]);

    const getCount = (level: LevelOfWar, domain: Domain) => {
        return filteredData.filter(t => t.level_of_war === level && t.domain === domain).length;
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Layers className="text-blue-500" />
                        Ontology Matrix Proof
                    </h1>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                        LEVEL OF WAR x DOMAIN INTERSECTION VISUALIZER
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setViewMode('MATRIX')}
                            className={cn("px-3 py-1.5 rounded text-xs font-bold transition-all", viewMode === 'MATRIX' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
                        >
                            Matrix View
                        </button>
                        <button
                            onClick={() => setViewMode('LIST')}
                            className={cn("px-3 py-1.5 rounded text-xs font-bold transition-all", viewMode === 'LIST' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('GRAPH')}
                            className={cn("px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-2", viewMode === 'GRAPH' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white")}
                        >
                            <Network size={12} />
                            Graph View
                        </button>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={selectedOp}
                            onChange={(e) => setSelectedOp(e.target.value)}
                            className="bg-transparent text-xs font-bold text-white outline-none uppercase"
                        >
                            <option value="ALL">All Operations</option>
                            <option value="OP-ALPHA">Op Alpha</option>
                            <option value="OP-BETA">Op Beta</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Matrix Visualization */}
            {viewMode === 'MATRIX' && (
                <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-900/30">
                    <div className="min-w-[1000px] h-full flex flex-col">
                        {/* Header Row (Domains) */}
                        {/* Header Row (Domains) */}
                        <div className="flex border-b border-slate-800">
                            <div className="w-32 shrink-0 p-4 border-r border-slate-800 bg-slate-950 sticky left-0 z-10 flex items-end">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Level \ Domain</span>
                            </div>
                            {domains.map(domain => (
                                <div key={domain} className="flex-1 min-w-[100px] p-3 border-r border-slate-800/50 bg-slate-900/50 flex flex-col items-center justify-center gap-2">
                                    {domain === 'CYBER' ? <Zap size={16} className="text-purple-400" /> :
                                        domain === 'COGNITIVE' ? <Brain size={16} className="text-pink-400" /> :
                                            domain === 'HUMAN' ? <Users size={16} className="text-orange-400" /> :
                                                domain === 'EMS' ? <Activity size={16} className="text-yellow-400" /> :
                                                    <Globe size={16} className="text-blue-400" />}
                                    <span className="text-[10px] font-black text-slate-300 uppercase">{domain}</span>
                                </div>
                            ))}
                        </div>

                        {/* Rows (Levels) */}
                        <div className="flex-1 overflow-y-auto">
                            {levels.map(level => (
                                <div key={level} className="flex border-b border-slate-800 hover:bg-slate-800/20 transition-colors">
                                    <div className="w-32 shrink-0 p-4 border-r border-slate-800 bg-slate-950/80 sticky left-0 z-10 flex items-center justify-between">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-wider",
                                            level === 'POLITICAL' ? "text-purple-400" :
                                                level === 'STRATEGIC' ? "text-red-400" :
                                                    level === 'OPERATIONAL' ? "text-blue-400" :
                                                        "text-emerald-400"
                                        )}>
                                            {level.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {domains.map(domain => {
                                        const count = getCount(level as LevelOfWar, domain as Domain);
                                        return (
                                            <div key={`${level}-${domain}`} className="flex-1 min-w-[100px] border-r border-slate-800/30 p-2 relative group cursor-pointer transition-all hover:bg-slate-800/40">
                                                {count > 0 ? (
                                                    <div className="h-full flex flex-col items-center justify-center gap-1.5">
                                                        <span className="text-xl font-black text-white">{count}</span>
                                                        <div className="h-1 w-8 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }} />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center">
                                                        <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                    </div>
                                                )}

                                                {/* Tooltip Preview */}
                                                {count > 0 && (
                                                    <div className="hidden group-hover:block absolute z-20 top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-3">
                                                        <div className="text-[10px] font-black text-slate-400 uppercase mb-2 border-b border-slate-800 pb-1">
                                                            {level} // {domain}
                                                        </div>
                                                        <div className="space-y-1">
                                                            {filteredData
                                                                .filter(t => t.level_of_war === level && t.domain === domain)
                                                                .slice(0, 3)
                                                                .map(t => (
                                                                    <div key={t.id} className="text-[10px] text-white truncate flex items-center gap-2">
                                                                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                                                        {t.name}
                                                                    </div>
                                                                ))
                                                            }
                                                            {count > 3 && (
                                                                <div className="text-[9px] text-slate-500 italic mt-1">
                                                                    + {count - 3} more...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Graph Visualization */}
            {viewMode === 'GRAPH' && (
                <div className="flex-1 overflow-hidden border border-slate-800 rounded-xl bg-slate-900/30 relative">
                    <OntologyManager />
                </div>
            )}
        </div>
    );
}
