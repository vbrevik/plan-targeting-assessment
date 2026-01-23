// Quick Search Component
// Provides global search functionality for targeting dashboard

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, Target, Brain, Zap, BarChart3, AlertTriangle, Users, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { targetingApi } from '@/lib/smartops/api/targeting.api';

interface SearchResult {
  id: string;
  type: 'target' | 'page' | 'metric';
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
    { id: 'targets', type: 'page', label: 'Targets', description: 'F3EAD Pipeline, DTL, TST', path: '/smartops/targeting/targets', icon: <Target className="w-4 h-4" /> },
    { id: 'intelligence', type: 'page', label: 'Intelligence', description: 'Intel Reports, ISR Platforms', path: '/smartops/targeting/intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'effects', type: 'page', label: 'Effects Assessment', description: 'BDA, Re-attack Recommendations', path: '/smartops/targeting/effects', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'assets', type: 'page', label: 'Assets & Capabilities', description: 'Strike Platforms, Munitions', path: '/smartops/targeting/assets', icon: <Zap className="w-4 h-4" /> },
    { id: 'risk', type: 'page', label: 'Risk & Constraints', description: 'High-Risk Targets, Legal Review', path: '/smartops/targeting/risk', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'analysis', type: 'page', label: 'Alternative Analysis', description: 'Assumptions, Bias Alerts', path: '/smartops/targeting/analysis', icon: <Brain className="w-4 h-4" /> },
    { id: 'collaboration', type: 'page', label: 'Collaboration', description: 'Decision Log, Handovers', path: '/smartops/targeting/collaboration', icon: <Users className="w-4 h-4" /> },
    { id: 'mission-command', type: 'page', label: 'Mission Command', description: 'Commander Intent, Guidance', path: '/smartops/targeting/mission-command', icon: <Shield className="w-4 h-4" /> },
    { id: 'dashboard', type: 'page', label: 'Dashboard', description: 'Targeting Cell Operations Center', path: '/smartops/targeting-cell-dashboard', icon: <Target className="w-4 h-4" /> },
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
              path = `/smartops/targeting/targets`; // Could navigate to specific target later
              break;
            case 'bda':
              icon = <BarChart3 className="w-4 h-4" />;
              path = `/smartops/targeting/effects`;
              break;
            case 'decision':
              icon = <Users className="w-4 h-4" />;
              path = `/smartops/targeting/collaboration`;
              break;
            case 'isr_platform':
              icon = <Brain className="w-4 h-4" />;
              path = `/smartops/targeting/intelligence`;
              break;
            case 'strike_platform':
              icon = <Zap className="w-4 h-4" />;
              path = `/smartops/targeting/assets`;
              break;
            default:
              icon = <Target className="w-4 h-4" />;
              path = '/smartops/targeting-cell-dashboard';
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4" onClick={() => setIsOpen(false)}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-b border-slate-800">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search targets, pages, metrics..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          {query && (
            <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
              {results.length > 0 ? (
                <div className="py-1 sm:py-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-800 active:bg-slate-700 transition-colors text-left touch-manipulation",
                        index === selectedIndex && "bg-slate-800"
                      )}
                    >
                      <div className="text-slate-400 flex-shrink-0">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-white truncate">{result.label}</div>
                        {result.description && (
                          <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1">{result.description}</div>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 uppercase flex-shrink-0 hidden sm:block">{result.type}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 sm:py-8 text-center text-slate-400 text-xs sm:text-sm">
                  No results found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!query && (
            <div className="px-4 py-8 text-center">
              <div className="text-slate-400 text-sm mb-2">Start typing to search...</div>
              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">↓</kbd>
                  <span className="ml-1">Navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">Enter</kbd>
                  <span className="ml-1">Select</span>
                </div>
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">Esc</kbd>
                  <span className="ml-1">Close</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 -z-10" />
    </div>
  );
}
