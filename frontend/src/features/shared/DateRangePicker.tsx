// Date Range Picker Component
// Allows selecting date ranges for historical data views

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DateRangePreset[];
  className?: string;
}

const PRESETS: Record<DateRangePreset, { label: string; getRange: () => DateRange }> = {
  today: {
    label: 'Today',
    getRange: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  yesterday: {
    label: 'Yesterday',
    getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  last7days: {
    label: 'Last 7 Days',
    getRange: () => {
      const today = new Date();
      return { from: subDays(today, 7), to: today };
    },
  },
  last30days: {
    label: 'Last 30 Days',
    getRange: () => {
      const today = new Date();
      return { from: subDays(today, 30), to: today };
    },
  },
  thisWeek: {
    label: 'This Week',
    getRange: () => {
      const today = new Date();
      return { from: startOfWeek(today), to: endOfWeek(today) };
    },
  },
  lastWeek: {
    label: 'Last Week',
    getRange: () => {
      const lastWeek = subDays(new Date(), 7);
      return { from: startOfWeek(lastWeek), to: endOfWeek(lastWeek) };
    },
  },
  thisMonth: {
    label: 'This Month',
    getRange: () => {
      const today = new Date();
      return { from: startOfMonth(today), to: endOfMonth(today) };
    },
  },
  lastMonth: {
    label: 'Last Month',
    getRange: () => {
      const lastMonth = subDays(new Date(), 30);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
  thisYear: {
    label: 'This Year',
    getRange: () => {
      const today = new Date();
      return { from: startOfYear(today), to: endOfYear(today) };
    },
  },
  custom: {
    label: 'Custom Range',
    getRange: () => {
      const today = new Date();
      return { from: subDays(today, 7), to: today };
    },
  },
};

export function DateRangePicker({
  value,
  onChange,
  presets = ['today', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'custom'],
  className = '',
}: DateRangePickerProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const handlePresetSelect = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowPresets(false);
      setShowFromPicker(true);
    } else {
      onChange(PRESETS[preset].getRange());
      setShowPresets(false);
    }
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4', className)}>
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => handlePresetSelect(preset)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs font-bold text-slate-300 hover:bg-slate-700 active:bg-slate-600 transition-colors touch-manipulation"
          >
            {PRESETS[preset].label}
          </button>
        ))}
      </div>

      {/* Date Range Display */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400" />
        <div className="text-xs text-slate-400">
          <span className="font-bold text-white">
            {format(value.from, 'MMM d, yyyy')}
          </span>
          {' → '}
          <span className="font-bold text-white">
            {format(value.to, 'MMM d, yyyy')}
          </span>
        </div>
      </div>

      {/* Custom Date Pickers (simplified - would use a proper date picker library in production) */}
      {showFromPicker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-sm font-black uppercase text-white mb-4">Select Custom Range</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">From</label>
                <input
                  type="date"
                  value={format(value.from, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    onChange({ ...value, from: newDate });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase mb-2 block">To</label>
                <input
                  type="date"
                  value={format(value.to, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    onChange({ ...value, to: newDate });
                  }}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowFromPicker(false);
                    setShowToPicker(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowFromPicker(false);
                    setShowToPicker(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold rounded hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
