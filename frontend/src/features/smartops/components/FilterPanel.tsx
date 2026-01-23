// Filter Panel Component
// Provides multi-criteria filtering for detail pages

import { useState, useEffect } from 'react';
import { Filter, X, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text';
  options?: FilterOption[];
  placeholder?: string;
}

export type FilterState = {
  [key: string]: string | string[] | { from?: string; to?: string } | undefined;
};

interface FilterPanelProps {
  configs: FilterConfig[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear?: () => void;
  onSavePreset?: (name: string, filters: FilterState) => void;
  savedPresets?: Array<{ name: string; filters: FilterState }>;
  className?: string;
}

export function FilterPanel({
  configs,
  filters,
  onFiltersChange,
  onClear,
  onSavePreset,
  savedPresets = [],
  className = '',
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return value.from || value.to;
      }
      return value !== undefined && value !== '';
    }
  ).length;

  const handleFilterChange = (filterId: string, value: any) => {
    onFiltersChange({
      ...filters,
      [filterId]: value,
    });
  };

  const handleClear = () => {
    const cleared: FilterState = {};
    configs.forEach((config) => {
      if (config.type === 'multiselect') {
        cleared[config.id] = [];
      } else if (config.type === 'daterange') {
        cleared[config.id] = {};
      } else {
        cleared[config.id] = undefined;
      }
    });
    onFiltersChange(cleared);
    onClear?.();
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters);
      setPresetName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadPreset = (preset: { name: string; filters: FilterState }) => {
    onFiltersChange(preset.filters);
  };

  return (
    <div className={cn('bg-slate-900 border border-slate-700 rounded-lg', className)}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-white uppercase">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
            >
              Clear
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-slate-700 space-y-4">
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Saved Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {savedPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleLoadPreset(preset)}
                    className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {configs.map((config) => (
              <div key={config.id}>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">
                  {config.label}
                </label>
                {config.type === 'select' && (
                  <select
                    value={(filters[config.id] as string) || ''}
                    onChange={(e) => handleFilterChange(config.id, e.target.value || undefined)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All</option>
                    {config.options?.map((option) => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {config.type === 'multiselect' && (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {config.options?.map((option) => {
                      const selected = (filters[config.id] as string[] || []).includes(option.value);
                      return (
                        <label
                          key={option.id}
                          className="flex items-center gap-2 px-2 py-1 hover:bg-slate-800 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const current = (filters[config.id] as string[] || []);
                              const updated = e.target.checked
                                ? [...current, option.value]
                                : current.filter((v) => v !== option.value);
                              handleFilterChange(config.id, updated);
                            }}
                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-slate-300">{option.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {config.type === 'text' && (
                  <input
                    type="text"
                    value={(filters[config.id] as string) || ''}
                    onChange={(e) => handleFilterChange(config.id, e.target.value || undefined)}
                    placeholder={config.placeholder}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                )}
                {config.type === 'date' && (
                  <input
                    type="date"
                    value={(filters[config.id] as string) || ''}
                    onChange={(e) => handleFilterChange(config.id, e.target.value || undefined)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                )}
                {config.type === 'daterange' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={(filters[config.id] as { from?: string; to?: string })?.from || ''}
                      onChange={(e) => {
                        const current = (filters[config.id] as { from?: string; to?: string }) || {};
                        handleFilterChange(config.id, { ...current, from: e.target.value || undefined });
                      }}
                      placeholder="From"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="date"
                      value={(filters[config.id] as { from?: string; to?: string })?.to || ''}
                      onChange={(e) => {
                        const current = (filters[config.id] as { from?: string; to?: string }) || {};
                        handleFilterChange(config.id, { ...current, to: e.target.value || undefined });
                      }}
                      placeholder="To"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Preset */}
          {onSavePreset && activeFilterCount > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-700">
              {showSaveDialog ? (
                <>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSavePreset();
                      } else if (e.key === 'Escape') {
                        setShowSaveDialog(false);
                        setPresetName('');
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleSavePreset}
                    className="px-3 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setPresetName('');
                    }}
                    className="px-3 py-2 bg-slate-700 text-slate-300 text-sm font-bold rounded hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save as Preset
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
