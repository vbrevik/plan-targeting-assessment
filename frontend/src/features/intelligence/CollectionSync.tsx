import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CollectionRequest } from '@/lib/mshnctrl/types';
import { cn } from '@/lib/utils';
import {
    Radar,
    Satellite,
    Radio,
    Users,
    RefreshCcw,
    AlertCircle,
    Send
} from 'lucide-react';

interface CollectionSyncProps {
    requests: CollectionRequest[];
}

export const CollectionSync: React.FC<CollectionSyncProps> = ({ requests }) => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Radar className="text-blue-500" size={24} />
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest text-white">ISR Collection Synchronization</h2>
                        <p className="text-[10px] text-slate-500 font-mono italic">Synchronizing assets for multi-INT target development</p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase rounded shadow-lg shadow-blue-900/20 transition-all">
                    <Send size={14} /> Request Sensor Tasking
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center mb-3">
                        <Satellite size={20} className="text-blue-500" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-1">IMINT Coverage</span>
                    <span className="text-xl font-bold text-white uppercase">{requests.filter(r => r.assetType === 'IMINT').length} ACTIVE</span>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center mb-3">
                        <Radio size={20} className="text-emerald-500" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-1">SIGINT Coverage</span>
                    <span className="text-xl font-bold text-white uppercase">{requests.filter(r => r.assetType === 'SIGINT').length} ACTIVE</span>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center mb-3">
                        <Users size={20} className="text-amber-500" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-1">HUMINT Assets</span>
                    <span className="text-xl font-bold text-white uppercase">{requests.filter(r => r.assetType === 'HUMINT').length} ACTIVE</span>
                </Card>
                <Card className="bg-slate-900/40 border-slate-800 p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center mb-3">
                        <RefreshCcw size={20} className="text-slate-400" />
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase mb-1">Global Confidence</span>
                    <span className="text-xl font-bold text-white tracking-widest uppercase">~88%</span>
                </Card>
            </div>

            <Card className="bg-slate-900/40 border-slate-800">
                <CardHeader className="border-b border-slate-800/50 pb-3">
                    <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tasked ISR Missions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/50">
                                <th className="text-left py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Asset Type</th>
                                <th className="text-left py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Status</th>
                                <th className="text-left py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Priority</th>
                                <th className="text-left py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter">ETA / TOT</th>
                                <th className="text-left py-3 px-4 text-[9px] font-black text-slate-500 uppercase tracking-tighter">Requirements</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                            {request.assetType === 'IMINT' ? <Satellite size={14} className="text-blue-500" /> :
                                                request.assetType === 'SIGINT' ? <Radio size={14} className="text-emerald-500" /> :
                                                    <Users size={14} className="text-amber-500" />}
                                            <span className="text-[11px] font-black text-slate-200 uppercase">{request.assetType}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase",
                                            request.status === 'In-Orbit' ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" :
                                                request.status === 'Tasked' ? "text-blue-500 border-blue-500/20 bg-blue-500/5" :
                                                    "text-slate-500 border-slate-800"
                                        )}>
                                            {request.status}
                                        </Badge>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className={cn(
                                            "text-[9px] font-black uppercase",
                                            request.priority === 'Critical' ? "text-red-500" :
                                                request.priority === 'High' ? "text-orange-500" : "text-slate-500"
                                        )}>{request.priority}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-slate-300">{new Date(request.eta).toLocaleTimeString()}</span>
                                            <span className="text-[8px] font-bold text-slate-600 uppercase">[{new Date(request.eta).toLocaleDateString()}]</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <p className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-sm">{request.requirements}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            <div className="bg-slate-900/40 border border-slate-800 rounded p-4 flex gap-4 items-start">
                <div className="p-2 rounded bg-blue-500/10">
                    <AlertCircle size={16} className="text-blue-400" />
                </div>
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Intelligence Gap Warning</h4>
                    <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                        Last visual confirmation for objective area T-1001 was 24.5 hours ago. SIGINT suggests movement but IMINT is degraded by cloud cover. Recommend tasking additional SAR (Synthetic Aperture Radar) assets to maintain target track.
                    </p>
                </div>
            </div>
        </div>
    );
};
