import {
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  MessageSquare,
  Tag,
  FileText,
  Bell,
  Clock,
} from 'lucide-react';
import type { AgentActivity, AgentTriggerType } from '../types';

interface AgentActivityLogProps {
  activities: AgentActivity[];
  onViewPerson?: (personId: string) => void;
  maxItems?: number;
}

const triggerIcons: Record<AgentTriggerType, React.ReactNode> = {
  new_donation: <span className="text-emerald-500">$</span>,
  new_member: <User size={12} className="text-blue-500" />,
  birthday: <span className="text-pink-500">🎂</span>,
  anniversary: <span className="text-purple-500">🎉</span>,
  attendance_drop: <AlertCircle size={12} className="text-amber-500" />,
  giving_change: <span className="text-indigo-500">📊</span>,
  prayer_request: <span className="text-red-500">🙏</span>,
  task_due: <Clock size={12} className="text-orange-500" />,
  schedule: <Clock size={12} className="text-gray-500" />,
};

const actionIcons: Record<string, React.ReactNode> = {
  send_email: <Mail size={10} className="text-blue-500" />,
  send_sms: <MessageSquare size={10} className="text-green-500" />,
  create_task: <FileText size={10} className="text-orange-500" />,
  add_tag: <Tag size={10} className="text-purple-500" />,
  notify_staff: <Bell size={10} className="text-pink-500" />,
  log_interaction: <FileText size={10} className="text-gray-500" />,
};

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function AgentActivityLog({ activities, onViewPerson, maxItems = 20 }: AgentActivityLogProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto text-gray-300 dark:text-dark-600 mb-2" size={24} />
        <p className="text-sm text-gray-500 dark:text-dark-400">No activity yet</p>
        <p className="text-xs text-gray-400 dark:text-dark-500">Agent actions will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {displayActivities.map((activity) => (
        <div
          key={activity.id}
          className={`p-3 rounded-lg border ${
            activity.status === 'success'
              ? 'border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-850'
              : activity.status === 'failed'
              ? 'border-red-100 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5'
              : 'border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Status icon */}
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              activity.status === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                : activity.status === 'failed'
                ? 'bg-red-100 dark:bg-red-500/20'
                : 'bg-gray-100 dark:bg-dark-700'
            }`}>
              {activity.status === 'success' && <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />}
              {activity.status === 'failed' && <XCircle size={12} className="text-red-600 dark:text-red-400" />}
              {activity.status === 'skipped' && <AlertCircle size={12} className="text-gray-400" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 dark:bg-dark-700 text-xs">
                  {triggerIcons[activity.triggerType]}
                </span>
                <span className="text-xs text-gray-500 dark:text-dark-400">
                  {activity.triggerType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-400 dark:text-dark-500">•</span>
                <span className="text-xs text-gray-400 dark:text-dark-500">
                  {formatTime(activity.timestamp)}
                </span>
              </div>

              {/* Target person */}
              {activity.targetPersonName && (
                <button
                  onClick={() => activity.targetPersonId && onViewPerson?.(activity.targetPersonId)}
                  className="text-sm font-medium text-gray-900 dark:text-dark-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {activity.targetPersonName}
                </button>
              )}

              {/* Actions taken */}
              {activity.actionsTaken.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {activity.actionsTaken.map((action, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-[10px] text-gray-600 dark:text-dark-400"
                    >
                      {actionIcons[action] || <CheckCircle size={10} />}
                      {action.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Details */}
              {activity.details && (
                <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                  {activity.details}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {activities.length > maxItems && (
        <p className="text-xs text-center text-gray-400 dark:text-dark-500 pt-2">
          Showing {maxItems} of {activities.length} activities
        </p>
      )}
    </div>
  );
}
