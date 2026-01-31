import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Crosshair, MapPin, AlertTriangle, ArrowLeft, Send } from 'lucide-react';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';

export function TargetNominationPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [category, setCategory] = useState('HPT'); // Map to target_type: HPT, TST, HVT, TGT
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [effect, setEffect] = useState('Neutralize');
    const [priority, setPriority] = useState('HIGH'); // Map to: LOW, MEDIUM, HIGH, CRITICAL
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Map category to target_type
        const targetTypeMap: Record<string, string> = {
            'C2 Node': 'HPT',
            'Logistics Hub': 'HPT',
            'Air Defense (AD)': 'HPT',
            'Mechanized Unit': 'HVT',
            'Infrastructure': 'TGT',
            'Leadership': 'HVT',
        };
        const targetType = targetTypeMap[category] || 'HPT';

        // Map priority to uppercase
        const priorityMap: Record<string, string> = {
            'Critical': 'CRITICAL',
            'High': 'HIGH',
            'Medium': 'MEDIUM',
            'Low': 'LOW',
        };
        const apiPriority = priorityMap[priority] || priority.toUpperCase();

        try {
            const result = await targetingApi.createTarget({
                name: name.toUpperCase(),
                description: description || undefined,
                target_type: targetType,
                priority: apiPriority,
                coordinates: location,
                classification: 'SECRET', // Default classification
            });

            // Navigate to target detail or list
            navigate({ to: `/mshnctrl/targeting/${result.id}` });
        } catch (err: any) {
            console.error('Failed to nominate target:', err);
            setError(err?.message || 'Failed to create target. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden font-sans border-l border-slate-900">
            {/* Header */}
            <div className="h-16 px-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate({ to: '/mshnctrl/targeting' })}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded border border-red-500/20 text-red-500">
                            <Crosshair size={20} />
                        </div>
                        <div>
                            <h1 className="text-sm font-black text-white uppercase tracking-widest leading-none mb-1">Target Nomination</h1>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Joint Target List (JTL) Admission Workflow</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Submission Queue</span>
                        <span className="text-[10px] font-bold text-blue-400">JTB-24 (Active)</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-8 pb-12">

                        {/* Section: Primary Identity */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">01</span>
                                <h2 className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">Primary Target Identity</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Target Name / Designator</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. RADAR SITE ALPHA"
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-red-500/50 focus:bg-slate-900 uppercase transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Category (JDPI Type)</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-red-500/50 focus:bg-slate-900 transition-all appearance-none cursor-pointer"
                                    >
                                        <option>C2 Node</option>
                                        <option>Logistics Hub</option>
                                        <option>Air Defense (AD)</option>
                                        <option>Mechanized Unit</option>
                                        <option>Infrastructure</option>
                                        <option>Leadership</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section: Geo-Spatial Location */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">02</span>
                                <h2 className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">Geo-Spatial Location</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Grid Coordinates (MGRS)</label>
                                    <div className="relative">
                                        <MapPin size={16} className="absolute left-4 top-3.5 text-slate-500" />
                                        <input
                                            type="text"
                                            required
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            placeholder="32U PK 1234 5678"
                                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded pl-12 pr-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900 uppercase transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Nomination Priority</label>
                                    <select
                                        value={priority}
                                        onChange={e => setPriority(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700/50 rounded px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all appearance-none cursor-pointer"
                                    >
                                        <option>CRITICAL</option>
                                        <option>HIGH</option>
                                        <option>MEDIUM</option>
                                        <option>LOW</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Section: Operational Intent */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">03</span>
                                <h2 className="text-[10px] font-black text-white uppercase tracking-widest pt-0.5">Operational Intent</h2>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Desired Operational Effect</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['Neutralize', 'Destroy', 'Disrupt', 'Delay', 'Deceive'].map(eff => (
                                        <button
                                            key={eff}
                                            type="button"
                                            onClick={() => setEffect(eff)}
                                            className={`py-2 text-[10px] font-black uppercase rounded border transition-all ${effect === eff
                                                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20'
                                                : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                                                }`}
                                        >
                                            {eff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Intelligence Summary & Justification</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Provide detailed intelligence justifying why this entity is a valid military objective. Note any collateral damage concerns..."
                                    rows={8}
                                    className="w-full bg-slate-900/30 border border-slate-800 rounded-lg px-4 py-4 text-sm font-medium text-slate-300 focus:outline-none focus:border-red-500/30 focus:bg-slate-900 transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </section>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg">
                                <p className="text-sm text-red-400 font-medium">{error}</p>
                            </div>
                        )}

                        {/* Warning Box */}
                        <div className="p-6 bg-red-950/10 border border-red-900/20 rounded-xl flex items-start gap-5">
                            <div className="p-3 bg-red-500/10 rounded-full text-red-500 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-xs font-black text-red-500 uppercase tracking-widest">LOAC Compliance Declaration</h4>
                                <p className="text-[11px] text-red-400/70 leading-relaxed font-medium">
                                    Nomination implies certification that this entity constitutes a legitimate military objective whose neutralization offers a distinct military advantage. Collateral Damage Estimation (CDE) must be conducted by certified analysts prior to JTB submission.
                                </p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-900">
                            <button
                                type="button"
                                onClick={() => navigate({ to: '/mshnctrl/targeting' })}
                                className="px-6 py-3 text-xs font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest"
                            >
                                Cancel nomination
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-3 px-10 py-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase rounded shadow-2xl shadow-red-900/40 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {isSubmitting ? (
                                    <>Processing submission...</>
                                ) : (
                                    <>
                                        Submit Nomination <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
