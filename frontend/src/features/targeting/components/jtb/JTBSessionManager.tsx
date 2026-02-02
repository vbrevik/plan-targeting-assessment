import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';
import type { JtbSession } from '@/lib/mshnctrl/api/targeting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Clock, User, Users, ShieldAlert } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export const JTBSessionManager: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<JtbSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // New Session Form State
    const [newSession, setNewSession] = useState({
        sessionName: '',
        sessionDate: new Date().toISOString().split('T')[0],
        sessionTime: '14:00',
        chair: '',
        chairRank: 'OF-5',
        classification: 'SECRET//NATO SECRET',
        requiredAttendees: ['J2', 'J3', 'LEGAD', 'POLAD']
    });

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await targetingApi.getJtbSessions();
            setSessions(data);
        } catch (error) {
            console.error("Failed to load JTB sessions", error);
            toast({
                title: "Error",
                description: "Failed to load JTB sessions. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            // Combine date and time for ISO string
            const datetime = `${newSession.sessionDate}T${newSession.sessionTime}:00Z`;

            await targetingApi.createJtbSession({
                session_name: newSession.sessionName,
                session_date: newSession.sessionDate,
                session_time: newSession.sessionTime,
                session_datetime: datetime,
                chair: newSession.chair,
                chair_rank: newSession.chairRank,
                required_attendees: newSession.requiredAttendees,
                classification: newSession.classification,
                caveats: ['NOFORN'] // Default caveat
            });

            toast({
                title: "Success",
                description: "JTB Session scheduled successfully.",
            });

            setIsCreateOpen(false);
            loadSessions();
        } catch (error) {
            console.error("Failed to create session", error);
            toast({
                title: "Error",
                description: "Failed to create session.",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'scheduled') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if (normalizedStatus === 'in progress') return 'bg-green-500/10 text-green-500 border-green-500/20';
        if (normalizedStatus === 'completed') return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
        if (normalizedStatus === 'cancelled') return 'bg-red-500/10 text-red-500 border-red-500/20';
        return 'bg-zinc-500/10 text-zinc-500';
    };

    const parseAttendees = (attendees?: string): number => {
        if (!attendees) return 0;
        try {
            // Try parsing as JSON array
            const parsed = JSON.parse(attendees);
            if (Array.isArray(parsed)) return parsed.length;
            return 1;
        } catch {
            // Fallback to comma separated
            return attendees.split(',').length;
        }
    };

    return (
        <div className="space-y-6 p-6 bg-slate-950 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6 text-blue-500" />
                        Joint Targeting Board
                    </h2>
                    <p className="text-slate-400">Manage execution cycles and target validation sessions</p>
                </div>

                <div className="flex items-center gap-4">
                    <SecurityBadge level="SECRET" caveats={['NOFORN']} />
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-wider">
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule Session
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-white">
                            <DialogHeader>
                                <DialogTitle className="uppercase tracking-wide">Schedule New JTB Session</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Date</Label>
                                        <Input
                                            type="date"
                                            className="bg-slate-950 border-slate-800"
                                            value={newSession.sessionDate}
                                            onChange={e => setNewSession({ ...newSession, sessionDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Time</Label>
                                        <Input
                                            type="time"
                                            className="bg-slate-950 border-slate-800"
                                            value={newSession.sessionTime}
                                            onChange={e => setNewSession({ ...newSession, sessionTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400">Session Name</Label>
                                    <Input
                                        className="bg-slate-950 border-slate-800"
                                        placeholder="e.g., Weekly JTB - Cycle 24-05"
                                        value={newSession.sessionName}
                                        onChange={e => setNewSession({ ...newSession, sessionName: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Chair</Label>
                                        <Input
                                            className="bg-slate-950 border-slate-800"
                                            placeholder="Name"
                                            value={newSession.chair}
                                            onChange={e => setNewSession({ ...newSession, chair: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Rank</Label>
                                        <Select
                                            value={newSession.chairRank}
                                            onValueChange={(v: string) => setNewSession({ ...newSession, chairRank: v })}
                                        >
                                            <SelectTrigger className="bg-slate-950 border-slate-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                                <SelectItem value="OF-4">OF-4 (LtCol)</SelectItem>
                                                <SelectItem value="OF-5">OF-5 (Col)</SelectItem>
                                                <SelectItem value="OF-6">OF-6 (BrigGen)</SelectItem>
                                                <SelectItem value="OF-7">OF-7 (MajGen)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-slate-400">Classification</Label>
                                    <Select
                                        value={newSession.classification}
                                        onValueChange={(v: string) => setNewSession({ ...newSession, classification: v })}
                                    >
                                        <SelectTrigger className="bg-slate-950 border-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-700 text-white">
                                            <SelectItem value="UNCLASSIFIED">UNCLASSIFIED</SelectItem>
                                            <SelectItem value="RESTRICTED">RESTRICTED</SelectItem>
                                            <SelectItem value="SECRET//NATO SECRET">SECRET//NATO SECRET</SelectItem>
                                            <SelectItem value="TOP SECRET">TOP SECRET</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="hover:bg-slate-800 hover:text-white">Cancel</Button>
                                <Button onClick={handleCreateSession} className="bg-blue-600 hover:bg-blue-700">Create Session</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Clock className="w-10 h-10 mb-4 animate-spin opacity-50" />
                    <p>Loading sessions...</p>
                </div>
            ) : sessions.length === 0 ? (
                <Card className="border-dashed border-slate-800 bg-slate-900/50">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                        <Calendar className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-white mb-1">No Sessions Scheduled</h3>
                        <p>Create a new JTB session to begin.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sessions.map(session => (
                        <Card
                            key={session.id}
                            className="bg-slate-900 border-slate-800 cursor-pointer hover:border-blue-500/50 transition-all group"
                            onClick={() => navigate({ to: `/mshnctrl/targeting/jtb/${session.id}` })}
                        >
                            <CardHeader className="pb-3 border-b border-slate-800/50">
                                <div className="flex flex-row items-center justify-between">
                                    <div className={`px-2 py-0.5 text-[10px] font-black uppercase rounded tracking-wider border ${getStatusColor(session.status)}`}>
                                        {session.status}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 uppercase">
                                        {session.classification.includes('//') ? session.classification.split('//')[1] : session.classification}
                                    </div>
                                </div>
                                <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mt-2">
                                    {session.session_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3 text-sm text-slate-400">
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-3 text-slate-500" />
                                        <span className="font-mono">{session.session_date}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-3 text-slate-500" />
                                        <span className="font-mono">{session.session_time} Z</span>
                                    </div>
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-3 text-slate-500" />
                                        <span>{session.chair_rank} {session.chair}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 mr-3 text-slate-500" />
                                        <span>{parseAttendees(session.required_attendees)} Required Attendees</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
