// Filter Presets Hook
// Manages saved filter presets in localStorage

import { useState, useEffect } from 'react';
import type { FilterState } from '../components/shared/FilterPanel';

interface FilterPreset {
  name: string;
  filters: FilterState;
  createdAt: number;
}

const STORAGE_KEY_PREFIX = 'targeting_filter_presets_';
const MAX_PRESETS = 10;

export function useFilterPresets(pageId: string) {
  const storageKey = `${STORAGE_KEY_PREFIX}${pageId}`;
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as FilterPreset[];
        setPresets(parsed);
      }
    } catch (error) {
      console.error('Failed to load filter presets:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  // Save preset
  const savePreset = (name: string, filters: FilterState) => {
    const newPreset: FilterPreset = {
      name,
      filters,
      createdAt: Date.now(),
    };

    setPresets((prev) => {
      // Remove preset with same name if exists
      const filtered = prev.filter((p) => p.name !== name);
      // Add new preset
      const updated = [newPreset, ...filtered].slice(0, MAX_PRESETS);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save filter preset:', error);
      }

      return updated;
    });
  };

  // Delete preset
  const deletePreset = (name: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.name !== name);

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to delete filter preset:', error);
      }

      return updated;
    });
  };

  // Clear all presets
  const clearPresets = () => {
    setPresets([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Failed to clear filter presets:', error);
    }
  };

  return {
    presets: presets.map((p) => ({ name: p.name, filters: p.filters })),
    isLoaded,
    savePreset,
    deletePreset,
    clearPresets,
  };
}
