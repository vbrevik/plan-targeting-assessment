import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RoeApi, type Roe, type CreateRoeRequest } from '@/lib/mshnctrl/api/roe';
import { Shield, Plus, XCircle } from 'lucide-react';
import { SecurityBadge } from '@/components/SecurityBadge';

export function ROEManagementPanel() {
    const [roes, setRoes] = useState<Roe[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newRoe, setNewRoe] = useState<Partial<CreateRoeRequest>>({
        roe_type: 'MISSION_SPECIFIC',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadRoes();
    }, []);

    const loadRoes = async () => {
        try {
            setLoading(true);
            const data = await RoeApi.getActiveRoes();
            setRoes(data);
        } catch (error) {
            console.error('Failed to load ROEs', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await RoeApi.createRoe({
                name: newRoe.name!,
                description: newRoe.description!,
                roe_type: newRoe.roe_type as any,
                status: 'ACTIVE',
                created_by: 'CURRENT_USER' // TODO: Get from auth context
            });
            setShowForm(false);
            setNewRoe({ roe_type: 'MISSION_SPECIFIC', status: 'ACTIVE' });
            loadRoes();
        } catch (error) {
            console.error('Failed to create ROE', error);
        }
    };

    const typeColors = {
        STANDING: 'text-blue-400 bg-blue-950/30 border-blue-900',
        MISSION_SPECIFIC: 'text-amber-400 bg-amber-950/30 border-amber-900',
        SELF_DEFENSE: 'text-red-400 bg-red-950/30 border-red-900',
    };

    return (
        <Card className="bg-slate-900 border-slate-800 h-full flex flex-col">
            <CardHeader className="border-b border-slate-800 py-3 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-sm font-black uppercase text-white tracking-wider">
                        Rules of Engagement
                    </CardTitle>
                </div>
                <div className="flex items-center gap-3">
                    <SecurityBadge level="SECRET" size="sm" />
                    <Button
                        size="sm"
                        onClick={() => setShowForm(!showForm)}
                        className="h-7 text-[10px] uppercase font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700"
                    >
                        <Plus size={14} className="mr-1" /> Add Rule
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto p-4 space-y-4">
                {showForm && (
                    <form onSubmit={handleCreate} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3 mb-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xs font-bold text-white uppercase">New ROE Definition</h4>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-slate-700"
                                onClick={() => setShowForm(false)}
                            >
                                <XCircle size={14} />
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Rule Name</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                                    placeholder="e.g., PID-REQ-001"
                                    value={newRoe.name || ''}
                                    onChange={e => setNewRoe({ ...newRoe, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Type</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none"
                                    value={newRoe.roe_type}
                                    onChange={e => setNewRoe({ ...newRoe, roe_type: e.target.value as any })}
                                >
                                    <option value="STANDING">Standing (SROE)</option>
                                    <option value="MISSION_SPECIFIC">Mission Specific</option>
                                    <option value="SELF_DEFENSE">Self Defense</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Description / Constraints</label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:border-emerald-500 outline-none min-h-[60px]"
                                placeholder="Describe the constraints..."
                                value={newRoe.description || ''}
                                onChange={e => setNewRoe({ ...newRoe, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold">
                                Create Rule
                            </Button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="text-center py-10 text-slate-500 text-xs animate-pulse">Loading Rules...</div>
                ) : roes.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">No Active Rules of Engagement found.</div>
                ) : (
                    <div className="space-y-3">
                        {roes.map(roe => (
                            <div key={roe.id} className="bg-slate-950/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${typeColors[roe.roe_type as keyof typeof typeColors] || 'text-slate-400 border-slate-800'}`}>
                                            {roe.roe_type.replace('_', ' ')}
                                        </div>
                                        <span className="text-sm font-bold text-white">{roe.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-mono">{new Date(roe.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed pl-1 border-l-2 border-slate-800 group-hover:border-emerald-500/50 transition-colors">
                                    {roe.description}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
