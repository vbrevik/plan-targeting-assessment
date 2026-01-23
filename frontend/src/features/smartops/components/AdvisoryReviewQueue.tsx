import { useState } from 'react';
import { ShieldCheck, Scale, Globe, AlertTriangle, CheckCircle2, XCircle, Info, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface AdvisoryAction {
    id: string;
    type: 'TARGET' | 'ROE' | 'PLAN' | 'EFFECT';
    title: string;
    submittedBy: string;
    timestamp: string;
    legalStatus: 'PENDING' | 'CLEAR' | 'CAUTION' | 'OBJECT';
    politicalStatus: 'PENDING' | 'CLEAR' | 'CAUTION' | 'OBJECT';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const MOCK_ACTIONS: AdvisoryAction[] = [
    {
        id: 'ADV-001',
        type: 'TARGET',
        title: 'T-1001 (Command Bunker Alpha)',
        submittedBy: 'Targeting Cell',
        timestamp: '2026-01-07 10:15',
        legalStatus: 'PENDING',
        politicalStatus: 'PENDING',
        priority: 'HIGH'
    },
    {
        id: 'ADV-002',
        type: 'ROE',
        title: 'Expansion of Self-Defense Criteria in Sector North',
        submittedBy: 'J3 Ops',
        timestamp: '2026-01-07 09:30',
        legalStatus: 'CLEAR',
        politicalStatus: 'PENDING',
        priority: 'HIGH'
    },
    {
        id: 'ADV-003',
        type: 'EFFECT',
        title: 'Cyber Degradation of Power Grid (Limited)',
        submittedBy: 'Cyber Cell',
        timestamp: '2026-01-07 11:00',
        legalStatus: 'CAUTION',
        politicalStatus: 'CAUTION',
        priority: 'MEDIUM'
    }
];

export function AdvisoryReviewQueue() {
    const [actions, setActions] = useState<AdvisoryAction[]>(MOCK_ACTIONS);
    const { toast } = useToast();

    const handleAction = (id: string, advisor: 'LEGAD' | 'POLAD', status: 'CLEAR' | 'OBJECT') => {
        setActions(prev => prev.map(a => {
            if (a.id === id) {
                return {
                    ...a,
                    [advisor === 'LEGAD' ? 'legalStatus' : 'politicalStatus']: status
                };
            }
            return a;
        }));

        toast({
            title: "Review Submitted",
            description: `${advisor} recommendation for ${id} set to ${status}.`
        });
    };

    return (
        <div className="p-6 space-y-6 bg-slate-950 min-h-full">
            <header className="flex justify-between items-center bg-slate-900 p-4 border border-slate-800 rounded-lg shadow-xl">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Scale className="text-blue-500" /> Advisory & Governance Queue
                    </h1>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">LEGAD / POLAD Operational Review</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 gap-2">
                        <Filter size={14} /> Filter Queue
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-blue-400">Total Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{actions.filter(a => a.legalStatus === 'PENDING' || a.politicalStatus === 'PENDING').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-amber-400">Legal Cautions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{actions.filter(a => a.legalStatus === 'CAUTION').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase text-red-500">Political Risks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">{actions.filter(a => a.politicalStatus === 'CAUTION').length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">ID / Type</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Proposed Action</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">LEGAD Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">POLAD Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {actions.map(action => (
                            <tr key={action.id} className="hover:bg-slate-800/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-blue-400">{action.id}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{action.type}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{action.title}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-medium">By {action.submittedBy} • {action.timestamp}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={action.legalStatus} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={action.politicalStatus} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <div className="flex flex-col gap-1 border-r border-slate-800 pr-2">
                                            <span className="text-[9px] font-black text-slate-600 uppercase">LEGAD</span>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500 hover:text-white" onClick={() => handleAction(action.id, 'LEGAD', 'CLEAR')}>
                                                    <CheckCircle2 size={14} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white" onClick={() => handleAction(action.id, 'LEGAD', 'OBJECT')}>
                                                    <XCircle size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1 pl-1">
                                            <span className="text-[9px] font-black text-slate-600 uppercase">POLAD</span>
                                            <div className="flex gap-1">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-500 bg-blue-500/10 hover:bg-blue-500 hover:text-white" onClick={() => handleAction(action.id, 'POLAD', 'CLEAR')}>
                                                    <ShieldCheck size={14} />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-500 bg-amber-500/10 hover:bg-amber-500 hover:text-white" onClick={() => handleAction(action.id, 'POLAD', 'OBJECT')}>
                                                    <AlertTriangle size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                            <Scale size={16} className="text-blue-500" /> LEGAD Guidance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-blue-500 ml-2">
                        "Ensure all target nominations follow the principles of Distinction, Proportionality, and Military Necessity. No dynamic engagement without positively identified non-combatant status (NCS)."
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-slate-800 text-white">
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                            <Globe size={16} className="text-emerald-500" /> Strategic Narrative Shift
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 leading-relaxed italic border-l-2 border-emerald-500 ml-2">
                        "Maintain focus on de-escalation signaling. Kinetic effects in Sector North may trigger unwanted diplomatic responses from non-aligned neighboring states."
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: AdvisoryAction['legalStatus'] }) {
    const configs = {
        PENDING: { label: 'PENDING', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: Info },
        CLEAR: { label: 'CLEARED', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: CheckCircle2 },
        CAUTION: { label: 'CAUTION', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: AlertTriangle },
        OBJECT: { label: 'OBJECTED', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircle }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <Badge className={cn("flex w-fit items-center gap-1.5 px-2 py-0.5 border text-[9px] font-black uppercase tracking-tight shadow-sm", config.color)}>
            <Icon size={10} />
            {config.label}
        </Badge>
    );
}
