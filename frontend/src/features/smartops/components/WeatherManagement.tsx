import {
    CloudLightning,
    CloudRain,
    Sun,
    Wind,
    Thermometer,
    Compass,
    Droplets,
    Activity,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { SmartOpsService } from '@/lib/smartops/mock-service';

export function WeatherManagement() {
    const [report, setReport] = useState<any>(null);
    const [impacts, setImpacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const [r, i] = await Promise.all([
                SmartOpsService.getWeatherReport(),
                SmartOpsService.getWeatherImpacts()
            ]);
            setReport(r);
            setImpacts(i);
            setLoading(false);
        }
        load();
    }, []);

    if (loading || !report) return <div className="p-8 text-slate-500 animate-pulse font-mono text-xs uppercase">Connecting to METOC Satellites...</div>;

    const getWeatherIcon = (condition: string) => {
        switch (condition) {
            case 'Cloudy': return <CloudRain size={48} className="text-blue-400 mb-4" />;
            case 'Storm': return <CloudLightning size={48} className="text-blue-500 mb-4 animate-pulse" />;
            case 'Clear': return <Sun size={48} className="text-yellow-500 mb-4" />;
            default: return <CloudRain size={48} className="text-slate-400 mb-4" />;
        }
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 font-sans overflow-hidden">
            {/* Sidebar - Local Conditions */}
            <div className="w-80 border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 bg-slate-950">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current METOC</h3>
                </div>
                <div className="p-6 space-y-8 overflow-y-auto">
                    <div className="flex flex-col items-center py-6 bg-slate-900/40 rounded-xl border border-slate-800">
                        {getWeatherIcon(report.condition)}
                        <span className="text-4xl font-black text-white">{report.temperature}°C</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{report.condition} // {report.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: Wind, label: 'Wind', val: `${report.windSpeed}kts` },
                            { icon: Droplets, label: 'Humidity', val: `${report.humidity}%` },
                            { icon: Compass, label: 'Dir', val: `${report.windDirection}°` },
                            { icon: Thermometer, label: 'Pressure', val: `${report.pressure}hPa` },
                        ].map((stat, i) => (
                            <div key={i} className="p-3 bg-slate-900/20 border border-slate-800 rounded flex flex-col items-center">
                                <stat.icon size={14} className="text-slate-600 mb-1" />
                                <span className="text-[8px] font-black text-slate-500 uppercase">{stat.label}</span>
                                <span className="text-[11px] font-black text-white">{stat.val}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-slate-800/50">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4">5-Day Operational Forecast</span>
                        <div className="space-y-2">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => (
                                <div key={i} className="flex justify-between items-center px-3 py-2 bg-slate-900/40 rounded border border-slate-800/50">
                                    <span className="text-[10px] font-black text-slate-400">{day}</span>
                                    {i % 2 === 0 ? <Sun size={14} className="text-yellow-500" /> : <CloudRain size={14} className="text-blue-400" />}
                                    <span className="text-[10px] font-mono text-white tracking-widest">{10 + i}° / {6 + i}°</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Impact Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#020617] relative overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex justify-between items-end">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-blue-500" size={20} />
                            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Environmental Services (METOC)</h1>
                        </div>
                        <p className="text-xs text-slate-400 max-w-xl font-medium leading-relaxed">
                            Predicting and quantifying the impact of environmental conditions on multi-domain capabilities.
                            This module provides the environmental constraints for the Operational Digital Twin.
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Operational Constraints */}
                    <div className="space-y-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <AlertTriangle size={14} className="text-yellow-500" /> Operational Constraints
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {impacts.map((item: any) => (
                                <div key={item.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between group hover:border-slate-700 transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-black text-white uppercase tracking-tighter">{item.assetType}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">{item.reason}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn("text-[11px] font-black uppercase tracking-widest",
                                            item.impact === 'Grounded' || item.severity === 'Critical' ? 'text-red-500' :
                                                item.impact === 'Degraded' ? 'text-yellow-500' : 'text-emerald-500'
                                        )}>{item.impact}</span>
                                        <div className="flex gap-1 mt-1 justify-end">
                                            {[1, 2, 3].map(j => (
                                                <div key={j} className={cn("w-1.5 h-1.5 rounded-full",
                                                    item.severity === 'Critical' ? 'bg-red-500' :
                                                        item.severity === 'Medium' && j < 3 ? 'bg-yellow-500' :
                                                            item.severity === 'Low' && j === 1 ? 'bg-emerald-500' : 'bg-slate-800'
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Opportunity Identification */}
                    <div className="space-y-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                            <Target size={14} className="text-emerald-500" /> Strategic Opportunities
                        </h2>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">Optimal Operational Window</span>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <span className="text-2xl font-black text-white">06 JAN</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase block">0200Z - 0800Z</span>
                                </div>
                                <div className="h-10 w-px bg-emerald-500/20" />
                                <p className="text-[11px] text-slate-300 font-medium leading-relaxed max-w-lg">
                                    Decreased cloud cover (under 20%) and moon illumination (85%) provides
                                    <strong> Excellent</strong> conditions for low-altitude infiltration and satellite target verification.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer status */}
                <div className="h-12 border-t border-slate-800 bg-slate-950 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Droplets size={12} className="text-blue-500" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase">FEED: NOAA-REALTIME // SYNC-READY</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Access // METOC-OFFICER</span>
                </div>
            </div>
        </div>
    );
}

function Target({ size, className }: { size: number, className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    );
}
