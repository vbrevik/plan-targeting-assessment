export function NetworkGraph() {
    const nodes = [
        { id: 1, x: 80, y: 100, label: 'HQ NORTH', type: 'COMMAND' },
        { id: 2, x: 260, y: 70, label: '1-64 MECH', type: 'UNIT' },
        { id: 3, x: 260, y: 160, label: 'AO VULCAN', type: 'LOCATION' },
        { id: 4, x: 420, y: 120, label: 'OBJ ALPHA', type: 'TARGET' },
        { id: 5, x: 80, y: 220, label: 'SHIELD II', type: 'PLAN' },
    ];

    const links = [
        { from: 1, to: 2, label: 'OPCON' },
        { from: 2, to: 3, label: 'ASSIGNED' },
        { from: 3, to: 4, label: 'INCLUDES' },
        { from: 1, to: 5, label: 'ACTIVE' },
    ];

    return (
        <div className="relative w-full h-full bg-[#0a0f1e] overflow-hidden font-sans border-t border-slate-800">
            <div className="absolute inset-0 z-0 opacity-5"
                style={{ backgroundImage: 'radial-gradient(circle, #334155 1.5px, transparent 1.5px)', backgroundSize: '60px 60px' }} />

            <svg className="w-full h-full p-8" viewBox="0 0 500 300" preserveAspectRatio="xMidYMid meet">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="28" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                    </marker>
                </defs>

                {/* Links - Bolder and Clearer */}
                {links.map((link, i) => {
                    const from = nodes.find(n => n.id === link.from)!;
                    const to = nodes.find(n => n.id === link.to)!;
                    return (
                        <g key={i}>
                            <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#334155" strokeWidth="2.5" markerEnd="url(#arrow)" />
                            <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 10}
                                className="fill-slate-500 text-[10px] font-black uppercase italic" textAnchor="middle">{link.label}</text>
                        </g>
                    );
                })}

                {/* Nodes - Enlarged with High-Contrast Labels */}
                {nodes.map((node) => (
                    <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer group">
                        {/* Outer Glow for Importance */}
                        {node.type === 'TARGET' && <circle r="22" className="fill-red-500/10 animate-pulse" />}

                        <circle r="18" className={`${node.type === 'COMMAND' ? 'fill-blue-600' :
                            node.type === 'TARGET' ? 'fill-red-600' : 'fill-slate-700'
                            } stroke-white stroke-2 group-hover:scale-110 transition-transform`} />

                        {/* Label - BOLD AND LARGE */}
                        <text y="32" textAnchor="middle" className="fill-white text-[10px] font-black tracking-tight uppercase" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))' }}>
                            {node.label}
                        </text>
                        <text y="44" textAnchor="middle" className="fill-slate-500 text-[9px] font-bold uppercase tracking-widest">
                            {node.type}
                        </text>
                    </g>
                ))}
            </svg>

            <div className="absolute top-4 left-4 flex flex-col gap-1 p-2 bg-slate-950/40 rounded border border-slate-800/50 backdrop-blur-sm">
                <div className="text-[10px] text-blue-400 font-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600" /> C2 NODE
                </div>
                <div className="text-[10px] text-red-400 font-black flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600" /> KINETIC OBJ
                </div>
            </div>
        </div>
    );
}
