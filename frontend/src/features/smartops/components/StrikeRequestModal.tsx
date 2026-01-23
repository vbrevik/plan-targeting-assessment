import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Crosshair, AlertCircle, ShieldAlert } from 'lucide-react';
import { targetingApi, type Target as ApiTarget } from '@/lib/smartops/api/targeting.api';
import { useToast } from '@/components/ui/use-toast';

interface StrikeRequestModalProps {
    target: ApiTarget;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function StrikeRequestModal({ target, open, onOpenChange, onSuccess }: StrikeRequestModalProps) {
    const { toast } = useToast();
    const [weaponSystem, setWeaponSystem] = useState('');
    const [justification, setJustification] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!weaponSystem || !justification) {
            toast({
                title: "Incomplete Request",
                description: "Both weapon system and justification are required for strike authorization.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            await targetingApi.createStrikeRequest({
                target_id: target.id,
                requesting_unit: 'J3-FIRES', // Should come from user context
                requested_platform: weaponSystem,
                justification: justification,
                priority: priority,
                status: 'PENDING',
                classification: target.classification || 'SECRET'
            });

            toast({
                title: "Strike Requested",
                description: `Engagement for ${target.name} has been submitted to current JCO cycle.`,
            });
            onSuccess();
            onOpenChange(false);

            // Reset form
            setWeaponSystem('');
            setJustification('');
            setPriority('MEDIUM');
        } catch (error) {
            console.error('Strike request failed:', error);
            toast({
                title: "Request Failed",
                description: "Failed to submit strike request. Check system connectivity.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                            <Crosshair size={20} className="text-red-500" />
                        </div>
                        <DialogTitle className="text-xl font-black text-white uppercase tracking-tight">Strike Authorization</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400 text-xs">
                        Prepare and submit engagement request for target <span className="text-red-500 font-mono font-bold">{target.name}</span>.
                        This action will be logged in the permanent audit trail.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="p-3 bg-red-950/20 border border-red-500/30 rounded flex gap-3">
                        <ShieldAlert size={18} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <span className="text-[10px] font-black text-red-500 uppercase block">ROE Validation</span>
                            <p className="text-[10px] text-slate-300 italic">Self-Defense & Mission Necessity (ROE-421) Released and Active.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Priority</label>
                                <select
                                    className="w-full h-9 bg-slate-900 border border-slate-800 text-white text-xs rounded px-3 focus:outline-none focus:border-red-500/50"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requested Platform</label>
                                <Input
                                    placeholder="e.g. F-16 Block 50"
                                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-700 font-sans text-xs h-9"
                                    value={weaponSystem}
                                    onChange={(e) => setWeaponSystem(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Justification</label>
                            <Textarea
                                placeholder="Provide mission-critical rationale for engagement..."
                                className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-700 min-h-[100px] text-xs resize-none"
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded flex gap-3">
                        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed">
                            Submitting this request will update target status to <span className="text-white">ENGAGED</span> (pending approval) and trigger BDA reqs.
                        </span>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white uppercase text-[10px] font-black">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white uppercase text-[10px] font-black shadow-lg shadow-red-900/40"
                    >
                        {loading ? 'Processing...' : 'Authorize & Engage'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

