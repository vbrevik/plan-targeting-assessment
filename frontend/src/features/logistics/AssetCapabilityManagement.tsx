// NATO COPD Component 5: Asset & Capability Management
// Strike platform availability, munitions inventory, weather factors, deconfliction
// Now with drill-down navigation to detail views

import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plane, Zap, Cloud, Radio, Package, TrendingUp, Wifi, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SecurityBadge } from '@/components/SecurityBadge';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';

interface StrikePlatform {
  id: string;
  name: string;
  type: string; // Dynamic from Ontology
  status: 'READY' | 'TASKED' | 'MAINTENANCE';
  sortiesAvailable: number;
  munitions: Array<{
    type: string;
    count: number;
    range: number;
  }>;
}

interface WeatherConditions {
  status: 'GREEN' | 'YELLOW' | 'RED';
  visibility: number;
  cloudCeiling: number;
  windSpeed: number;
  impact: string;
}

interface Deconfliction {
  totalAirspaces: number;
  conflicts: number;
  resolved: number;
  pending: number;
}

export function AssetCapabilityManagement() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<StrikePlatform[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [strikePlatforms, _schema] = await Promise.all([
          targetingApi.getStrikePlatforms().catch(() => []),
          targetingApi.getOntologySchema().catch(() => null),
        ]);

        // Transform to component format
        const transformed: StrikePlatform[] = strikePlatforms.map((p) => {
          // Parse munitions from JSON field
          let munitions: Array<{ type: string; count: number; range: number }> = [];
          if (p.munitions_available) {
            try {
              const parsed = JSON.parse(p.munitions_available);
              if (Array.isArray(parsed)) {
                munitions = parsed.map((m: any) => ({
                  type: m.type || m.munition_type || 'Unknown',
                  count: m.count || m.available_count || 0,
                  range: m.range || m.range_km || 0,
                }));
              } else if (typeof parsed === 'object') {
                // Handle object format if needed
                munitions = Object.entries(parsed).map(([type, data]: [string, any]) => ({
                  type,
                  count: data?.count || data?.available_count || 0,
                  range: data?.range || data?.range_km || 0,
                }));
              }
            } catch (err) {
              console.warn('Failed to parse munitions_available JSON:', err);
              munitions = [];
            }
          }

          return {
            id: p.id,
            name: p.platform_name,
            type: p.platform_type as any,
            status: p.platform_status as any,
            sortiesAvailable: p.sorties_available,
            munitions,
          };
        });
        setPlatforms(transformed);
      } catch (err) {
        console.error('Failed to fetch strike platforms:', err);
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Use real platforms if available, otherwise fallback to mock including non-kinetic
  const activePlatforms: StrikePlatform[] = platforms.length > 0 ? platforms : [
    {
      id: 'PLAT-101', name: 'F-35A Lightning II', type: 'FIGHTER', status: 'READY', sortiesAvailable: 4,
      munitions: [{ type: 'GBU-31 JDAM', count: 2, range: 28 }, { type: 'AIM-120D', count: 4, range: 160 }]
    },
    {
      id: 'PLAT-102', name: 'Offensive Cyber Team 7', type: 'CYBER', status: 'READY', sortiesAvailable: 1,
      munitions: [{ type: 'Network Exploit', count: 5, range: 0 }, { type: 'Data Exfil Kit', count: 2, range: 0 }]
    },
    {
      id: 'PLAT-103', name: 'EA-18G Growler', type: 'EW', status: 'READY', sortiesAvailable: 2,
      munitions: [{ type: 'ALQ-99 Jammer', count: 3, range: 100 }]
    },
    {
      id: 'PLAT-104', name: 'PSYOP Unit 4', type: 'PSYOP', status: 'READY', sortiesAvailable: 1,
      munitions: [{ type: 'Narrative Payload', count: 10, range: 0 }]
    }
  ];

  const weather: WeatherConditions = {
    status: 'GREEN',
    visibility: 25,
    cloudCeiling: 3000,
    windSpeed: 10,
    impact: 'No impact on air operations'
  };

  const deconfliction: Deconfliction = {
    totalAirspaces: 12,
    conflicts: 1,
    resolved: 3,
    pending: 1
  };


  return (
    <div className="space-y-6">
      {platforms.length === 0 && !loading && (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl">
          <Plane className="w-12 h-12 text-slate-700 mx-auto mb-4 opacity-20" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Active Strike Assets Tracked</p>
        </div>
      )}

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Weather */}
        <div className={cn(
          "bg-slate-950 border-2 rounded-[2rem] p-6 transition-all relative overflow-hidden",
          weather.status === 'GREEN' ? "border-emerald-900/50 hover:border-emerald-500/30" :
            weather.status === 'YELLOW' ? "border-amber-900/50 hover:border-amber-500/30" :
              "border-red-900/50 hover:border-red-500/30"
        )}>
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Cloud size={80} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              weather.status === 'GREEN' ? "bg-emerald-600/10 text-emerald-500 border-emerald-500/20" :
                weather.status === 'YELLOW' ? "bg-amber-600/10 text-amber-500 border-amber-500/20" :
                  "bg-red-600/10 text-red-500 border-red-500/20"
            )}>
              <Cloud size={20} />
            </div>
            <div className={cn(
              "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded",
              weather.status === 'GREEN' ? "bg-emerald-500/10 text-emerald-500" :
                weather.status === 'YELLOW' ? "bg-amber-500/10 text-amber-500" :
                  "bg-red-500/10 text-red-500"
            )}>
              {weather.status}
            </div>
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Environmental Scan</div>
          <div className="text-2xl font-black text-white italic truncate">{weather.impact}</div>
          <div className="mt-4 flex gap-2 text-[10px] font-mono text-slate-500">
            <span>VIS: {weather.visibility}KM</span>
            <span>•</span>
            <span>CEIL: {weather.cloudCeiling}FT</span>
          </div>
        </div>

        {/* Deconfliction */}
        <div className={cn(
          "bg-slate-950 border-2 rounded-[2rem] p-6 transition-all relative overflow-hidden",
          deconfliction.conflicts > 0 ? "border-red-900/50 hover:border-red-500/30" : "border-emerald-900/50 hover:border-emerald-500/30"
        )}>
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Radio size={80} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              deconfliction.conflicts > 0 ? "bg-red-600/10 text-red-500 border-red-500/20" : "bg-emerald-600/10 text-emerald-500 border-emerald-500/20"
            )}>
              <Radio size={20} />
            </div>
            {deconfliction.conflicts > 0 && <TrendingUp size={16} className="text-red-500 rotate-45" />}
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Airspace Deconfliction</div>
          <div className="text-4xl font-black text-white">
            {deconfliction.conflicts > 0 ? `${deconfliction.conflicts} CONFLICTS` : "CLEAR"}
          </div>
          <div className="mt-4 flex gap-1 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${(deconfliction.resolved / deconfliction.totalAirspaces) * 100}%` }} />
            <div className="bg-amber-500 h-full" style={{ width: `${(deconfliction.pending / deconfliction.totalAirspaces) * 100}%` }} />
          </div>
        </div>

        {/* Forces Ready (Integrated Style) */}
        <button
          onClick={() => navigate({ to: '/mshnctrl/targeting/assets' })}
          className="bg-slate-950 border-2 border-blue-900/50 rounded-[2rem] p-6 transition-all hover:border-blue-500/50 hover:bg-slate-900/50 cursor-pointer text-left relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Plane size={80} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
              <Zap size={20} />
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Force Readiness</div>
          <div className="text-4xl font-black text-white">
            {((platforms.filter(p => p.status === 'READY').length / (platforms.length || 1)) * 100).toFixed(1)}%
          </div>
          <div className="mt-4 flex gap-1 h-1">
            <div className="flex-[0.94] bg-blue-600 rounded-full" />
            <div className="flex-[0.06] bg-slate-800 rounded-full" />
          </div>
        </button>
      </div>

      {/* Strike Platform Inventory */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Package size={16} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Active Platform Inventory</h3>
          </div>
          <SecurityBadge level="SECRET" size="sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => navigate({ to: '/mshnctrl/targeting/assets' })}
              className="group p-5 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all text-left"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                  {platform.type === 'CYBER' ? <Wifi className="w-6 h-6 text-purple-400" /> :
                    platform.type === 'EW' ? <Zap className="w-6 h-6 text-yellow-400" /> :
                      platform.type === 'PSYOP' ? <Users className="w-6 h-6 text-rose-400" /> :
                        platform.type === 'SATELLITE' ? <Radio className="w-6 h-6 text-blue-400" /> :
                          platform.type === 'UAV' ? <Plane className="w-6 h-6 text-emerald-400" /> :
                            <Plane className={cn(
                              "w-6 h-6",
                              platform.status === 'READY' ? "text-emerald-400" : "text-amber-400"
                            )} />}
                </div>
                <div className={cn(
                  "text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-tighter",
                  platform.status === 'READY' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}>
                  {platform.status}
                </div>
              </div>
              <div className="text-sm font-black text-white mb-1">{platform.name}</div>
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-4">
                {platform.type} • {platform.type === 'CYBER' || platform.type === 'PSYOP' || platform.type === 'EW' ? 'FULL CAPABILITY' : `${platform.sortiesAvailable} SORTIES`}
              </div>

              <div className="space-y-2">
                {platform.munitions.length > 0 ? platform.munitions.slice(0, 2).map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">{m.type}</span>
                    <span className="font-mono text-white font-bold">{m.count} {platform.type === 'CYBER' ? 'EXPLOITS' : 'UNITS'}</span>
                  </div>
                )) : (
                  <div className="text-[10px] text-slate-600 italic">No specific munitions listed</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
