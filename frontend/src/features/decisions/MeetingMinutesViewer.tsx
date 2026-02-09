import { useState, useEffect } from 'react';
import {
    FileText,
    Users,
    CheckCircle,
    Clock,
    Lightbulb,
    Tag,
    ChevronDown,
    ChevronUp,
    Loader2,
    Shield
} from 'lucide-react';
import { MeetingsApi } from '@/lib/mshnctrl/api/meetings.api';
import type { MeetingMinutes } from '@/lib/mshnctrl/api/meetings.api';
import { cn } from '@/lib/utils';

// Mock data for fallback when API returns no minutes
const MOCK_MINUTES: MeetingMinutes = {
    id: 'mock-min-001',
    meeting_id: 'mock-meeting',
    attendees: ['J2 Chief', 'J3 Chief', 'J5 Chief', 'LEGAD', 'Targeting Cell Lead'],
    discussion_summary:
        'Reviewed current targeting priorities and ROE compliance status. J2 briefed on updated threat assessment for AO NORTH. ' +
        'J3 confirmed strike packages are aligned with commander\'s intent. LEGAD raised concerns regarding proportionality analysis for TST-2401. ' +
        'Decision to defer TST-2401 pending additional collateral damage estimate.',
    recorded_by: 'J3 Staff Officer',
    recorded_at: new Date().toISOString(),
    classification: 'SECRET',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    action_items: [
        { id: 'ai-1', minutes_id: 'mock-min-001', task: 'Update CDE for TST-2401 with revised population density data', assigned_to: 'J2 Intel', due_date: '2026-02-11', status: 'OPEN' },
        { id: 'ai-2', minutes_id: 'mock-min-001', task: 'Coordinate SEAD package for northern corridor operations', assigned_to: 'J3 Ops', due_date: '2026-02-10', status: 'OPEN' },
        { id: 'ai-3', minutes_id: 'mock-min-001', task: 'Distribute updated ROE matrix to all subordinate commands', assigned_to: 'LEGAD', due_date: '2026-02-09', status: 'COMPLETE' },
    ],
    lessons_learned: [
        { id: 'll-1', minutes_id: 'mock-min-001', content: 'Early LEGAD involvement in targeting cycle reduces approval bottlenecks by ~40%', category: 'Process' },
        { id: 'll-2', minutes_id: 'mock-min-001', content: 'SAM threat reassessment should trigger automatic SEAD review', category: 'Tactical' },
    ],
};

interface MeetingMinutesViewerProps {
    meetingId: string;
    meetingTitle?: string;
}

export function MeetingMinutesViewer({ meetingId, meetingTitle }: MeetingMinutesViewerProps) {
    const [minutes, setMinutes] = useState<MeetingMinutes | null>(null);
    const [loading, setLoading] = useState(true);
    const [usingMock, setUsingMock] = useState(false);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        async function loadMinutes() {
            setLoading(true);
            try {
                const result = await MeetingsApi.getMinutes(meetingId);
                if (result) {
                    setMinutes(result);
                    setUsingMock(false);
                } else {
                    setMinutes({ ...MOCK_MINUTES, meeting_id: meetingId });
                    setUsingMock(true);
                }
            } catch {
                setMinutes({ ...MOCK_MINUTES, meeting_id: meetingId });
                setUsingMock(true);
            } finally {
                setLoading(false);
            }
        }
        loadMinutes();
    }, [meetingId]);

    if (loading) {
        return (
            <div className="p-6 flex items-center gap-3 text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest">Loading minutes...</span>
            </div>
        );
    }

    if (!minutes) {
        return (
            <div className="p-8 border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-600 text-center">
                <FileText size={32} className="mb-2 opacity-10" />
                <span className="text-[10px] font-black uppercase tracking-widest">No Minutes Recorded</span>
            </div>
        );
    }

    const openItems = minutes.action_items.filter(ai => ai.status === 'OPEN').length;
    const completeItems = minutes.action_items.filter(ai => ai.status === 'COMPLETE').length;

    return (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
            {/* Classification Banner */}
            {minutes.classification && (
                <div className={cn(
                    "w-full py-1.5 px-4 text-center font-black uppercase tracking-widest text-[9px]",
                    minutes.classification === 'SECRET' ? "bg-orange-600 text-white" :
                    minutes.classification === 'TOP_SECRET' ? "bg-red-600 text-white" :
                    minutes.classification === 'TS_SCI' ? "bg-red-800 text-white" :
                    "bg-green-700 text-white"
                )}>
                    <div className="flex items-center justify-center gap-2">
                        <Shield size={10} />
                        {minutes.classification.replace('_', '/')}
                    </div>
                </div>
            )}

            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 border-b border-slate-800 flex items-center justify-between hover:bg-slate-900/80 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <FileText size={16} className="text-blue-400" />
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                        Meeting Minutes
                    </h3>
                    {meetingTitle && (
                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-48">
                            {meetingTitle}
                        </span>
                    )}
                    {usingMock && (
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Sample Data
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                        <Clock size={10} />
                        {new Date(minutes.recorded_at).toLocaleDateString()}
                    </div>
                    {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                </div>
            </button>

            {expanded && (
                <div className="p-6 space-y-6">
                    {/* Attendees */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Users size={14} className="text-blue-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Attendees ({minutes.attendees.length})
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {minutes.attendees.map((attendee, i) => (
                                <span
                                    key={i}
                                    className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-1 rounded uppercase"
                                >
                                    {attendee}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Discussion Summary */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={14} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Discussion Summary
                            </span>
                        </div>
                        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-4">
                            <p className="text-xs text-slate-300 leading-relaxed">
                                {minutes.discussion_summary}
                            </p>
                        </div>
                        <div className="mt-2 text-[9px] text-slate-600 font-bold uppercase">
                            Recorded by: <span className="text-slate-400">{minutes.recorded_by}</span>
                        </div>
                    </div>

                    {/* Action Items */}
                    {minutes.action_items.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={14} className="text-amber-400" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Action Items ({minutes.action_items.length})
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] font-bold uppercase">
                                    <span className="text-amber-400">{openItems} Open</span>
                                    <span className="text-emerald-400">{completeItems} Complete</span>
                                </div>
                            </div>
                            <div className="border border-slate-800 rounded-lg overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-950 border-b border-slate-800">
                                            <th className="text-left px-4 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Task</th>
                                            <th className="text-left px-4 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Assigned To</th>
                                            <th className="text-left px-4 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Due Date</th>
                                            <th className="text-left px-4 py-2.5 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {minutes.action_items.map((item) => (
                                            <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-300 font-medium max-w-xs">
                                                    {item.task}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-[9px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded uppercase">
                                                        {item.assigned_to}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">
                                                    {item.due_date || '--'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "text-[8px] font-black px-2 py-0.5 rounded border uppercase",
                                                        item.status === 'COMPLETE'
                                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    )}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Lessons Learned */}
                    {minutes.lessons_learned.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb size={14} className="text-cyan-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Lessons Learned ({minutes.lessons_learned.length})
                                </span>
                            </div>
                            <div className="space-y-2">
                                {minutes.lessons_learned.map((lesson) => (
                                    <div
                                        key={lesson.id}
                                        className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 flex items-start gap-3"
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-300 leading-relaxed">
                                                {lesson.content}
                                            </p>
                                        </div>
                                        {lesson.category && (
                                            <span className="flex items-center gap-1 text-[8px] font-black text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase shrink-0">
                                                <Tag size={8} />
                                                {lesson.category}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
