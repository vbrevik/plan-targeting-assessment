// Update Notification Component
// Shows real-time update badges and notifications

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Target, FileText, CheckCircle2, Users } from 'lucide-react';
import { useRealtimeUpdates, type UpdateType } from '@/features/shared/hooks/useRealtimeUpdates';
import { cn } from '@/lib/utils';

interface UpdateNotificationProps {
  className?: string;
  showBadge?: boolean;
  showDropdown?: boolean;
}

export function UpdateNotification({
  className = '',
  showBadge = true,
  showDropdown = true,
}: UpdateNotificationProps) {
  const { updates, isConnected, unreadCount, markAsRead, clearUpdates } = useRealtimeUpdates();
  const [isOpen, setIsOpen] = useState(false);

  const getUpdateIcon = (type: UpdateType) => {
    switch (type) {
      case 'target_status_changed':
      case 'new_target_nominated':
        return <Target className="w-4 h-4" />;
      case 'bda_assessment_created':
        return <FileText className="w-4 h-4" />;
      case 'decision_gate_changed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'jtb_session_updated':
        return <Users className="w-4 h-4" />;
      case 'tst_alert':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getUpdateColor = (type: UpdateType): string => {
    switch (type) {
      case 'tst_alert':
        return 'text-red-400 bg-red-950/30 border-red-800';
      case 'target_status_changed':
        return 'text-blue-400 bg-blue-950/30 border-blue-800';
      case 'bda_assessment_created':
        return 'text-green-400 bg-green-950/30 border-green-800';
      case 'decision_gate_changed':
        return 'text-amber-400 bg-amber-950/30 border-amber-800';
      default:
        return 'text-slate-400 bg-slate-800/30 border-slate-700';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAllRead = () => {
    updates.forEach((update) => {
      markAsRead(`${update.entityType}-${update.entityId}-${update.timestamp}`);
    });
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-800 rounded transition-colors touch-manipulation"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {showBadge && unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {!isConnected && (
          <span
            className="absolute bottom-0 right-0 w-2 h-2 bg-amber-500 rounded-full border-2 border-slate-900"
            title="Disconnected"
          />
        )}
      </button>

      {showDropdown && isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-black uppercase tracking-tight text-white">
                  Updates
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-950/50 border border-red-800 rounded text-xs font-bold text-red-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium uppercase"
                    aria-label="Mark all as read"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Updates List */}
            <div className="flex-1 overflow-y-auto">
              {updates.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No updates yet
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {updates.map((update, index) => {
                    const updateId = `${update.entityType}-${update.entityId}-${update.timestamp}`;
                    const isRead = false; // Could track read state
                    const isUnread = !isRead;

                    return (
                      <div
                        key={`${updateId}-${index}`}
                        className={cn(
                          'p-3 hover:bg-slate-800/50 transition-colors',
                          isUnread && 'bg-slate-800/30'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'p-2 rounded border',
                              getUpdateColor(update.type)
                            )}
                          >
                            {getUpdateIcon(update.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white uppercase">
                                {update.type.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {formatTimestamp(update.timestamp)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                              {update.entityType}: {update.entityId}
                            </p>
                            {isUnread && (
                              <div className="mt-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                              </div>
                            )}
                          </div>
                          {isUnread && (
                            <button
                              onClick={() => markAsRead(updateId)}
                              className="p-1 hover:bg-slate-700 rounded transition-colors"
                              aria-label="Mark as read"
                            >
                              <Check className="w-3 h-3 text-slate-400" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {updates.length > 0 && (
              <div className="p-3 border-t border-slate-700">
                <button
                  onClick={clearUpdates}
                  className="w-full text-xs text-slate-400 hover:text-slate-300 font-medium uppercase text-center"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
