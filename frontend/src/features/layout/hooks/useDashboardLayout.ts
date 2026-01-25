// Dashboard Layout Hook
// Manages customizable dashboard widget arrangement

import { useState, useEffect } from 'react';

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'section' | 'panel';
  visible: boolean;
  order: number;
  column?: number; // For grid layouts
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number; // Grid columns (1-4)
}

const STORAGE_KEY = 'targeting_dashboard_layout';
const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: [
    { id: 'critical-metrics', type: 'section', visible: true, order: 0 },
    { id: 'f3ead-pipeline', type: 'section', visible: true, order: 1 },
    { id: 'top-priority-targets', type: 'section', visible: true, order: 2 },
    { id: 'recently-viewed', type: 'section', visible: true, order: 3 },
    { id: 'mission-context', type: 'section', visible: true, order: 4 },
    { id: 'quick-access', type: 'section', visible: true, order: 5 },
  ],
  columns: 3,
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load layout from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DashboardLayout;
        setLayout(parsed);
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save layout to localStorage
  const saveLayout = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  };

  // Update widget visibility
  const setWidgetVisible = (widgetId: string, visible: boolean) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) =>
        w.id === widgetId ? { ...w, visible } : w
      ),
    };
    saveLayout(updated);
  };

  // Update widget order
  const setWidgetOrder = (widgetId: string, newOrder: number) => {
    const updated = {
      ...layout,
      widgets: layout.widgets.map((w) =>
        w.id === widgetId ? { ...w, order: newOrder } : w
      ).sort((a, b) => a.order - b.order),
    };
    saveLayout(updated);
  };

  // Move widget (reorder)
  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const widget = layout.widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    const currentIndex = layout.widgets.findIndex((w) => w.id === widgetId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= layout.widgets.length) return;

    const reordered = [...layout.widgets];
    [reordered[currentIndex], reordered[newIndex]] = [
      reordered[newIndex],
      reordered[currentIndex],
    ];

    const updated = {
      ...layout,
      widgets: reordered.map((w, i) => ({ ...w, order: i })),
    };
    saveLayout(updated);
  };

  // Reset to default layout
  const resetLayout = () => {
    saveLayout(DEFAULT_LAYOUT);
  };

  // Get visible widgets in order
  const getVisibleWidgets = (): DashboardWidget[] => {
    return layout.widgets
      .filter((w) => w.visible)
      .sort((a, b) => a.order - b.order);
  };

  return {
    layout: isLoaded ? layout : DEFAULT_LAYOUT,
    isLoaded,
    setWidgetVisible,
    setWidgetOrder,
    moveWidget,
    resetLayout,
    getVisibleWidgets,
    saveLayout,
  };
}
