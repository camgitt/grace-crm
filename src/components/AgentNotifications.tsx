import { useState } from 'react';
import {
  Bell,
  X,
  Bot,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronRight,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { AgentNotification } from '../hooks/useAgentEngine';

interface AgentNotificationsProps {
  notifications: AgentNotification[];
  onClear: (id: string) => void;
  onClearAll: () => void;
  onViewPerson?: (personId: string) => void;
  onViewAgents?: () => void;
}

export function AgentNotifications({
  notifications,
  onClear,
  onClearAll,
  onViewPerson,
  onViewAgents,
}: AgentNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-750 rounded-lg transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-800 rounded-xl shadow-xl border border-gray-200 dark:border-dark-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-indigo-500" />
                <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">
                  Agent Activity
                </h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell className="mx-auto text-gray-300 dark:text-dark-600 mb-2" size={24} />
                  <p className="text-sm text-gray-500 dark:text-dark-400">No recent activity</p>
                  <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">
                    Agent notifications will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-dark-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-750 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.type === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20'
                              : notification.type === 'warning'
                              ? 'bg-amber-100 dark:bg-amber-500/20'
                              : 'bg-blue-100 dark:bg-blue-500/20'
                          }`}
                        >
                          {notification.type === 'success' && (
                            <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                          )}
                          {notification.type === 'warning' && (
                            <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
                          )}
                          {notification.type === 'info' && (
                            <Info size={14} className="text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-1.5">
                                {notification.title}
                                {notification.aiGenerated && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-medium">
                                    <Sparkles size={8} />
                                    AI
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                                {notification.message}
                              </p>
                              {notification.aiContent && (
                                <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mb-1 flex items-center gap-1">
                                    <Sparkles size={8} />
                                    AI-Generated Message
                                  </p>
                                  <p className="text-xs text-gray-700 dark:text-dark-300 italic leading-relaxed">
                                    "{notification.aiContent.length > 150
                                      ? notification.aiContent.substring(0, 150) + '...'
                                      : notification.aiContent}"
                                  </p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => onClear(notification.id)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 rounded transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-400 dark:text-dark-500">
                              {notification.agentName} &middot; {formatTime(notification.timestamp)}
                            </span>
                            {notification.personId && onViewPerson && (
                              <button
                                onClick={() => {
                                  onViewPerson(notification.personId!);
                                  setIsOpen(false);
                                }}
                                className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                              >
                                {notification.personName}
                                <ChevronRight size={10} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 dark:border-dark-700 p-2">
              <button
                onClick={() => {
                  onViewAgents?.();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
              >
                <Bot size={14} />
                View All Agents
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
