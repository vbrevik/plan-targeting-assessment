// Quick Search Component
// Provides global search functionality for targeting dashboard

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Target, Brain, Zap, BarChart3, AlertTriangle, Users, Shield, History } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { targetingApi } from '@/lib/mshnctrl/api/targeting.api';

interface SearchResult {
  id: string;
  type: 'target' | 'page' | 'metric' | 'isr_platform';
  label: string;
  description?: string;
  path: string;
  icon: React.ReactNode;
}

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Searchable pages and items
  const searchableItems: SearchResult[] = [
    { id: 'targets', type: 'page', label: 'Targets', description: 'F3EAD Pipeline, DTL, TST', path: '/mshnctrl/targeting/targets', icon: <Target className="w-4 h-4" /> },
    { id: 'intelligence', type: 'page', label: 'Intelligence', description: 'Intel Reports, ISR Platforms', path: '/mshnctrl/targeting/intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'effects', type: 'page', label: 'Effects Assessment', description: 'BDA, Re-attack Recommendations', path: '/mshnctrl/targeting/effects', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'assets', type: 'page', label: 'Assets & Capabilities', description: 'Strike Platforms, Munitions', path: '/mshnctrl/targeting/assets', icon: <Zap className="w-4 h-4" /> },
    { id: 'risk', type: 'page', label: 'Risk & Constraints', description: 'High-Risk Targets, Legal Review', path: '/mshnctrl/targeting/risk', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'analysis', type: 'page', label: 'Alternative Analysis', description: 'Assumptions, Bias Alerts', path: '/mshnctrl/targeting/analysis', icon: <Brain className="w-4 h-4" /> },
    { id: 'collaboration', type: 'page', label: 'Collaboration', description: 'Decision Log, Handovers', path: '/mshnctrl/targeting/collaboration', icon: <Users className="w-4 h-4" /> },
    { id: 'mission-command', type: 'page', label: 'Mission Command', description: 'Commander Intent, Guidance', path: '/mshnctrl/targeting/mission-command', icon: <Shield className="w-4 h-4" /> },
    { id: 'dashboard', type: 'page', label: 'Dashboard', description: 'Targeting Cell Operations Center', path: '/mshnctrl/targeting-cell-dashboard', icon: <Target className="w-4 h-4" /> },
  ];

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Debounce search API calls
    const timeoutId = setTimeout(async () => {
      try {
        // Search backend data
        const searchResponse = await targetingApi.search({
          q: query,
          limit: 10,
        });

        // Combine backend results with page navigation
        const backendResults: SearchResult[] = searchResponse.results.map((result) => {
          // Map result type to icon and path
          let icon: React.ReactNode;
          let path: string;

          switch (result.type) {
            case 'target':
              icon = <Target className="w-4 h-4" />;
              path = `/mshnctrl/targeting/targets`; // Could navigate to specific target later
              break;
            case 'bda':
              icon = <BarChart3 className="w-4 h-4" />;
              path = `/mshnctrl/targeting/effects`;
              break;
            case 'decision':
              icon = <Users className="w-4 h-4" />;
              path = `/mshnctrl/targeting/collaboration`;
              break;
            case 'isr_platform':
              icon = <Brain className="w-4 h-4" />;
              path = `/mshnctrl/targeting/intelligence`;
              break;
            case 'strike_platform':
              icon = <Zap className="w-4 h-4" />;
              path = `/mshnctrl/targeting/assets`;
              break;
            default:
              icon = <Target className="w-4 h-4" />;
              path = '/mshnctrl/targeting-cell-dashboard';
          }

          return {
            id: result.id,
            type: result.type as 'target' | 'page' | 'metric',
            label: result.title,
            description: result.description || result.status || result.priority,
            path,
            icon,
          };
        });

        // Also search page navigation items
        const lowerQuery = query.toLowerCase();
        const pageResults = searchableItems.filter(item =>
          item.label.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery)
        );

        // Combine and deduplicate (prefer backend results)
        const combined = [...backendResults, ...pageResults];
        const unique = Array.from(
          new Map(combined.map(item => [item.path, item])).values()
        );

        setResults(unique.slice(0, 12)); // Limit to 12 results
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to page-only search
        const lowerQuery = query.toLowerCase();
        const filtered = searchableItems.filter(item =>
          item.label.toLowerCase().includes(lowerQuery) ||
          item.description?.toLowerCase().includes(lowerQuery)
        );
        setResults(filtered.slice(0, 8));
        setSelectedIndex(0);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }

      // Arrow keys to navigate results
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault();
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (result: SearchResult) => {
    navigate({ to: result.path });
    setIsOpen(false);
    setQuery('');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-400 hover:text-white hover:border-slate-600 active:bg-slate-700 transition-colors touch-manipulation"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>
    );
  }

  const [activeTab, setActiveTab] = useState<'all' | 'targets' | 'intelligence' | 'pages'>('all');

  // Filter logic
  const filteredResults = results.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pages') return r.type === 'page';
    if (activeTab === 'targets') return r.type === 'target';
    if (activeTab === 'intelligence') return r.type === 'isr_platform' || r.type === 'metric';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-slate-800">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search targets, pages, metrics..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-lg font-medium"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-slate-800 rounded-md transition-colors"
            >
              <kbd className="text-[10px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400 font-mono">ESC</kbd>
            </button>
          </div>

          {/* Filter Tabs */}
          {query && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/30">
              {(['all', 'targets', 'intelligence', 'pages'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors capitalize",
                    activeTab === tab
                      ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                      : "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto custom-scrollbar">
            {query ? (
              filteredResults.length > 0 ? (
                <div className="py-2">
                  {/* Grouping Header logic could go here if we wanted sections, but flat list with tabs is cleaner for now */}
                  {filteredResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-800/80 active:bg-slate-700 transition-all text-left group border-l-2 border-transparent",
                        index === selectedIndex && "bg-slate-800/80 border-blue-500",
                        // Type specific styling
                        result.type === 'target' && "hover:border-red-500/50",
                        result.type === 'page' && "hover:border-slate-500/50"
                      )}
                    >
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        result.type === 'target' ? "bg-red-950/30 text-red-500 group-hover:bg-red-900/50" :
                          result.type === 'page' ? "bg-slate-800 text-slate-400 group-hover:bg-slate-700" :
                            result.type === 'isr_platform' ? "bg-purple-950/30 text-purple-500 group-hover:bg-purple-900/50" :
                              "bg-blue-950/30 text-blue-500 group-hover:bg-blue-900/50"
                      )}>
                        {result.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{result.label}</span>
                          {result.type === 'target' && <span className="px-1.5 py-0.5 rounded bg-red-950/50 border border-red-900 text-[9px] font-bold text-red-500 uppercase">Target</span>}
                        </div>
                        {result.description && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-mono">{result.description}</div>
                        )}
                      </div>

                      {index === selectedIndex && (
                        <span className="text-xs text-slate-500 flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                          Jump to <span className="font-mono">↵</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-600" />
                  </div>
                  <div className="text-slate-400 text-sm font-medium">No matches found</div>
                  <div className="text-slate-500 text-xs mt-1">Try adjusting your valid filters</div>
                </div>
              )
            ) : (
              <div className="p-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Recent & Suggested</div>
                <div className="space-y-1">
                  {searchableItems.slice(0, 4).map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-left group"
                    >
                      <History className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Hints */}
          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><kbd className="bg-slate-800 border border-slate-700 px-1 rounded">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="bg-slate-800 border border-slate-700 px-1 rounded">↵</kbd> Select</span>
              <span className="flex items-center gap-1"><kbd className="bg-slate-800 border border-slate-700 px-1 rounded">esc</kbd> Close</span>
            </div>
            <div>
              Searching <span className="text-blue-500 font-bold">Secure Enclave</span>
            </div>
          </div>
        </div>
      </div>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-10 animate-in fade-in duration-200" />
    </div>
  );
}
