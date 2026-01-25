import { useState } from 'react';
import { Globe, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOperationalContext } from '@/lib/smartops/hooks/useOperationalContext';
import { PoliticalStatementsView } from '@/features/shared/context/PoliticalStatementsView';

type TabView = 'political' | 'disinfo' | 'environment';

export function ExternalContextDashboard() {
    const { context } = useOperationalContext();
    const [activeTab, setActiveTab] = useState<TabView>('political');

    return (
        <div className="flex flex-col h-full bg-[#020617] text-slate-100 overflow-hidden">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]/50 backdrop-blur-sm">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Globe className="text-blue-400" size={20} />
                        <h1 className="text-xl font-black tracking-tight uppercase">External Environment</h1>
                    </div>
                    <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                        PMESII-PT Context Analysis • {context.name}
                    </p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900/30 px-6">
                <button
                    onClick={() => setActiveTab('political')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                        activeTab === 'political'
                            ? "border-blue-500 text-blue-400 bg-blue-500/5"
                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <Globe size={16} />
                    Political
                </button>
                <button
                    onClick={() => setActiveTab('disinfo')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                        activeTab === 'disinfo'
                            ? "border-purple-500 text-purple-400 bg-purple-500/5"
                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <Zap size={16} />
                    Information & Disinfo
                </button>
                <button
                    onClick={() => setActiveTab('environment')}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                        activeTab === 'environment'
                            ? "border-amber-500 text-amber-400 bg-amber-500/5"
                            : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5"
                    )}
                >
                    <AlertTriangle size={16} />
                    Environment & Civil
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-auto p-6 relative">
                <div className="max-w-7xl mx-auto space-y-6">
                    {activeTab === 'political' && (
                        <PoliticalStatementsView />
                    )}

                    {activeTab === 'disinfo' && (
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                                <Zap className="mx-auto text-slate-700 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-slate-400 uppercase">Information Environment</h3>
                                <p className="text-slate-500 mt-2">Monitoring disinformation campaigns, fake media, and narrative control.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'environment' && (
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/20">
                                <AlertTriangle className="mx-auto text-slate-700 mb-4" size={48} />
                                <h3 className="text-lg font-bold text-slate-400 uppercase">Physical Environment</h3>
                                <p className="text-slate-500 mt-2">Tracking natural disasters, weather impacts, and critical infrastructure status.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
