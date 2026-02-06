import { useMemo } from 'react';
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Star,
  AlertTriangle,
  Users,
  EyeOff,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { View } from '../../types';
import { usePastoralCareData } from '../../hooks/usePastoralCareData';

interface CareAnalyticsDashboardProps {
  setView: (view: View) => void;
  churchId?: string;
}

const categoryLabels: Record<string, string> = {
  'marriage': 'Marriage & Relationships',
  'addiction': 'Addiction & Recovery',
  'grief': 'Grief & Loss',
  'faith-questions': 'Faith & Questions',
  'anxiety-depression': 'Anxiety & Depression',
  'financial': 'Financial Struggles',
  'parenting': 'Parenting',
  'crisis': 'Crisis',
  'general': 'General',
};

const categoryColors: Record<string, string> = {
  'marriage': 'bg-pink-500',
  'addiction': 'bg-orange-500',
  'grief': 'bg-indigo-500',
  'faith-questions': 'bg-sky-500',
  'anxiety-depression': 'bg-yellow-500',
  'financial': 'bg-emerald-500',
  'parenting': 'bg-violet-500',
  'crisis': 'bg-red-500',
  'general': 'bg-gray-400',
};

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  crisis: { label: 'Crisis', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10' },
  high: { label: 'High', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  medium: { label: 'Medium', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  low: { label: 'Low', color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/10' },
};

const severityConfig: Record<string, { color: string; bg: string }> = {
  high: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10' },
  medium: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  low: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10' },
};

export function CareAnalyticsDashboard({ setView, churchId }: CareAnalyticsDashboardProps) {
  const { conversations, crisisEvents, stats, getLeaderProfiles } = usePastoralCareData(churchId);

  const leaders = useMemo(() => getLeaderProfiles(), [getLeaderProfiles]);

  // Computed: average rating
  const averageRating = useMemo(() => {
    const rated = conversations.filter(c => c.rating != null && c.rating > 0);
    if (rated.length === 0) return 0;
    const sum = rated.reduce((acc, c) => acc + (c.rating as number), 0);
    return sum / rated.length;
  }, [conversations]);

  // Computed: anonymous percentage
  const anonymousPercent = useMemo(() => {
    if (conversations.length === 0) return 0;
    const anonCount = conversations.filter(c => c.is_anonymous).length;
    return Math.round((anonCount / conversations.length) * 100);
  }, [conversations]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [conversations]);

  const maxCategoryCount = useMemo(() => {
    if (categoryBreakdown.length === 0) return 1;
    return Math.max(...categoryBreakdown.map(c => c.count), 1);
  }, [categoryBreakdown]);

  // Priority distribution
  const priorityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    conversations.forEach(c => {
      counts[c.priority] = (counts[c.priority] || 0) + 1;
    });
    return ['crisis', 'high', 'medium', 'low']
      .filter(p => counts[p] != null)
      .map(p => ({ priority: p, count: counts[p] || 0 }));
  }, [conversations]);

  // Daily volume (last 30 days)
  const dailyVolume = useMemo(() => {
    const now = new Date();
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({ date: key, label, count: 0 });
    }
    conversations.forEach(c => {
      const key = c.created_at.split('T')[0];
      const day = days.find(d => d.date === key);
      if (day) day.count++;
    });
    return days;
  }, [conversations]);

  const maxDailyCount = useMemo(() => {
    return Math.max(...dailyVolume.map(d => d.count), 1);
  }, [dailyVolume]);

  // Leader workload
  const leaderWorkload = useMemo(() => {
    const workloadMap: Record<string, { name: string; active: number; resolved: number; total: number }> = {};
    leaders.forEach(l => {
      workloadMap[l.id] = { name: l.displayName, active: 0, resolved: 0, total: 0 };
    });
    conversations.forEach(c => {
      if (c.leader_id && workloadMap[c.leader_id]) {
        workloadMap[c.leader_id].total++;
        if (c.status === 'active' || c.status === 'waiting' || c.status === 'escalated') {
          workloadMap[c.leader_id].active++;
        }
        if (c.status === 'resolved') {
          workloadMap[c.leader_id].resolved++;
        }
      }
    });
    return Object.values(workloadMap).sort((a, b) => b.active - a.active);
  }, [conversations, leaders]);

  // Recent ratings
  const recentRatings = useMemo(() => {
    return conversations
      .filter(c => c.rating != null && c.rating > 0)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10);
  }, [conversations]);

  // Crisis timeline
  const recentCrisisEvents = useMemo(() => {
    return [...crisisEvents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
  }, [crisisEvents]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView('care-dashboard')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-dark-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <BarChart3 className="text-violet-600 dark:text-violet-400" size={24} />
            Care Analytics
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-0.5 text-sm">
            Comprehensive insights into pastoral care conversations
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <SummaryCard
          icon={<MessageSquare size={14} />}
          label="Total Conversations"
          value={String(stats.totalConversations)}
          color="text-blue-500"
        />
        <SummaryCard
          icon={<TrendingUp size={14} />}
          label="Active"
          value={String(stats.activeCount)}
          color="text-emerald-500"
        />
        <SummaryCard
          icon={<CheckCircle2 size={14} />}
          label="Resolved"
          value={String(stats.resolvedCount)}
          color="text-gray-500"
        />
        <SummaryCard
          icon={<Star size={14} />}
          label="Avg Rating"
          value={averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
          color="text-amber-500"
        />
        <SummaryCard
          icon={<AlertTriangle size={14} />}
          label="Crisis Events"
          value={String(crisisEvents.length)}
          color="text-red-500"
        />
        <SummaryCard
          icon={<EyeOff size={14} />}
          label="Anonymous %"
          value={conversations.length > 0 ? `${anonymousPercent}%` : 'N/A'}
          color="text-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4">Category Breakdown</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-dark-500 text-center py-6">No conversations yet</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(({ category, count }) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-700 dark:text-dark-300">
                      {categoryLabels[category] || category}
                    </span>
                    <span className="text-xs font-medium text-gray-900 dark:text-dark-100">{count}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-dark-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${categoryColors[category] || 'bg-gray-400'}`}
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Priority Distribution */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4">Priority Distribution</h2>
          {priorityBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-dark-500 text-center py-6">No conversations yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {priorityBreakdown.map(({ priority, count }) => {
                const cfg = priorityConfig[priority] || priorityConfig.medium;
                return (
                  <div
                    key={priority}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl ${cfg.bg}`}
                  >
                    <span className={`text-2xl font-bold ${cfg.color}`}>{count}</span>
                    <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Daily Volume Chart */}
      <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center gap-2">
          <Clock size={14} className="text-gray-400 dark:text-dark-500" />
          Daily Volume (Last 30 Days)
        </h2>
        <div className="flex items-end gap-[3px] h-32">
          {dailyVolume.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div
                className={`w-full rounded-t transition-all ${
                  day.count > 0
                    ? 'bg-violet-500 dark:bg-violet-400 group-hover:bg-violet-600 dark:group-hover:bg-violet-300'
                    : 'bg-gray-100 dark:bg-dark-800'
                }`}
                style={{
                  height: day.count > 0 ? `${Math.max((day.count / maxDailyCount) * 100, 8)}%` : '4px',
                  minHeight: day.count > 0 ? '8px' : '4px',
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 hidden group-hover:block z-10">
                <div className="bg-gray-900 dark:bg-dark-700 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap">
                  {day.label}: {day.count} conversation{day.count !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-gray-400 dark:text-dark-500">
            {dailyVolume[0]?.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-dark-500">
            {dailyVolume[Math.floor(dailyVolume.length / 2)]?.label}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-dark-500">
            {dailyVolume[dailyVolume.length - 1]?.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Leader Workload */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Users size={14} className="text-gray-400 dark:text-dark-500" />
            Leader Workload
          </h2>
          {leaderWorkload.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-dark-500 text-center py-6">No leaders found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="text-left py-2 text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider font-medium">
                      Leader
                    </th>
                    <th className="text-center py-2 text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider font-medium">
                      Active
                    </th>
                    <th className="text-center py-2 text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider font-medium">
                      Resolved
                    </th>
                    <th className="text-center py-2 text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider font-medium">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderWorkload.map((leader) => (
                    <tr
                      key={leader.name}
                      className="border-b border-gray-50 dark:border-white/[0.02] last:border-0"
                    >
                      <td className="py-2.5 text-xs font-medium text-gray-900 dark:text-dark-100">
                        {leader.name}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`text-xs font-medium ${leader.active > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-dark-500'}`}>
                          {leader.active}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-xs text-gray-600 dark:text-dark-300">
                          {leader.resolved}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-xs font-medium text-gray-900 dark:text-dark-100">
                          {leader.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Ratings */}
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            <Star size={14} className="text-gray-400 dark:text-dark-500" />
            Recent Ratings
          </h2>
          {recentRatings.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-dark-500 text-center py-6">No ratings yet</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentRatings.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg"
                >
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={
                          star <= (conv.rating || 0)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200 dark:text-dark-600'
                        }
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    {conv.feedback ? (
                      <p className="text-xs text-gray-700 dark:text-dark-300 line-clamp-2">
                        {conv.feedback}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-dark-500 italic">No feedback provided</p>
                    )}
                    <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-1">
                      {categoryLabels[conv.category] || conv.category} &middot;{' '}
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crisis Timeline */}
      <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-gray-400 dark:text-dark-500" />
          Crisis Timeline
        </h2>
        {recentCrisisEvents.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-dark-500 text-center py-6">No crisis events recorded</p>
        ) : (
          <div className="space-y-2">
            {recentCrisisEvents.map((event) => {
              const sevCfg = severityConfig[event.severity] || severityConfig.medium;
              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg"
                >
                  <div className="text-xs text-gray-500 dark:text-dark-400 flex-shrink-0 w-24">
                    {new Date(event.created_at).toLocaleDateString()}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${sevCfg.bg} ${sevCfg.color}`}>
                    {event.severity}
                  </span>
                  <div className="flex-1" />
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      event.resolved
                        ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                    }`}
                  >
                    {event.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function SummaryCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-dark-100">{value}</p>
    </div>
  );
}
