// Recently Viewed Component
// Tracks and displays recently viewed pages

import { useState, useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface ViewedItem {
  path: string;
  label: string;
  timestamp: number;
}

const STORAGE_KEY = 'targeting_recently_viewed';
const MAX_ITEMS = 5;

export function RecentlyViewed() {
  const [items, setItems] = useState<ViewedItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Page labels mapping
  const pageLabels: Record<string, string> = {
    '/mshnctrl/targeting-cell-dashboard': 'Dashboard',
    '/mshnctrl/targeting/targets': 'Targets',
    '/mshnctrl/targeting/intelligence': 'Intelligence',
    '/mshnctrl/targeting/effects': 'Effects Assessment',
    '/mshnctrl/targeting/assets': 'Assets & Capabilities',
    '/mshnctrl/targeting/risk': 'Risk & Constraints',
    '/mshnctrl/targeting/analysis': 'Alternative Analysis',
    '/mshnctrl/targeting/collaboration': 'Collaboration',
    '/mshnctrl/targeting/mission-command': 'Mission Command',
  };

  // Load items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ViewedItem[];
        setItems(parsed);
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  // Track current page view
  useEffect(() => {
    const pathname = location.pathname;
    const label = pageLabels[pathname];
    
    if (!label) return; // Only track known pages

    setItems((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.path !== pathname);
      
      // Add to beginning
      const updated = [
        { path: pathname, label, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, [location.pathname]);

  const handleRemove = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => {
      const updated = prev.filter((item) => item.path !== path);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleClear = () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 sm:p-4">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" />
          <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-tight text-white">
            Recently Viewed
          </h3>
        </div>
        <button
          onClick={handleClear}
          className="text-[10px] sm:text-xs text-slate-500 hover:text-slate-400 active:text-slate-300 transition-colors touch-manipulation"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate({ to: item.path })}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left hover:bg-slate-800 active:bg-slate-700 transition-colors group touch-manipulation",
              location.pathname === item.path && "bg-slate-800"
            )}
          >
            <span className="text-[10px] sm:text-xs text-slate-300 group-hover:text-white transition-colors truncate">
              {item.label}
            </span>
            <button
              onClick={(e) => handleRemove(item.path, e)}
              className="opacity-0 group-hover:opacity-100 sm:opacity-100 p-0.5 hover:bg-slate-700 active:bg-slate-600 rounded transition-all touch-manipulation"
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </button>
        ))}
      </div>
    </div>
  );
}
