// Dashboard Customizer Component
// Allows users to customize dashboard widget arrangement

import { useState } from 'react';
import { Settings, Eye, EyeOff, ChevronUp, ChevronDown, RotateCcw, X } from 'lucide-react';
import { useDashboardLayout, type DashboardWidget } from '@/features/layout/hooks/useDashboardLayout';
import { cn } from '@/lib/utils';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardCustomizer({ isOpen, onClose }: DashboardCustomizerProps) {
  const {
    layout,
    isLoaded,
    setWidgetVisible,
    moveWidget,
    resetLayout,
    getVisibleWidgets,
  } = useDashboardLayout();

  const [isResetting, setIsResetting] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setIsResetting(true);
    resetLayout();
    setTimeout(() => setIsResetting(false), 500);
  };

  const widgetLabels: Record<string, string> = {
    'critical-metrics': 'Critical Metrics',
    'f3ead-pipeline': 'F3EAD Pipeline',
    'top-priority-targets': 'Top Priority Targets',
    'recently-viewed': 'Recently Viewed',
    'mission-context': 'Mission Context',
    'quick-access': 'Quick Access',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Customizer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-400" />
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                Customize Dashboard
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded transition-colors touch-manipulation"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Widget List */}
          <div className="space-y-2 mb-6">
            {layout.widgets
              .sort((a, b) => a.order - b.order)
              .map((widget, index) => (
                <div
                  key={widget.id}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white">
                      {widgetLabels[widget.id] || widget.id}
                    </span>
                    <button
                      onClick={() => setWidgetVisible(widget.id, !widget.visible)}
                      className={cn(
                        'p-1.5 rounded transition-colors touch-manipulation',
                        widget.visible
                          ? 'text-green-400 hover:bg-green-950/30'
                          : 'text-slate-500 hover:bg-slate-700'
                      )}
                    >
                      {widget.visible ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveWidget(widget.id, 'up')}
                      disabled={index === 0}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronUp className="w-4 h-4 text-slate-300" />
                    </button>
                    <button
                      onClick={() => moveWidget(widget.id, 'down')}
                      disabled={index === layout.widgets.length - 1}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded transition-colors touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronDown className="w-4 h-4 text-slate-300" />
                    </button>
                    <span className="text-xs text-slate-500 ml-auto">
                      Position {index + 1}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-sm font-bold text-slate-300 hover:bg-slate-700 transition-colors touch-manipulation"
            >
              <RotateCcw className={cn('w-4 h-4', isResetting && 'animate-spin')} />
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Done
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 p-3 bg-slate-800/50 border border-slate-700 rounded text-xs text-slate-400">
            <p>
              Customize your dashboard by showing/hiding widgets and reordering them.
              Changes are saved automatically.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
