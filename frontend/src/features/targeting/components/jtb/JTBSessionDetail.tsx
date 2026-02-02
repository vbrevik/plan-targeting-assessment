import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import type { JtbSession, JtbTarget } from '@/lib/mshnctrl/api/targeting';
import type { TargetEntity } from '@/lib/mshnctrl/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Clock, CheckCircle, XCircle, AlertCircle, Gavel, Calendar, ArrowUpRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { SecurityBadge } from '@/components/SecurityBadge';
import { useToast } from "@/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Type for enriched target data
interface EnrichedJtbTarget extends JtbTarget {
    details?: TargetEntity;
}

export const JTBSessionDetail: React.FC = () => {
    // Correct route ID based on file path logic
    const { sessionId } = useParams({ from: '/mshnctrl/targeting/jtb/$sessionId' });
    const navigate = useNavigate();
    const { toast } = useToast();

    const [session, setSession] = useState<JtbSession | null>(null);
    const [targets, setTargets] = useState<EnrichedJtbTarget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (sessionId) {
            loadSessionData();
        }
    }, [sessionId]);

    const loadSessionData = async () => {
        try {
            setLoading(true);

            // Parallel fetch of session and its assigned targets
            const [sessionData, sessionTargets] = await Promise.all([
                targetingApi.getJtbSession(sessionId!),
                targetingApi.getSessionTargets(sessionId!)
            ]);

            setSession(sessionData);

            // Fetch full details for each target to show priority/status/etc
            const enrichedTargets = await Promise.all(
                sessionTargets.map(async (jt) => {
                    try {
                        const details = await targetingApi.getTarget(jt.target_id);
                        return { ...jt, details };
                    } catch (e) {
                        console.warn(`Failed to fetch details for target ${jt.target_id}`, e);
                        return { ...jt };
                    }
                })
            );

            // Sort by presentation order
            enrichedTargets.sort((a, b) => a.presentation_order - b.presentation_order);

            setTargets(enrichedTargets);
        } catch (error) {
            console.error("Failed to load session details", error);
            toast({
                title: "Error",
                description: "Failed to load session details.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRecordDecision = async (jtbTargetId: string, decision: 'APPROVED' | 'REJECTED' | 'PENDING') => {
        try {
            // Find the target from our state to get the target_id (since generic update might want jtb_target_id or junction stuff)
            // The API recordJtbDecision takes (sessionId, targetId, data). 
            // NOTE: The API signature I defined uses `targetId` (the real target ID), 
            // but `jtbTargetId` passed here is likely the JtbTarget.id (junction).
            // Let's look at the implementation of `recordJtbDecision` in my previous step:
            // `put /targeting/jtb/sessions/${sessionId}/targets/${targetId}/decision`
            // The route implies using the Target ID, not the Junction ID. JtbTarget struct has both.

            const target = targets.find(t => t.id === jtbTargetId);
            if (!target) return;

            await targetingApi.recordJtbDecision(sessionId!, target.target_id, {
                decision,
                decision_rationale: "Recorded via JTB Board",
                decided_by: "CURRENT_USER", // TODO: Get from auth context
                votes_for: 1,
                votes_against: 0,
                votes_abstain: 0
            });

            toast({
                title: "Decision Recorded",
                description: `Target marked as ${decision}`,
            });

            loadSessionData(); // Refresh
        } catch (error) {
            console.error("Failed to record decision", error);
            toast({
                title: "Error",
                description: "Failed to record decision.",
                variant: "destructive"
            });
        }
    };

    const parseAttendees = (attendees?: string): string[] => {
        if (!attendees) return [];
        try {
            const parsed = JSON.parse(attendees);
            if (Array.isArray(parsed)) return parsed;
            return [attendees];
        } catch {
            return attendees.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
                <Clock className="w-10 h-10 mb-4 animate-spin opacity-50" />
                <p>Loading session details...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
                <AlertCircle className="w-10 h-10 mb-4 text-red-500" />
                <p>Session not found</p>
                <Button variant="link" onClick={() => navigate({ to: '/mshnctrl/targeting/jtb' })}>Return to Board</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/mshnctrl/targeting/jtb' })} className="text-slate-400 hover:text-white hover:bg-slate-800">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Board
                    </Button>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white uppercase">{session.session_name}</h2>
                        <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                            <Badge variant={session.status === 'Scheduled' ? 'secondary' : 'default'} className="uppercase tracking-wider">
                                {session.status}
                            </Badge>
                            <div className="h-4 w-px bg-slate-700"></div>
                            <span className="font-mono text-xs uppercase">{session.classification}</span>
                        </div>
                    </div>
                </div>
                <SecurityBadge level="SECRET" caveats={['NOFORN']} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white">Target Nomination List</CardTitle>
                        <CardDescription className="text-slate-400">
                            Targets prioritized for this board session
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-slate-900">
                                    <TableHead className="text-slate-400">Order</TableHead>
                                    <TableHead className="text-slate-400">Target</TableHead>
                                    <TableHead className="text-slate-400">Category</TableHead>
                                    <TableHead className="text-slate-400">Priority</TableHead>
                                    <TableHead className="text-slate-400">Board Decision</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {targets.length === 0 ? (
                                    <TableRow className="border-slate-800">
                                        <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                            No targets assigned to this session.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    targets.map((t) => (
                                        <TableRow key={t.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-center text-slate-300">{t.presentation_order}</TableCell>
                                            <TableCell>
                                                <div className="font-bold text-white flex items-center gap-2">
                                                    {t.target_name}
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-500 hover:text-blue-400" onClick={() => navigate({ to: `/mshnctrl/targeting/targets/${t.target_id}` })}>
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono">ID: {t.target_id.substring(0, 8)}...</div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">{t.details?.target_type || 'Unknown'}</TableCell>
                                            <TableCell>
                                                {t.details?.priority && (
                                                    <Badge className={`${t.details.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-200 border-red-800' :
                                                            t.details.priority === 'HIGH' ? 'bg-orange-900/50 text-orange-200 border-orange-800' :
                                                                'bg-slate-800 text-slate-300 border-slate-700'
                                                        } uppercase text-[10px]`}>
                                                        {t.details.priority}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {t.decision === 'APPROVED' && <div className="flex items-center text-green-400 text-xs font-bold uppercase"><CheckCircle className="w-4 h-4 mr-1.5" /> Approved</div>}
                                                    {t.decision === 'REJECTED' && <div className="flex items-center text-red-400 text-xs font-bold uppercase"><XCircle className="w-4 h-4 mr-1.5" /> Rejected</div>}
                                                    {(!t.decision || t.decision === 'PENDING') && <div className="flex items-center text-slate-500 text-xs font-bold uppercase"><Clock className="w-4 h-4 mr-1.5" /> Pending</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {(!t.decision || t.decision === 'PENDING') && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="h-7 bg-green-700 hover:bg-green-600 text-white border border-green-600"
                                                            onClick={() => handleRecordDecision(t.id, 'APPROVED')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-7 bg-red-900/80 hover:bg-red-800 border border-red-800 text-red-100"
                                                            onClick={() => handleRecordDecision(t.id, 'REJECTED')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Session Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" /> Date
                                </span>
                                <span className="font-medium text-white font-mono">{session.session_date}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center">
                                    <Clock className="w-4 h-4 mr-2" /> Time
                                </span>
                                <span className="font-medium text-white font-mono">{session.session_time} Zulu</span>
                            </div>
                            <Separator className="bg-slate-800" />
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center">
                                    <User className="w-4 h-4 mr-2" /> Chair
                                </span>
                                <div className="text-right">
                                    <div className="font-medium text-white">{session.chair}</div>
                                    <div className="text-xs text-slate-500">{session.chair_rank}</div>
                                </div>
                            </div>
                            <Separator className="bg-slate-800" />
                            <div>
                                <span className="text-slate-400 block mb-2">Required Attendees</span>
                                <div className="flex flex-wrap gap-1">
                                    {parseAttendees(session.required_attendees).map((attendee, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs border-slate-700 text-slate-400">
                                            {attendee}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white">Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {/* In a real app, this would open a search modal to add targets */}
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Gavel className="w-4 h-4 mr-2" />
                                Add Target to Session
                            </Button>
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200" onClick={() => navigate({ to: '/mshnctrl/targeting/dtl' })}>
                                View Dynamic Target List
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
