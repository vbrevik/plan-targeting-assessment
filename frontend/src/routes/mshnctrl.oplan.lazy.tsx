import { createLazyFileRoute } from '@tanstack/react-router'
import { useState, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { OPLANBuilder } from '@/features/planning/OPLANBuilder'
import { OPLANViewer } from '@/features/planning/OPLANViewer'
import { PenTool, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createLazyFileRoute('/mshnctrl/oplan')({
    component: OPLANRoute
})

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-500 bg-red-950/20 m-10 border border-red-900 rounded-lg">
                    <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
                    <pre className="text-xs bg-black/50 p-4 rounded overflow-auto">
                        {this.state.error?.toString()}
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}

function OPLANRoute() {
    const [mode, setMode] = useState<'builder' | 'viewer'>('builder');

    return (
        <ErrorBoundary>
            <div className="flex flex-col h-full bg-[#020617] relative">
                {/* Mode Toggle (Floating or Top Bar) */}
                <div className="absolute top-4 right-8 z-50 flex bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-1 shadow-xl">
                    <button
                        onClick={() => setMode('builder')}
                        className={cn(
                            "px-3 py-1.5 rounded text-[10px] font-black uppercase flex items-center gap-2 transition-all",
                            mode === 'builder' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <PenTool size={12} /> J5 Planner (Builder)
                    </button>
                    <button
                        onClick={() => setMode('viewer')}
                        className={cn(
                            "px-3 py-1.5 rounded text-[10px] font-black uppercase flex items-center gap-2 transition-all",
                            mode === 'viewer' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                        )}
                    >
                        <Eye size={12} /> Unit Commander (Viewer)
                    </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden">
                    {mode === 'builder' ? <OPLANBuilder /> : <OPLANViewer />}
                </div>
            </div>
        </ErrorBoundary>
    )
}
