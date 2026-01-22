/**
 * Action Feed Component
 *
 * A news feed-style dashboard showing all AI-suggested outreach actions.
 * Pastor/staff can review and approve messages with one click.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Cake,
  UserPlus,
  Clock,
  Send,
  Check,
  X,
  RefreshCw,
  Loader2,
  Mail,
  ChevronDown,
  ChevronUp,
  Gift,
  Heart,
  Calendar,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Person } from '../types';
import {
  generateBirthdayGreeting,
  generateWelcomeMessage,
  generateFollowUpTalkingPoints,
} from '../lib/services/ai';

type ActionType = 'birthday' | 'welcome' | 'followup' | 'anniversary';

interface ActionItem {
  id: string;
  type: ActionType;
  person: Person;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  generatedMessage?: string;
  generatedSubject?: string;
  status: 'pending' | 'generating' | 'ready' | 'sending' | 'sent' | 'dismissed';
  error?: string;
}

interface ActionFeedProps {
  people: Person[];
  churchName?: string;
  onSendEmail?: (to: { email: string; name: string }, subject: string, body: string) => Promise<{ success: boolean; error?: string }>;
}

const ACTION_CONFIG: Record<ActionType, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
}> = {
  birthday: {
    icon: <Cake size={18} />,
    label: 'Birthday',
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-500/20',
  },
  welcome: {
    icon: <UserPlus size={18} />,
    label: 'New Visitor',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  followup: {
    icon: <Clock size={18} />,
    label: 'Follow-up',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  anniversary: {
    icon: <Gift size={18} />,
    label: 'Anniversary',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
  },
};

export function ActionFeed({ people, churchName = 'Grace Church', onSendEmail }: ActionFeedProps) {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [filter, setFilter] = useState<'all' | ActionType>('all');

  // Generate action items from people data
  useEffect(() => {
    const newActions: ActionItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    people.forEach((person) => {
      // Skip inactive
      if (person.status === 'inactive') return;

      // Check for birthdays (today or within 7 days)
      if (person.birthDate) {
        const birthDate = new Date(person.birthDate);
        const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
        const daysUntil = Math.floor((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= 7) {
          newActions.push({
            id: `birthday-${person.id}`,
            type: 'birthday',
            person,
            reason: daysUntil === 0 ? 'Birthday is TODAY!' : `Birthday in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            priority: daysUntil === 0 ? 'high' : daysUntil <= 2 ? 'medium' : 'low',
            dueDate: thisYearBirthday.toISOString(),
            status: 'pending',
          });
        }
      }

      // Check for new visitors (within last 7 days)
      if (person.status === 'visitor' && person.firstVisit) {
        const visitDate = new Date(person.firstVisit);
        const daysSince = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSince >= 0 && daysSince <= 7) {
          newActions.push({
            id: `welcome-${person.id}`,
            type: 'welcome',
            person,
            reason: daysSince === 0 ? 'Visited today!' : `Visited ${daysSince} day${daysSince > 1 ? 's' : ''} ago`,
            priority: daysSince <= 1 ? 'high' : daysSince <= 3 ? 'medium' : 'low',
            status: 'pending',
          });
        }
      }

      // Check for membership anniversaries
      if (person.joinDate && person.status === 'member') {
        const joinDate = new Date(person.joinDate);
        const thisYearAnniversary = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
        const daysUntil = Math.floor((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const years = today.getFullYear() - joinDate.getFullYear();

        if (daysUntil >= 0 && daysUntil <= 7 && years > 0) {
          newActions.push({
            id: `anniversary-${person.id}`,
            type: 'anniversary',
            person,
            reason: daysUntil === 0 ? `${years} year anniversary TODAY!` : `${years} year anniversary in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`,
            priority: daysUntil === 0 ? 'high' : 'medium',
            dueDate: thisYearAnniversary.toISOString(),
            status: 'pending',
          });
        }
      }

      // Check for follow-ups needed (regulars who haven't been contacted)
      if (person.status === 'regular' && person.firstVisit) {
        const visitDate = new Date(person.firstVisit);
        const daysSince = Math.floor((today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24));

        // Suggest follow-up for regulars who've been attending 2-4 weeks
        if (daysSince >= 14 && daysSince <= 30) {
          newActions.push({
            id: `followup-${person.id}`,
            type: 'followup',
            person,
            reason: `Attending for ${Math.floor(daysSince / 7)} weeks - time to connect deeper`,
            priority: 'medium',
            status: 'pending',
          });
        }
      }
    });

    // Sort by priority then by date
    newActions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

    setActions(newActions);
  }, [people]);

  // Generate AI message for an action
  const generateMessage = async (actionId: string) => {
    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, status: 'generating', error: undefined } : a
    ));

    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    try {
      let result: { success: boolean; text?: string; error?: string } | undefined;
      const firstName = action.person.firstName;

      switch (action.type) {
        case 'birthday':
          result = await generateBirthdayGreeting(firstName, churchName);
          if (result?.success && result.text) {
            const text = result.text;
            setActions(prev => prev.map(a =>
              a.id === actionId ? {
                ...a,
                status: 'ready',
                generatedSubject: `Happy Birthday, ${firstName}!`,
                generatedMessage: text,
              } : a
            ));
          }
          break;
        case 'welcome':
          result = await generateWelcomeMessage(firstName, churchName);
          if (result?.success && result.text) {
            const text = result.text;
            setActions(prev => prev.map(a =>
              a.id === actionId ? {
                ...a,
                status: 'ready',
                generatedSubject: `Welcome to ${churchName}!`,
                generatedMessage: text,
              } : a
            ));
          }
          break;
        case 'followup':
        case 'anniversary':
          result = await generateFollowUpTalkingPoints(
            `${action.person.firstName} ${action.person.lastName}`,
            action.person.firstVisit || action.person.joinDate || new Date().toISOString(),
            action.person.notes
          );
          if (result?.success && result.text) {
            const text = result.text;
            const subject = action.type === 'anniversary'
              ? `Happy Anniversary at ${churchName}!`
              : `Checking in from ${churchName}`;
            setActions(prev => prev.map(a =>
              a.id === actionId ? {
                ...a,
                status: 'ready',
                generatedSubject: subject,
                generatedMessage: text,
              } : a
            ));
          }
          break;
      }

      if (result && !result.success) {
        setActions(prev => prev.map(a =>
          a.id === actionId ? { ...a, status: 'pending', error: result.error } : a
        ));
      }
    } catch (err) {
      setActions(prev => prev.map(a =>
        a.id === actionId ? {
          ...a,
          status: 'pending',
          error: err instanceof Error ? err.message : 'Failed to generate'
        } : a
      ));
    }
  };

  // Send the message
  const sendMessage = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !action.person.email || !onSendEmail) return;

    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, status: 'sending' } : a
    ));

    const message = editingId === actionId ? editedMessage : action.generatedMessage;

    try {
      const result = await onSendEmail(
        { email: action.person.email, name: `${action.person.firstName} ${action.person.lastName}` },
        action.generatedSubject || 'Message from Grace Church',
        message || ''
      );

      if (result.success) {
        setActions(prev => prev.map(a =>
          a.id === actionId ? { ...a, status: 'sent' } : a
        ));
        setEditingId(null);
      } else {
        setActions(prev => prev.map(a =>
          a.id === actionId ? { ...a, status: 'ready', error: result.error } : a
        ));
      }
    } catch (err) {
      setActions(prev => prev.map(a =>
        a.id === actionId ? {
          ...a,
          status: 'ready',
          error: err instanceof Error ? err.message : 'Failed to send'
        } : a
      ));
    }
  };

  // Dismiss an action
  const dismissAction = (actionId: string) => {
    setActions(prev => prev.map(a =>
      a.id === actionId ? { ...a, status: 'dismissed' } : a
    ));
  };

  // Filter actions
  const filteredActions = useMemo(() => {
    return actions.filter(a => {
      if (a.status === 'dismissed' || a.status === 'sent') return false;
      if (filter === 'all') return true;
      return a.type === filter;
    });
  }, [actions, filter]);

  const sentCount = actions.filter(a => a.status === 'sent').length;
  const pendingCount = filteredActions.length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Action Feed
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-suggested outreach ready to send
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium">
            <AlertCircle size={16} />
            {pendingCount} pending
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
            <CheckCircle size={16} />
            {sentCount} sent today
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(['all', 'birthday', 'welcome', 'followup', 'anniversary'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-700'
              }`}
            >
              {f === 'all' ? 'All' : ACTION_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700">
          <Heart className="w-12 h-12 mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No pending actions</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            All caught up! Check back later for new outreach opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredActions.map((action) => {
            const config = ACTION_CONFIG[action.type];
            const isExpanded = expandedId === action.id;
            const isEditing = editingId === action.id;

            return (
              <div
                key={action.id}
                className={`bg-white dark:bg-dark-850 rounded-2xl border transition-all ${
                  action.priority === 'high'
                    ? 'border-red-200 dark:border-red-500/30 shadow-sm shadow-red-100 dark:shadow-none'
                    : 'border-gray-200 dark:border-dark-700'
                }`}
              >
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {action.person.firstName[0]}{action.person.lastName[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {action.person.firstName} {action.person.lastName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                          {config.icon}
                          {config.label}
                        </span>
                        {action.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {action.reason}
                      </p>
                      {action.person.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
                          <Mail size={12} />
                          {action.person.email}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {action.status === 'pending' && (
                        <button
                          onClick={() => generateMessage(action.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                        >
                          <Sparkles size={14} />
                          Generate
                        </button>
                      )}
                      {action.status === 'generating' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium">
                          <Loader2 size={14} className="animate-spin" />
                          Generating...
                        </div>
                      )}
                      {action.status === 'ready' && (
                        <>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : action.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                          >
                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                          </button>
                          <button
                            onClick={() => sendMessage(action.id)}
                            disabled={!action.person.email}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title={action.person.email ? 'Send email' : 'No email address'}
                          >
                            <Send size={14} />
                            Send
                          </button>
                        </>
                      )}
                      {action.status === 'sending' && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium">
                          <Loader2 size={14} className="animate-spin" />
                          Sending...
                        </div>
                      )}
                      <button
                        onClick={() => dismissAction(action.id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
                        title="Dismiss"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Error */}
                  {action.error && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-sm">
                      {action.error}
                    </div>
                  )}
                </div>

                {/* Expanded Message Preview */}
                {isExpanded && action.generatedMessage && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-700 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        AI Generated Message
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => generateMessage(action.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded"
                        >
                          <RefreshCw size={12} />
                          Regenerate
                        </button>
                        <button
                          onClick={() => {
                            if (isEditing) {
                              setEditingId(null);
                            } else {
                              setEditingId(action.id);
                              setEditedMessage(action.generatedMessage || '');
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 rounded"
                        >
                          {isEditing ? <Check size={12} /> : <Calendar size={12} />}
                          {isEditing ? 'Done' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Subject: <span className="text-gray-700 dark:text-gray-300">{action.generatedSubject}</span>
                    </div>

                    {isEditing ? (
                      <textarea
                        value={editedMessage}
                        onChange={(e) => setEditedMessage(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 dark:bg-dark-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {action.generatedMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
