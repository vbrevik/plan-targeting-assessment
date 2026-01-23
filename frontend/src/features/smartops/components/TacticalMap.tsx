export function TacticalMap() {
    return (
        <div className="relative w-full h-full bg-[#0a0f1e] border border-slate-700/50 overflow-hidden group">
            {/* Grid Overlay - Slightly more visible for orientation */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '100px 100px' }} />

            <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                {/* Mock Landmass - High Contrast */}
                <path d="M 50 150 Q 150 50 350 120 T 600 250 T 750 180 L 800 450 L 0 450 Z"
                    fill="#060b18" stroke="#1e293b" strokeWidth="3" />

                {/* Operational Boundaries - Increased Weight */}
                <path d="M 400 0 L 400 500" stroke="#ef4444" strokeWidth="2" strokeDasharray="12 6" opacity="0.8" />
                <text x="415" y="30" className="fill-red-500 text-[10px] font-black uppercase tracking-widest">FLOT / FEBA</text>

                {/* Units - BLUE FORCE (Enlarged) */}
                <g transform="translate(180, 240)">
                    {/* Main Unit Icon */}
                    <rect x="-25" y="-18" width="50" height="36" fill="#1d4ed8" stroke="white" strokeWidth="2" rx="2" />
                    {/* Unit Symbol (Interpreted APP-6) */}
                    <path d="M -25 -18 L 25 18 M 25 -18 L -25 18" stroke="white" strokeWidth="1.5" opacity="0.8" />
                    {/* Designation Text - BOLD & LARGE */}
                    <text y="40" textAnchor="middle" className="fill-blue-400 text-[10px] font-black tracking-tight" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>1-64 MECH (BDE)</text>
                    {/* Strength Indicator */}
                    <text x="0" y="-22" textAnchor="middle" className="fill-white text-[10px] font-bold">XXX</text>
                </g>

                <g transform="translate(120, 340)">
                    <rect x="-25" y="-18" width="50" height="36" fill="#1d4ed8" stroke="white" strokeWidth="2" rx="2" />
                    <circle cx="0" cy="0" r="10" fill="none" stroke="white" strokeWidth="1.5" />
                    <text y="40" textAnchor="middle" className="fill-blue-400 text-[10px] font-black tracking-tight">4th LOG BN</text>
                </g>

                {/* Units - RED FORCE (Enlarged / Warning Highlight) */}
                <g transform="translate(620, 190)">
                    <rect x="-25" y="-18" width="50" height="36" fill="#dc2626" stroke="white" strokeWidth="2" transform="rotate(45)" rx="2" />
                    <text y="45" textAnchor="middle" className="fill-red-500 text-[10px] font-black tracking-tight uppercase" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))' }}>OPFOR REGT</text>
                    {/* Alert Glow */}
                    <circle r="60" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                </g>

                {/* Critical AO Highlighter (The "What to watch") */}
                <g>
                    <circle cx="580" cy="220" r="70" fill="#ef4444" fillOpacity="0.05" stroke="#ef4444" strokeWidth="2" strokeDasharray="8 8" />
                    <text x="500" y="140" className="fill-red-500 text-[10px] font-black uppercase tracking-tighter" style={{ filter: 'drop-shadow(0 0 10px rgba(239,68,68,0.5))' }}>
                        CRITICAL: AO VULCAN
                    </text>
                </g>

                {/* Coordinates - Larger Mono Font */}
                <g className="fill-slate-600 text-[11px] font-mono pointer-events-none">
                    <text x="20" y="480">GRID: 32V PK 1289 4567</text>
                    <text x="680" y="480">COORD: 59°54'N 010°45'E</text>
                </g>
            </svg>

            {/* Map Legend / Context (Enlarged) */}
            <div className="absolute bottom-6 left-6 flex flex-col gap-2 p-3 bg-slate-950/80 border border-slate-800 rounded backdrop-blur">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-blue-700 border border-white" />
                    <span className="text-[10px] font-black text-blue-400 uppercase">Friendly (Confirmed)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-red-700 border border-white rotate-45 scale-75" />
                    <span className="text-[10px] font-black text-red-500 uppercase">Hostile (Est. Size)</span>
                </div>
            </div>
        </div>
    );
}
