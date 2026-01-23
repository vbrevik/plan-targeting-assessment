import { createFileRoute } from '@tanstack/react-router';
import { useState, Suspense, useEffect, useRef } from 'react';
import {
    Target,
    Crosshair,
    Clock,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DecisionGatesBarCompact } from '@/features/smartops/components/DecisionGatesBar';
import { DashboardCustomizer } from '@/features/smartops/components/DashboardCustomizer';
import { UpdateNotification } from '@/features/smartops/components/UpdateNotification';
import { SecurityBadge, SecurityBanner } from '@/components/SecurityBadge';
import { useTargetingPreferences } from '@/features/smartops/hooks/useTargetingPreferences';
import { CompactMetricsBar } from '@/features/smartops/components/CompactMetricsBar';
import { F3EADHorizontalFunnel } from '@/features/smartops/components/F3EADHorizontalFunnel';
import { TargetMasterList } from '@/features/smartops/components/TargetMasterList';
import { TargetDetailView } from '@/features/smartops/components/TargetDetailView';
import { targetingApi } from '@/lib/smartops/api/targeting.api';
import { DashboardModeSwitcher } from '@/features/smartops/components/DashboardModeSwitcher';
import { DashboardMode } from '@/features/smartops/types/dashboard';
import { COPSummary } from '@/features/smartops/components/COPSummary';
import { AssetCapabilityManagement } from '@/features/smartops/components/AssetCapabilityManagement';
import { StrikeOptimizer } from '@/features/smartops/components/StrikeOptimizer';
import { TimeFilter } from '@/features/smartops/components/TimeFilter';
import type { TimeWindow } from '@/features/smartops/components/TimeFilter';
import { CyberOperationsCockpit } from '@/features/smartops/components/CyberOperationsCockpit';

export const Route = createFileRoute('/smartops/targeting-cell-dashboard')({
    component: TargetingCellDashboard,
});

function TargetingCellDashboard() {
    useTargetingPreferences();
    const [showCustomizer, setShowCustomizer] = useState(false);
    const [viewMode, setViewMode] = useState<DashboardMode>(DashboardMode.OPERATION);
    const [timeWindow, setTimeWindow] = useState<TimeWindow>('24H');
    const [isAutoMode, setIsAutoMode] = useState(true);

    // Phase 2 State
    const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
    const [selectedF3eadStage, setSelectedF3eadStage] = useState<string | null>(null);
    const [targets, setTargets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Mock metrics for Phase 2
    const metrics = {
        activeTargets: 42,
        pendingApprovals: 7,
        tstAlerts: 2,
        isrPlatformsActive: 12,
        strikePlatformsReady: 8,
        highRiskTargets: 3
    };

    // F3EAD Counts for Funnel
    const f3eadCounts = {
        FIND: 12,
        FIX: 5,
        FINISH: 3,
        EXPLOIT: 2,
        ANALYZE: 4,
        DISSEMINATE: 1
    };

    useEffect(() => {
        const fetchTargets = async () => {
            try {
                setLoading(true);
                const data = await targetingApi.getTargets({ limit: 50 });
                setTargets(data);
            } catch (err) {
                console.error('Failed to fetch targets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTargets();
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                if (e.key === 'Escape') {
                    (e.target as HTMLElement).blur();
                }
                return;
            }

            switch (e.key) {
                case '[':
                    e.preventDefault();
                    setIsSidebarOpen(prev => !prev);
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    e.stopPropagation();
                    searchInputRef.current?.focus();
                    searchInputRef.current?.setSelectionRange(0, 0);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Listen for Escape/Fullscreen changes manually
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Auto-switch logic (optional)
    useEffect(() => {
        if (selectedTargetId && viewMode === DashboardMode.OPERATION && isAutoMode) {
            // Auto-switch to engagement if a target is selected and auto-mode is on
            handleModeChange(DashboardMode.ENGAGEMENT);
        }
    }, [selectedTargetId, isAutoMode]);

    // Handle Mode Change
    const handleModeChange = (mode: DashboardMode) => {
        setViewMode(mode);
        if (mode === DashboardMode.OVERVIEW || mode === DashboardMode.PLANNING || mode === DashboardMode.CYBER) {
            setIsSidebarOpen(false);
        } else if (mode === DashboardMode.OPERATION) {
            setIsSidebarOpen(true);
        } else if (mode === DashboardMode.ENGAGEMENT) {
            setIsSidebarOpen(false);
        }
    };

    return (
        <div className={cn(
            "h-full flex flex-col bg-slate-950 overflow-hidden transition-all duration-300",
            isFullscreen && "fixed inset-0 z-[9999]"
        )} id="main-content">
            {/* Top Security Banner */}
            <SecurityBanner level="SECRET" caveats={['NOFORN']} position="top" />

            {/* Sticky Header Section */}
            <div className={cn(
                "px-6 py-4 space-y-4 border-b border-slate-900/40 bg-slate-950/80 backdrop-blur-md transition-all",
                isFullscreen && "py-2"
            )}>
                {/* Top Row: Title & Actions */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-black uppercase tracking-tight text-white whitespace-nowrap">
                                Targeting Cell Ops
                            </h1>
                            <SecurityBadge level="SECRET" caveats={['NOFORN']} size="sm" />
                        </div>
                        {!isFullscreen && (
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                F2T2EA Joint Targeting Workbench
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        <DashboardModeSwitcher
                            currentMode={viewMode}
                            onModeChange={handleModeChange}
                            isAuto={isAutoMode}
                            onAutoChange={setIsAutoMode}
                            className="mr-4"
                        />
                        <TimeFilter
                            currentWindow={timeWindow}
                            onWindowChange={setTimeWindow}
                            className="mr-2"
                        />
                        <CompactMetricsBar metrics={metrics} />
                        <div className="h-8 w-px bg-slate-800/50" />
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 bg-slate-900 border border-slate-800/40 rounded hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                            title="Toggle Fullscreen (F)"
                        >
                            <Target size={16} className={isFullscreen ? "rotate-45" : ""} />
                        </button>
                        <UpdateNotification className="no-print" />
                    </div>
                </div>

                {/* Sub-Header Row: F3EAD & Decision Gates */}
                <div className="flex items-center gap-6">
                    <F3EADHorizontalFunnel
                        counts={f3eadCounts}
                        selectedStage={selectedF3eadStage}
                        onStageSelect={setSelectedF3eadStage}
                        className="flex-1 opacity-90 hover:opacity-100 transition-opacity"
                    />
                    <div className="flex-1">
                        <DecisionGatesBarCompact />
                    </div>
                </div>
            </div>

            {/* Main Content Area based on Mode */}
            <div className="flex-1 flex overflow-hidden bg-slate-950">
                {/* Left Panel: Target List (Visible in Operation) */}
                {(viewMode === DashboardMode.OPERATION) && (
                    <div className={cn(
                        "transition-all duration-300 ease-in-out border-r border-slate-900/40 overflow-hidden flex flex-col",
                        isSidebarOpen ? "w-[400px]" : "w-0 border-none"
                    )}>
                        <TargetMasterList
                            targets={targets}
                            selectedId={selectedTargetId}
                            onSelect={setSelectedTargetId}
                            isLoading={loading}
                            className="w-[400px]"
                            searchInputRef={searchInputRef}
                        />
                    </div>
                )}

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto bg-slate-900/5 relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            {viewMode === DashboardMode.OVERVIEW ? (
                                <div className="h-full overflow-y-auto">
                                    <COPSummary />
                                </div>
                            ) : viewMode === DashboardMode.PLANNING ? (
                                <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <AssetCapabilityManagement />
                                        <div className="space-y-6">
                                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl shadow-black/20">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                        <Clock size={16} className="text-blue-400" />
                                                        Planning Timeline
                                                    </h3>
                                                    <span className="text-[10px] font-mono text-slate-500">ZULU TIME</span>
                                                </div>
                                                <div className="space-y-6 relative before:absolute before:left-[41px] before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="flex gap-6 relative">
                                                            <div className="w-10 text-[10px] font-mono text-slate-500 py-1">T+{i * 2}H</div>
                                                            <div className="flex-1 flex flex-col gap-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-[11px] font-bold text-slate-300 uppercase">Target Cycle {i}</span>
                                                                    <span className="text-[10px] text-blue-400 font-mono">EST: 0{i}:30:00</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700/30">
                                                                    <div
                                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                                                        style={{ width: `${30 + (i * 15)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Resource Allocation</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <div className="text-[10px] text-slate-500 uppercase font-black">Air Assets</div>
                                                        <div className="text-xl font-black text-white">82%</div>
                                                    </div>
                                                    <div className="p-3 bg-slate-950 border border-slate-800 rounded">
                                                        <div className="text-[10px] text-slate-500 uppercase font-black">Munitions</div>
                                                        <div className="text-xl font-black text-white">64%</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <StrikeOptimizer />
                                        </div>
                                    </div>
                                </div>
                            ) : viewMode === DashboardMode.ENGAGEMENT ? (
                                <div className="h-full flex flex-col p-6 overflow-hidden">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                                            <Zap className="text-red-500 animate-pulse" size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Active Engagement</h2>
                                            <p className="text-xs text-slate-400">Time-Sensitive Target Analysis • Real-time Strike Optimization</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className="px-3 py-1 bg-red-900/30 border border-red-700/50 rounded text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">
                                                Live TST Monitor
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-h-0 bg-red-950/[0.02] border border-red-900/10 rounded-lg overflow-hidden relative">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent animate-pulse" />
                                        {selectedTargetId ? (
                                            <Suspense fallback={<div className="p-8 animate-pulse text-xs font-mono uppercase text-slate-600">Loading Engagement Cockpit...</div>}>
                                                <TargetDetailView
                                                    targetId={selectedTargetId}
                                                    isEmbedded
                                                    onClose={() => setViewMode(DashboardMode.OPERATION)}
                                                />
                                            </Suspense>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-4">
                                                <Crosshair size={48} className="text-slate-800" />
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Target Acquisition Necessary</h3>
                                                    <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tight">Switch to Operation mode to nominate a track</p>
                                                </div>
                                                <Button onClick={() => setViewMode(DashboardMode.OPERATION)} size="sm" variant="outline" className="mt-4 border-slate-800 text-slate-500 hover:text-slate-300 uppercase text-[10px] font-bold">
                                                    Back to Operation Cell
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : viewMode === (DashboardMode as any).CYBER ? (
                                <div className="h-full p-6 overflow-hidden">
                                    <CyberOperationsCockpit />
                                </div>
                            ) : (
                                /* Operation Mode (Default master-detail) */
                                <div className={cn("h-full transition-all duration-300", isSidebarOpen ? "p-0" : "p-4")}>
                                    {selectedTargetId ? (
                                        <Suspense fallback={<div className="p-8 animate-pulse text-xs font-mono uppercase text-slate-600">Retrieving Target Data...</div>}>
                                            <TargetDetailView
                                                targetId={selectedTargetId}
                                                isEmbedded
                                                onClose={() => setSelectedTargetId(null)}
                                            />
                                        </Suspense>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-12 space-y-4">
                                            <div className="p-4 bg-slate-900/40 rounded-full border border-slate-800">
                                                <Target size={48} className="text-slate-700 animate-pulse" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Target Selected</h3>
                                                <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tight">Select a track from the master list to view intel and analysis</p>
                                            </div>
                                            <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-900 w-full max-w-sm">
                                                <div className="flex-1 text-right">
                                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Press [ to toggle list</span>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <span className="text-[9px] font-mono text-slate-500 uppercase">Press S to search</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Security Banner */}
            <SecurityBanner level="SECRET" caveats={['NOFORN']} position="bottom" />

            {/* Dashboard Customizer */}
            <DashboardCustomizer
                isOpen={showCustomizer}
                onClose={() => setShowCustomizer(false)}
            />
        </div>
    );
}
