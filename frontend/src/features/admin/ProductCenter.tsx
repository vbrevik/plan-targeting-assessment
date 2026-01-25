import { useState, useEffect } from 'react';
import {
    FileText,
    ShieldCheck,
    Hash,
    Search,
    ChevronRight,
    Download,
    RefreshCw,
    Clock,
    User,
    FileSearch,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartOpsService } from '@/lib/smartops/mock-service';
import type { ProductReport, UUID } from '@/lib/smartops/types';
import { Button } from '@/components/ui/button';

export function ProductCenter() {
    const [reports, setReports] = useState<ProductReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportId, setSelectedReportId] = useState<UUID | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<'Valid' | 'Invalid' | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    async function loadReports() {
        setLoading(true);
        const data = await SmartOpsService.getProductReports();
        setReports(data);
        setLoading(false);
    }

    const selectedReport = reports.find((r: ProductReport) => r.id === selectedReportId);

    const handleVerify = async () => {
        if (!selectedReport) return;
        setVerifying(true);
        // Simulate hash verification logic
        await new Promise(r => setTimeout(r, 1500));
        setVerificationResult('Valid');
        setVerifying(false);
    };

    const handleGenerate = async () => {
        setLoading(true);
        const content = {
            summary: "Calculated operational intent based on current JCO and Targets.",
            timestamp: new Date().toISOString(),
            status: "Aggregated"
        };
        await SmartOpsService.generateProductReport('Auto-Generated INTELLIGENCE SUMMARY', 'INTREP', content, 'System Gen');
        loadReports();
    };

    return (
        <div className="flex h-full bg-[#020617] text-slate-200 overflow-hidden border-l border-slate-900">
            {/* Report Browser */}
            <div className="w-80 border-r border-slate-900 bg-slate-950/20 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-900/60 bg-slate-950/40">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <FileSearch className="text-blue-500" size={24} /> Products
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                            <input
                                type="text"
                                placeholder="Filter products..."
                                className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                            />
                        </div>

                        <Button
                            onClick={handleGenerate}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest py-5 rounded-xl transition-all"
                        >
                            Generate New <RefreshCw size={14} className="ml-2" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-slate-600 animate-pulse text-[10px] uppercase font-bold tracking-widest">Compiling Records...</div>
                    ) : (
                        reports.map((report: ProductReport) => (
                            <div
                                key={report.id}
                                onClick={() => {
                                    setSelectedReportId(report.id);
                                    setVerificationResult(null);
                                }}
                                className={cn(
                                    "p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden",
                                    selectedReportId === report.id
                                        ? "bg-blue-600/10 border-blue-500 shadow-[0_0_25px_rgba(37,99,235,0.05)]"
                                        : "bg-slate-900/20 border-slate-800/40 hover:border-slate-700"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                                        report.type === 'SITREP' ? "bg-emerald-500/10 text-emerald-500" :
                                            report.type === 'INTREP' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                                    )}>
                                        {report.type}
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-700">v{report.version}.0</span>
                                </div>
                                <h4 className="text-[11px] font-black text-white uppercase leading-tight mb-3 group-hover:text-blue-400 transition-colors uppercase truncate">
                                    {report.title}
                                </h4>
                                <div className="flex items-center justify-between text-slate-600">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={10} />
                                        <span className="text-[9px] font-bold">{new Date(report.generatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <ChevronRight size={14} className={cn("transition-transform", selectedReportId === report.id ? "rotate-90 text-blue-500" : "opacity-0 group-hover:opacity-100")} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Content & Verification */}
            <div className="flex-1 overflow-y-auto bg-[#020617] relative custom-scrollbar">
                {selectedReport ? (
                    <div className="max-w-4xl mx-auto p-12">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-6">
                                <span className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-500 tracking-tighter uppercase shrink-0">
                                    System Signed
                                </span>
                                <div className="h-px w-20 bg-slate-900" />
                                <div className="flex items-center gap-2">
                                    <User size={14} className="text-blue-500" />
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest">{selectedReport.author}</span>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-slate-500 hover:text-blue-400 gap-2 uppercase text-[10px] font-black tracking-widest">
                                Export PDF <Download size={14} />
                            </Button>
                        </div>

                        {/* Report Header */}
                        <div className="mb-12">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-6 bg-blue-600" />
                                <span className="text-xs font-black text-blue-500 uppercase tracking-[0.4em]">Official Product Output</span>
                            </div>
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                                {selectedReport.title}
                            </h1>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                                {selectedReport.summary}
                            </p>
                        </div>

                        {/* Data Visualization / Content */}
                        <div className="grid grid-cols-2 gap-6 mb-12">
                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Metadata Payload</h3>
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                        <span className="text-slate-600">Generated:</span>
                                        <span className="text-white">{new Date(selectedReport.generatedAt).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                        <span className="text-slate-600">Product ID:</span>
                                        <span className="text-white">{selectedReport.id}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-800/50 pb-2">
                                        <span className="text-slate-600">Schema Version:</span>
                                        <span className="text-white">v2.1.0-dataDriven</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Operational Context</h3>
                                <div className="space-y-3">
                                    {Object.entries(selectedReport.content).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{key}:</span>
                                            <span className="text-[11px] font-black text-white uppercase tracking-tight">{val as string}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Integrity Verification Section */}
                        <div className="bg-slate-950 border-2 border-slate-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                <div className="flex gap-6 items-center">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
                                        verificationResult === 'Valid' ? "bg-emerald-500/20 text-emerald-500 shadow-emerald-500/10" : "bg-slate-900 text-blue-500"
                                    )}>
                                        <Hash size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Integrity Signature</h3>
                                        <p className="text-[10px] font-mono text-slate-600 break-all max-w-sm">
                                            {selectedReport.integrityHash}
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    {verificationResult === 'Valid' ? (
                                        <div className="flex items-center gap-3 bg-emerald-500 text-white px-6 py-3 rounded-xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-500/20 animate-in fade-in zoom-in duration-300">
                                            <ShieldCheck size={18} /> Verifier: Document Authenticated
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleVerify}
                                            disabled={verifying}
                                            className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[11px] tracking-widest px-8 py-6 rounded-xl shadow-xl shadow-blue-500/20 group"
                                        >
                                            {verifying ? (
                                                <span className="flex items-center gap-2">
                                                    <RefreshCw size={16} className="animate-spin" /> Verifying...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    Check Hash <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Verification Subtle Pattern */}
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <ShieldCheck size={200} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-800 p-20 text-center">
                        <FileText size={80} className="mb-6 opacity-30" />
                        <h3 className="text-xl font-black uppercase tracking-[0.3em]">Select a Product</h3>
                        <p className="text-sm font-bold uppercase text-slate-600 mt-2 max-w-xs">Data-driven outputs with cryptographic verification</p>
                    </div>
                )}
            </div>
        </div>
    );
}
