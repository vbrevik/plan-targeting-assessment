// Collapsible Section Component
// Used for progressive disclosure in dashboard

import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string | number; // Optional badge/count
  className?: string;
  onToggle?: (expanded: boolean) => void; // Callback when section is toggled
}

export function CollapsibleSection({
  title,
  defaultExpanded = false,
  children,
  icon,
  badge,
  className = '',
  onToggle,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg ${className}`}>
            <button
              onClick={handleToggle}
              className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-800/50 active:bg-slate-800 transition-colors touch-manipulation"
              aria-expanded={isExpanded}
              aria-controls={`collapsible-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-400">{icon}</div>}
          <h3 
            id={`collapsible-header-${title.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-sm font-black uppercase tracking-tight text-white"
          >
            {title}
          </h3>
          {badge !== undefined && (
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-300">
              {badge}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <div 
          id={`collapsible-${sectionId}`}
          className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-700"
          role="region"
          aria-labelledby={headerId}
        >
          {children}
        </div>
      )}
    </div>
  );
}
