import { AlertOctagon } from 'lucide-react';



interface OperationalContextBarProps {
    context: any; // Using any for now as OperationalContext might not be exported as type from hook file easily
    currentTime: Date;
}

export function OperationalContextBar({ context, currentTime }: OperationalContextBarProps) {
    return (
        <div className="h-14 flex items-center justify-between px-6 bg-slate-950 border-b-2 border-slate-800 shadow-2xl z-20">
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Operation</span>
                    <span className="text-sm font-black text-white tracking-tight">{context.name || 'Rolling Thunder'}</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Timeline</span>
                    <span className="text-sm font-mono text-white">D+04</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">Zulu Time</span>
                    <span className="text-sm font-mono text-white">
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}Z
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">DEFCON</span>
                    <span className="text-sm font-black text-white">4</span>
                </div>
                <div className="px-4 py-2 bg-red-950/40 border-2 border-red-500/70 rounded flex items-center gap-2">
                    <AlertOctagon className="text-red-500 animate-pulse" size={20} />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Alert Level</span>
                        <span className="text-sm font-black text-white">RED-ALPHA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
