// Realtime Updates Hook
// Subscribes to real-time updates via WebSocket/SSE

import { useEffect, useState, useCallback } from 'react';
import { realtimeClient, type RealtimeUpdate } from '@/lib/smartops/websocket';
import type { UpdateType } from '@/lib/smartops/websocket';

// Re-export UpdateType for convenience
export type { UpdateType } from '@/lib/smartops/websocket';

interface UseRealtimeUpdatesOptions {
  types?: UpdateType[]; // Filter by update types
  onUpdate?: (update: RealtimeUpdate) => void;
  enabled?: boolean; // Default: true
}

interface UseRealtimeUpdatesResult {
  updates: RealtimeUpdate[];
  isConnected: boolean;
  clearUpdates: () => void;
  markAsRead: (updateId: string) => void;
  unreadCount: number;
}

export function useRealtimeUpdates({
  types,
  onUpdate,
  enabled = true,
}: UseRealtimeUpdatesOptions = {}): UseRealtimeUpdatesResult {
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Handle incoming updates
  const handleUpdate = useCallback(
    (update: RealtimeUpdate) => {
      // Filter by type if specified
      if (types && !types.includes(update.type)) {
        return;
      }

      // Add to updates list
      setUpdates((prev) => [update, ...prev].slice(0, 100)); // Keep last 100 updates

      // Call custom callback
      onUpdate?.(update);
    },
    [types, onUpdate]
  );

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to updates
    const unsubscribe = realtimeClient.subscribe(handleUpdate);

    // Subscribe to connection changes
    const unsubscribeConnection = realtimeClient.onConnectionChange(setIsConnected);

    // Check initial connection state
    setIsConnected(realtimeClient.isConnected());

    return () => {
      unsubscribe();
      unsubscribeConnection();
    };
  }, [enabled, handleUpdate]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setReadIds(new Set());
  }, []);

  const markAsRead = useCallback((updateId: string) => {
    setReadIds((prev) => new Set([...prev, updateId]));
  }, []);

  // Generate unique ID for each update (entityId + timestamp)
  const getUpdateId = (update: RealtimeUpdate): string => {
    return `${update.entityType}-${update.entityId}-${update.timestamp}`;
  };

  const unreadCount = updates.filter(
    (update) => !readIds.has(getUpdateId(update))
  ).length;

  return {
    updates,
    isConnected,
    clearUpdates,
    markAsRead: (updateId: string) => {
      markAsRead(updateId);
    },
    unreadCount,
  };
}
