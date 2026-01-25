import { useState, useEffect } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import { DisinformationEvent, FakeMedia } from '@/lib/smartops/types';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { Search, Zap, AlertTriangle, Video, Image, Volume2, ShieldCheck, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function DisinformationView() {
    const { context } = useOperationalContext();
    const [events, setEvents] = useState<DisinformationEvent[]>([]);
    const [media, setMedia] = useState<FakeMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'events' | 'media'>('events');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [eventsData, mediaData] = await Promise.all([
                    SmartOpsService.getDisinformationEvents(context.operationId || undefined),
                    SmartOpsService.getFakeMedia(context.operationId || undefined)
                ]);
                setEvents(eventsData);
                setMedia(mediaData);
            } catch (err) {
                console.error('Failed to fetch info stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [context.operationId]);

    const getAmplificationColor = (level: string) => {
        switch (level) {
            case 'Viral': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
            case 'High': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'Moderate': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
            default: return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <button
                    onClick={() => setActiveTab('events')}
                    className={cn(
                        "text-sm font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors",
                        activeTab === 'events' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    Disinformation Campaigns
                </button>
                <button
                    onClick={() => setActiveTab('media')}
                    className={cn(
                        "text-sm font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors",
                        activeTab === 'media' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                >
                    Fake Media Artifacts
                </button>
            </div>

            {activeTab === 'events' && (
                <div className="grid gap-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 hover:bg-slate-900/60 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Zap size={16} className="text-purple-400" />
                                    <h4 className="text-sm font-bold text-slate-200 uppercase">{event.name}</h4>
                                    <Badge className={cn("text-[9px]", getAmplificationColor(event.amplification))}>
                                        {event.amplification} Amp
                                    </Badge>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                    {format(new Date(event.timestamp), 'dd MMM HH:mm')}
                                </span>
                            </div>
                            <p className="text-slate-300 text-xs mb-3">"{event.narrative}"</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800">
                                <div className="flex items-center gap-1.5 ">
                                    <Share2 size={12} />
                                    <span>Platform: <span className="text-slate-300">{event.platform}</span></span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Users size={12} />
                                    <span>Target: <span className="text-slate-300">{event.targetAudience}</span></span>
                                </div>
                                {event.debunked && (
                                    <div className="ml-auto flex items-center gap-1 text-emerald-500">
                                        <ShieldCheck size={12} />
                                        <span className="font-bold uppercase tracking-wider">Debunked</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && !loading && (
                        <div className="text-center text-slate-500 py-8">No active disinformation events detected.</div>
                    )}
                </div>
            )}

            {activeTab === 'media' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {media.map(item => (
                        <div key={item.id} className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-50 text-7xl font-black text-slate-800 -z-10 rotate-12">FAKE</div>
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    {item.mediaType === 'Video' ? <Video size={16} className="text-blue-400" /> :
                                        item.mediaType === 'Audio' ? <Volume2 size={16} className="text-amber-400" /> :
                                            <Image size={16} className="text-purple-400" />}
                                    <span className="text-xs font-bold uppercase text-slate-300">{item.name}</span>
                                </div>
                                <Badge variant={item.isDeepfake ? "destructive" : "secondary"} className="text-[9px]">
                                    {item.isDeepfake ? "DEEPFAKE" : "MANIPULATED"}
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{item.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-800">
                                <div className="text-xs">
                                    <span className="text-slate-500">Confidence: </span>
                                    <span className={cn("font-bold font-mono", item.detectionConfidence > 0.8 ? "text-emerald-400" : "text-amber-400")}>
                                        {(item.detectionConfidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                {item.manipulationTechnique && (
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                        ALG: {item.manipulationTechnique}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {media.length === 0 && !loading && (
                        <div className="col-span-full text-center text-slate-500 py-8">No fake media artifacts found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
