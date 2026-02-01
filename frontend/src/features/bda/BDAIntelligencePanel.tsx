import { useState, useEffect } from 'react';
import { IntelligenceApi, type IntelFeed, type IntelType } from '@/lib/mshnctrl/api/intelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Signal,
    Globe,
    Users,
    Layers,
    Activity,
    Info,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BDAIntelligencePanelProps {
    targetId: string;
    bdaReportId?: string;
    className?: string;
}

const IntelTypeIcon = ({ type, size = 16 }: { type: IntelType; size?: number }) => {
    switch (type) {
        case 'sigint': return <Signal size={size} className="text-blue-400" />;
        case 'osint': return <Globe size={size} className="text-emerald-400" />;
        case 'humint': return <Users size={size} className="text-amber-400" />;
        case 'geoint': return <Layers size={size} className="text-purple-400" />;
        case 'masint': return <Activity size={size} className="text-rose-400" />;
        default: return <Info size={size} className="text-slate-400" />;
    }
};

export function BDAIntelligencePanel({ targetId, className }: BDAIntelligencePanelProps) {
    const [feeds, setFeeds] = useState<IntelFeed[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const loadFeeds = async () => {
            try {
                setLoading(true);
                // Fetch feeds associated with the target
                const data = await IntelligenceApi.getFeedsByTarget(targetId);
                setFeeds(data);
            } catch (error) {
                console.error('Failed to load intelligence feeds:', error);
            } finally {
                setLoading(false);
            }
        };

        if (targetId) {
            loadFeeds();
        }
    }, [targetId]);

    const toggleExpand = (id: string) => {
        const next = new Set(expandedIds);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
        }
        setExpandedIds(next);
    };

    if (loading) {
        return (
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/4" />
                <div className="h-20 bg-slate-800 rounded" />
                <div className="h-20 bg-slate-800 rounded" />
            </div>
        );
    }

    return (
        <Card className={cn("bg-slate-950/40 border-slate-800", className)}>
            <CardHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={14} className="text-blue-500" />
                        Intelligence Correlation
                    </CardTitle>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Multi-INT Fusion Center</p>
                </div>
                <Badge variant="outline" className="text-[8px] border-slate-700 text-slate-400">
                    {feeds.length} SOURCES
                </Badge>
            </CardHeader>
            <CardContent className="p-2 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                {feeds.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-[9px] text-slate-600 font-mono uppercase">No correlated intelligence feeds found for this target.</p>
                    </div>
                ) : (
                    feeds.map((feed) => {
                        const isExpanded = expandedIds.has(feed.id);
                        return (
                            <div
                                key={feed.id}
                                className={cn(
                                    "border rounded transition-all",
                                    isExpanded ? "bg-slate-900/60 border-slate-700" : "bg-slate-900/20 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div
                                    className="p-3 cursor-pointer flex items-center justify-between"
                                    onClick={() => toggleExpand(feed.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-slate-950 rounded border border-slate-800">
                                            <IntelTypeIcon type={feed.intel_type} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-[9px] font-black text-white uppercase tracking-tight">
                                                    {feed.intel_type} - {feed.source_agency}
                                                </span>
                                                <Badge className={cn(
                                                    "text-[7px] py-0 px-1 font-black",
                                                    feed.confidence_score > 0.7 ? "bg-emerald-500/10 text-emerald-500" :
                                                        feed.confidence_score > 0.4 ? "bg-amber-500/10 text-amber-500" :
                                                            "bg-rose-500/10 text-rose-500"
                                                )}>
                                                    {(feed.confidence_score * 100).toFixed(0)}% CONF
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-slate-300 font-medium leading-tight line-clamp-1">
                                                {feed.interpretation}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-slate-600">
                                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-slate-800/50 space-y-3">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Raw Data Snippet</span>
                                            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[9px] text-slate-400 overflow-x-auto whitespace-pre-wrap">
                                                {feed.raw_data}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Reliability Rating</span>
                                                <p className="text-[10px] font-bold text-white bg-slate-800/50 px-2 py-1 rounded inline-block mt-1">
                                                    NATO: {feed.reliability_rating}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Visibility</span>
                                                <p className="text-[10px] font-bold text-blue-400 bg-blue-500/5 px-2 py-1 rounded inline-block mt-1 border border-blue-500/10 uppercase">
                                                    {feed.visibility_level}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 border-t border-slate-800/30 pt-2 mt-2 uppercase">
                                            <span>UID: {feed.id.substring(0, 8)}</span>
                                            <span>Collected: {new Date(feed.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}
