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
  AlertCircle,
  ChevronRight,
  Sparkles,
  RefreshCw,
  MessageSquare,
  Calendar,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import type { DailyDigest, TaskItem, ContactItem, CelebrationItem, MessageItem } from '../lib/agents/DayPlannerAgent';

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
  high: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20',
  low: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-500/20',
};

const reasonLabels: Record<string, { label: string; color: string }> = {
  new_visitor: { label: 'New Visitor', color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' },
  follow_up: { label: 'Follow Up', color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  birthday: { label: 'Birthday', color: 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400' },
  anniversary: { label: 'Anniversary', color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' },
  inactive: { label: 'Inactive', color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' },
  first_time_giver: { label: 'First Gift', color: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' },
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

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Get greeting icon based on time
  const GreetingIcon = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return Sunrise;
    if (hour >= 12 && hour < 18) return Sun;
    return Moon;
  }, [currentTime]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600 dark:text-indigo-400" size={32} />
          <span className="ml-3 text-gray-500 dark:text-dark-400">Generating your daily digest...</span>
        </div>
      </div>
    );
  }

  if (!digest) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
        <div className="text-center py-8">
          <Calendar className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={40} />
          <p className="text-gray-500 dark:text-dark-400">No digest available</p>
          <button
            onClick={onRefresh}
            className="mt-4 px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
          >
            Generate Digest
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-indigo-100 dark:border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <GreetingIcon className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
                {digest.greeting}!
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
            title="Refresh digest"
          >
            <RefreshCw size={18} className="text-indigo-600 dark:text-indigo-400" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white dark:bg-dark-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{digest.stats.totalTasks}</p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Tasks</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{digest.stats.overdueTasks}</p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Overdue</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{digest.stats.contactsToReach}</p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Contacts</p>
          </div>
          <div className="bg-white dark:bg-dark-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{digest.stats.messagesScheduled}</p>
            <p className="text-xs text-gray-500 dark:text-dark-400">Messages</p>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {digest.aiSummary && (
        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-100 dark:border-indigo-500/20">
          <div className="flex items-start gap-2">
            <Sparkles className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-sm text-gray-700 dark:text-dark-300">{digest.aiSummary}</p>
              {digest.aiRecommendations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {digest.aiRecommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <ArrowRight size={10} />
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Celebrations */}
        {digest.celebrations.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4 border border-pink-200 dark:border-pink-500/20">
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2 mb-3">
              <Gift className="text-pink-500" size={16} />
              Today's Celebrations
            </h3>
            <div className="space-y-2">
              {digest.celebrations.map((celebration) => (
                <div
                  key={`${celebration.type}-${celebration.personId}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-500/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-100 dark:bg-pink-500/20 rounded-full flex items-center justify-center">
                      {celebration.type === 'birthday' ? (
                        <Gift className="text-pink-600 dark:text-pink-400" size={14} />
                      ) : (
                        <Heart className="text-pink-600 dark:text-pink-400" size={14} />
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => onViewPerson(celebration.personId)}
                        className="text-sm font-medium text-gray-900 dark:text-dark-100 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        {celebration.name}
                      </button>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {celebration.type === 'birthday'
                          ? `Turning ${celebration.yearsCount}`
                          : `${celebration.yearsCount} year${celebration.yearsCount !== 1 ? 's' : ''} as member`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {celebration.email && (
                      <button
                        onClick={() => onContactPerson(celebration.personId, 'email')}
                        className="p-1.5 hover:bg-pink-100 dark:hover:bg-pink-500/20 rounded"
                        title="Send email"
                      >
                        <Mail size={14} className="text-pink-600 dark:text-pink-400" />
                      </button>
                    )}
                    {celebration.phone && (
                      <button
                        onClick={() => onContactPerson(celebration.personId, 'sms')}
                        className="p-1.5 hover:bg-pink-100 dark:hover:bg-pink-500/20 rounded"
                        title="Send SMS"
                      >
                        <MessageSquare size={14} className="text-pink-600 dark:text-pink-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Priority Tasks */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
              <CheckCircle2 className="text-indigo-500" size={16} />
              Priority Tasks
            </h3>
            <button
              onClick={onViewAllTasks}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight size={12} />
            </button>
          </div>

          {digest.priorityTasks.length === 0 ? (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto text-green-500 mb-2" size={24} />
              <p className="text-sm text-gray-500 dark:text-dark-400">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {digest.priorityTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start justify-between p-2 rounded-lg border ${
                    task.isOverdue
                      ? 'border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5'
                      : 'border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onCompleteTask(task.id)}
                      className="mt-0.5 w-5 h-5 rounded border-2 border-gray-300 dark:border-dark-500 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 flex items-center justify-center transition-colors"
                    >
                      <CheckCircle2 size={12} className="text-transparent hover:text-green-500" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                        {task.title}
                      </p>
                      {task.personName && (
                        <p className="text-xs text-gray-500 dark:text-dark-400">{task.personName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`text-[10px] flex items-center gap-1 ${
                          task.isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-dark-500'
                        }`}>
                          <Clock size={10} />
                          {task.isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* People to Contact */}
        <div className="bg-white dark:bg-dark-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2 mb-3">
            <Users className="text-blue-500" size={16} />
            People to Contact
          </h3>

          {digest.peopleToContact.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-400 text-center py-4">
              No urgent contacts for today
            </p>
          ) : (
            <div className="space-y-2">
              {digest.peopleToContact.slice(0, 5).map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-750 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-400">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => onViewPerson(contact.personId)}
                        className="text-sm font-medium text-gray-900 dark:text-dark-100 hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
                      >
                        {contact.name}
                      </button>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${reasonLabels[contact.reason].color}`}>
                          {reasonLabels[contact.reason].label}
                        </span>
                        {contact.reasonDetails && (
                          <span className="text-[10px] text-gray-400 dark:text-dark-500 truncate">
                            {contact.reasonDetails}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {contact.email && (
                      <button
                        onClick={() => onContactPerson(contact.personId, 'email')}
                        className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded"
                        title="Send email"
                      >
                        <Mail size={14} className="text-blue-600 dark:text-blue-400" />
                      </button>
                    )}
                    {contact.phone && (
                      <>
                        <button
                          onClick={() => onContactPerson(contact.personId, 'phone')}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded"
                          title="Call"
                        >
                          <Phone size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>
                        <button
                          onClick={() => onContactPerson(contact.personId, 'sms')}
                          className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded"
                          title="Send SMS"
                        >
                          <MessageSquare size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onViewPerson(contact.personId)}
                      className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                    >
                      <ChevronRight size={14} className="text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Messages */}
        {digest.scheduledMessages.length > 0 && (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
                <Mail className="text-purple-500" size={16} />
                Messages to Send
              </h3>
              <button
                onClick={onViewCalendar}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
              >
                View calendar
                <ArrowRight size={12} />
              </button>
            </div>
            <div className="space-y-2">
              {digest.scheduledMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-gray-100 dark:border-dark-700"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                      {msg.channel === 'email' ? (
                        <Mail className="text-purple-600 dark:text-purple-400" size={14} />
                      ) : (
                        <MessageSquare className="text-purple-600 dark:text-purple-400" size={14} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                        {msg.personName || 'No recipient'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
                        {msg.preview}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-dark-500">
                    {new Date(msg.scheduledFor).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
