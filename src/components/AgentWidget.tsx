import { useMemo } from 'react';
import {
  Bot,
  CheckCircle,
  ArrowRight,
  Zap,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { AIAgent, AgentActivity } from '../types';

interface AgentWidgetProps {
  agents: AIAgent[];
  onViewAgents: () => void;
  onViewPerson?: (personId: string) => void;
}

export function AgentWidget({ agents, onViewAgents, onViewPerson }: AgentWidgetProps) {
  const stats = useMemo(() => {
    const active = agents.filter(a => a.isEnabled && a.status === 'active').length;
    const total = agents.filter(a => a.status !== 'coming-soon').length;
    const runsToday = agents.reduce((sum, a) => sum + (a.runsToday || 0), 0);

    // Get all activities from all agents
    const allActivities: (AgentActivity & { agentName: string })[] = agents
      .flatMap(a => (a.activityLog || []).map(log => ({ ...log, agentName: a.name })))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const successRate = allActivities.length > 0
      ? Math.round((allActivities.filter(a => a.status === 'success').length / allActivities.length) * 100)
      : 100;

    return { active, total, runsToday, allActivities, successRate };
  }, [agents]);

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

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
          <Bot size={16} className="text-indigo-500" />
          AI Agents
        </h2>
        <button
          onClick={onViewAgents}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          Manage
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-dark-850 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">{stats.active}/{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400">Active</p>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-dark-850 rounded-lg">
          <p className="text-lg font-semibold text-gray-900 dark:text-dark-100">{stats.runsToday}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400">Runs Today</p>
        </div>
        <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{stats.successRate}%</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Success</p>
        </div>
      </div>

      {/* Recent Activity */}
      {stats.allActivities.length > 0 ? (
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-dark-400 mb-2">Recent Activity</p>
          <div className="space-y-1.5">
            {stats.allActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-dark-850 rounded-lg"
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  activity.status === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20'
                    : activity.status === 'failed'
                    ? 'bg-red-100 dark:bg-red-500/20'
                    : 'bg-gray-100 dark:bg-dark-700'
                }`}>
                  {activity.status === 'success' && <CheckCircle size={10} className="text-emerald-600 dark:text-emerald-400" />}
                  {activity.status === 'failed' && <AlertCircle size={10} className="text-red-600 dark:text-red-400" />}
                  {activity.status === 'skipped' && <Clock size={10} className="text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-dark-300 truncate">
                      {activity.agentName}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-dark-500">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  {activity.targetPersonName && (
                    <button
                      onClick={() => activity.targetPersonId && onViewPerson?.(activity.targetPersonId)}
                      className="text-xs text-gray-600 dark:text-dark-400 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                    >
                      {activity.targetPersonName}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <Zap className="mx-auto text-gray-300 dark:text-dark-600 mb-2\" size={20} />
          <p className="text-xs text-gray-400 dark:text-dark-500">No recent agent activity</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-700">
        <button
          onClick={onViewAgents}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
        >
          <Bot size={14} />
          Configure Agents
        </button>
      </div>
    </div>
  );
}
