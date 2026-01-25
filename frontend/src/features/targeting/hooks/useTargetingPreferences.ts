// Targeting Dashboard User Preferences Hook
// Manages user preferences for default view, collapsed sections, etc.

import { useState, useEffect } from 'react';

interface TargetingPreferences {
  defaultView: 'summary' | 'full';
  collapsedSections: {
    missionContext: boolean;
    quickAccess: boolean;
  };
}

const STORAGE_KEY = 'targeting_preferences';
const DEFAULT_PREFERENCES: TargetingPreferences = {
  defaultView: 'summary',
  collapsedSections: {
    missionContext: true,
    quickAccess: true,
  },
};

export function useTargetingPreferences() {
  const [preferences, setPreferences] = useState<TargetingPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TargetingPreferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        // Invalid data, use defaults
      }
    }
    setIsLoaded(true);
  }, []);

  // Save preferences to localStorage
  const updatePreferences = (updates: Partial<TargetingPreferences>) => {
    const updated = { ...preferences, ...updates };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const setDefaultView = (view: 'summary' | 'full') => {
    updatePreferences({ defaultView: view });
  };

  const setCollapsedSection = (section: keyof TargetingPreferences['collapsedSections'], collapsed: boolean) => {
    updatePreferences({
      collapsedSections: {
        ...preferences.collapsedSections,
        [section]: collapsed,
      },
    });
  };

  return {
    preferences: isLoaded ? preferences : DEFAULT_PREFERENCES,
    isLoaded,
    setDefaultView,
    setCollapsedSection,
    updatePreferences,
  };
}
