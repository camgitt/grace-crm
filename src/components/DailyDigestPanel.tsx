import { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Moon,
  Sunrise,
  CheckCircle2,
  Clock,
  Users,
  Mail,
  Phone,
  Gift,
  Heart,
  ChevronRight,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Calendar,
  ArrowRight,
  Loader2,
  ListTodo,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';
import type { DailyDigest } from '../lib/agents/DayPlannerAgent';

interface DailyDigestPanelProps {
  digest: DailyDigest | null;
  isLoading: boolean;
  onRefresh: () => void;
  onViewPerson: (personId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onContactPerson: (personId: string, method: 'email' | 'phone' | 'sms') => void;
  onViewAllTasks: () => void;
  onViewCalendar: () => void;
}

const priorityColors = {
  high: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  low: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20',
};

const reasonLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new_visitor: { label: 'New Visitor', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', icon: <Sparkles size={10} /> },
  follow_up: { label: 'Follow Up', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', icon: <Clock size={10} /> },
  birthday: { label: 'Birthday', color: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/20', icon: <Gift size={10} /> },
  anniversary: { label: 'Anniversary', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20', icon: <Heart size={10} /> },
  inactive: { label: 'Inactive', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20', icon: <AlertTriangle size={10} /> },
  first_time_giver: { label: 'First Gift', color: 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/20', icon: <Gift size={10} /> },
};

export function DailyDigestPanel({
  digest,
  isLoading,
  onRefresh,
  onViewPerson,
  onCompleteTask,
  onContactPerson,
  onViewAllTasks,
  onViewCalendar,
}: DailyDigestPanelProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Get greeting info based on time
  const greetingInfo = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return {
      Icon: Sunrise,
      gradient: 'from-amber-400 via-orange-400 to-rose-400',
      bgGradient: 'from-amber-50 via-orange-50 to-rose-50 dark:from-amber-500/5 dark:via-orange-500/5 dark:to-rose-500/5',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500'
    };
    if (hour >= 12 && hour < 18) return {
      Icon: Sun,
      gradient: 'from-sky-400 via-blue-400 to-indigo-400',
      bgGradient: 'from-sky-50 via-blue-50 to-indigo-50 dark:from-sky-500/5 dark:via-blue-500/5 dark:to-indigo-500/5',
      iconBg: 'bg-gradient-to-br from-sky-400 to-blue-500'
    };
    return {
      Icon: Moon,
      gradient: 'from-indigo-400 via-purple-400 to-pink-400',
      bgGradient: 'from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5',
      iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-500'
    };
  }, [currentTime]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20 flex items-center justify-center mx-auto">
                <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={28} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="text-white" size={12} />
              </div>
            </div>
            <p className="mt-4 text-gray-600 dark:text-dark-400 font-medium">Generating your daily digest...</p>
            <p className="text-sm text-gray-400 dark:text-dark-500 mt-1">AI is analyzing your day</p>
          </div>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="text-center py-12 px-6">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-700 flex items-center justify-center mx-auto">
            <Calendar className="text-gray-400 dark:text-dark-500" size={28} />
          </div>
          <h3 className="mt-4 text-gray-900 dark:text-dark-100 font-semibold">No digest yet</h3>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">Generate your personalized daily overview</p>
          <button
            onClick={handleRefresh}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
          >
            <Zap size={16} />
            Generate Digest
          </button>
        </div>
      </div>
    );
  }

  const { Icon: GreetingIcon, bgGradient, iconBg } = greetingInfo;

  return (
    <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl border border-gray-200/50 dark:border-dark-700/50 shadow-sm overflow-hidden`}>
      {/* Header Section */}
      <div className="relative px-6 pt-6 pb-4">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
              <GreetingIcon className="text-white" size={26} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">
                {digest.greeting}!
              </h2>
              <p className="text-gray-600 dark:text-dark-400 mt-0.5">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 bg-white/60 dark:bg-dark-800/60 hover:bg-white dark:hover:bg-dark-800 rounded-xl transition-all shadow-sm border border-gray-200/50 dark:border-dark-600/50"
            title="Refresh digest"
          >
            <RefreshCw size={18} className={`text-gray-600 dark:text-dark-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <StatCard
            value={digest.stats.totalTasks}
            label="Tasks"
            icon={<ListTodo size={14} />}
            color="indigo"
          />
          <StatCard
            value={digest.stats.overdueTasks}
            label="Overdue"
            icon={<AlertTriangle size={14} />}
            color={digest.stats.overdueTasks > 0 ? 'red' : 'slate'}
            highlight={digest.stats.overdueTasks > 0}
          />
          <StatCard
            value={digest.stats.contactsToReach}
            label="Contacts"
            icon={<Users size={14} />}
            color="blue"
          />
          <StatCard
            value={digest.stats.messagesScheduled}
            label="Messages"
            icon={<Send size={14} />}
            color="purple"
          />
        </div>
      </div>

      {/* AI Summary */}
      {digest.aiSummary && (
        <div className="mx-4 mb-4 p-4 bg-white/70 dark:bg-dark-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-dark-600/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Sparkles className="text-white" size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500 dark:text-dark-400 mb-1">AI Insights</p>
              <p className="text-sm text-gray-700 dark:text-dark-300 leading-relaxed">{digest.aiSummary}</p>
              {digest.aiRecommendations.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {digest.aiRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                      <ArrowRight size={12} className="flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Celebrations */}
          {digest.celebrations.length > 0 && (
            <ContentCard
              title="Today's Celebrations"
              icon={<Gift size={16} />}
              iconColor="pink"
            >
              <div className="space-y-2">
                {digest.celebrations.map((celebration) => (
                  <div
                    key={`${celebration.type}-${celebration.personId}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-500/5 dark:to-rose-500/5 border border-pink-100 dark:border-pink-500/10 group hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
                        {celebration.type === 'birthday' ? (
                          <Gift className="text-white" size={16} />
                        ) : (
                          <Heart className="text-white" size={16} />
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => onViewPerson(celebration.personId)}
                          className="text-sm font-semibold text-gray-900 dark:text-dark-100 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                        >
                          {celebration.name}
                        </button>
                        <p className="text-xs text-gray-500 dark:text-dark-400">
                          {celebration.type === 'birthday'
                            ? `🎂 Turning ${celebration.yearsCount}`
                            : `🎉 ${celebration.yearsCount} year${celebration.yearsCount !== 1 ? 's' : ''} as member`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {celebration.email && (
                        <ActionButton
                          onClick={() => onContactPerson(celebration.personId, 'email')}
                          icon={<Mail size={14} />}
                          title="Send email"
                          color="pink"
                        />
                      )}
                      {celebration.phone && (
                        <ActionButton
                          onClick={() => onContactPerson(celebration.personId, 'sms')}
                          icon={<MessageSquare size={14} />}
                          title="Send SMS"
                          color="pink"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          )}

          {/* Priority Tasks */}
          <ContentCard
            title="Priority Tasks"
            icon={<CheckCircle2 size={16} />}
            iconColor="indigo"
            action={
              <button
                onClick={onViewAllTasks}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight size={12} />
              </button>
            }
          >
            {digest.priorityTasks.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-400 mt-3">All caught up!</p>
                <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">No pending tasks</p>
              </div>
            ) : (
              <div className="space-y-2">
                {digest.priorityTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${
                      task.isOverdue
                        ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
                        : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700'
                    }`}
                  >
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 dark:border-dark-500 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-all group"
                    >
                      <CheckCircle2 size={12} className="text-transparent group-hover:text-emerald-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                        {task.title}
                      </p>
                      {task.personName && (
                        <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">{task.personName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] flex items-center gap-1 ${
                          task.isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-400 dark:text-dark-500'
                        }`}>
                          <Clock size={10} />
                          {task.isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* People to Contact */}
          <ContentCard
            title="People to Contact"
            icon={<Users size={16} />}
            iconColor="blue"
          >
            {digest.peopleToContact.length === 0 ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Users className="text-blue-500" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-dark-400 mt-3">No urgent contacts</p>
                <p className="text-xs text-gray-400 dark:text-dark-500 mt-1">Everyone is reached</p>
              </div>
            ) : (
              <div className="space-y-2">
                {digest.peopleToContact.slice(0, 4).map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => onViewPerson(contact.personId)}
                          className="text-sm font-semibold text-gray-900 dark:text-dark-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block transition-colors"
                        >
                          {contact.name}
                        </button>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${reasonLabels[contact.reason]?.color || 'bg-gray-100 text-gray-600'}`}>
                            {reasonLabels[contact.reason]?.icon}
                            {reasonLabels[contact.reason]?.label || contact.reason}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {contact.email && (
                        <ActionButton
                          onClick={() => onContactPerson(contact.personId, 'email')}
                          icon={<Mail size={14} />}
                          title="Email"
                          color="blue"
                        />
                      )}
                      {contact.phone && (
                        <>
                          <ActionButton
                            onClick={() => onContactPerson(contact.personId, 'phone')}
                            icon={<Phone size={14} />}
                            title="Call"
                            color="blue"
                          />
                          <ActionButton
                            onClick={() => onContactPerson(contact.personId, 'sms')}
                            icon={<MessageSquare size={14} />}
                            title="SMS"
                            color="blue"
                          />
                        </>
                      )}
                      <ActionButton
                        onClick={() => onViewPerson(contact.personId)}
                        icon={<ChevronRight size={14} />}
                        title="View"
                        color="gray"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ContentCard>

          {/* Scheduled Messages */}
          {digest.scheduledMessages.length > 0 && (
            <ContentCard
              title="Messages to Send"
              icon={<Send size={16} />}
              iconColor="purple"
              action={
                <button
                  onClick={onViewCalendar}
                  className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                >
                  View calendar
                  <ArrowRight size={12} />
                </button>
              }
            >
              <div className="space-y-2">
                {digest.scheduledMessages.slice(0, 3).map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-xl flex items-center justify-center shadow-sm">
                      {msg.channel === 'email' ? (
                        <Mail className="text-white" size={16} />
                      ) : (
                        <MessageSquare className="text-white" size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                        {msg.personName || 'No recipient'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400 truncate mt-0.5">
                        {msg.preview}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {new Date(msg.scheduledFor).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                      <p className="text-[10px] text-gray-400 dark:text-dark-500 mt-0.5">
                        {msg.channel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components

function StatCard({
  value,
  label,
  icon,
  color = 'indigo',
  highlight = false
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
  color?: 'indigo' | 'red' | 'blue' | 'purple' | 'slate';
  highlight?: boolean;
}) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600 text-indigo-600 dark:text-indigo-400',
    red: 'from-red-500 to-red-600 text-red-600 dark:text-red-400',
    blue: 'from-blue-500 to-blue-600 text-blue-600 dark:text-blue-400',
    purple: 'from-purple-500 to-purple-600 text-purple-600 dark:text-purple-400',
    slate: 'from-slate-400 to-slate-500 text-slate-600 dark:text-slate-400',
  };

  return (
    <div className={`relative bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50 dark:border-dark-600/50 ${highlight ? 'ring-2 ring-red-200 dark:ring-red-500/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`w-7 h-7 bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} rounded-lg flex items-center justify-center`}>
          <span className="text-white">{icon}</span>
        </div>
        {highlight && (
          <span className="text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Alert
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${colors[color].split(' ').slice(2).join(' ')}`}>{value}</p>
      <p className="text-[10px] text-gray-500 dark:text-dark-400 font-medium uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  );
}

function ContentCard({
  title,
  icon,
  iconColor = 'indigo',
  action,
  children
}: {
  title: string;
  icon: React.ReactNode;
  iconColor?: 'indigo' | 'pink' | 'blue' | 'purple';
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const colors = {
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-rose-500',
    blue: 'from-blue-500 to-indigo-500',
    purple: 'from-purple-500 to-violet-500',
  };

  return (
    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-dark-600/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-100 flex items-center gap-2">
          <div className={`w-6 h-6 bg-gradient-to-br ${colors[iconColor]} rounded-lg flex items-center justify-center`}>
            <span className="text-white">{icon}</span>
          </div>
          {title}
        </h3>
        {action}
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  icon,
  title,
  color = 'blue'
}: {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  color?: 'pink' | 'blue' | 'gray';
}) {
  const colors = {
    pink: 'hover:bg-pink-100 dark:hover:bg-pink-500/20 text-pink-600 dark:text-pink-400',
    blue: 'hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400',
    gray: 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-500 dark:text-dark-400',
  };

  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}
      title={title}
    >
      {icon}
    </button>
  );
}
