import { useState, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageSquare,
  Send,
  Clock,
  User,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  X,
  Filter,
  Gift,
  Heart,
  UserPlus,
  DollarSign,
} from 'lucide-react';
import { Person } from '../types';

// Types for scheduled messages
export interface ScheduledMessage {
  id: string;
  personId?: string;
  personName?: string;
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  body: string;
  scheduledFor: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled';
  sourceType: 'manual' | 'drip_campaign' | 'birthday' | 'anniversary' | 'donation' | 'follow_up' | 'ai_generated';
  sourceAgent?: string;
  aiGenerated?: boolean;
}

interface ContentCalendarProps {
  scheduledMessages: ScheduledMessage[];
  people: Person[];
  onCreateMessage: (message: Omit<ScheduledMessage, 'id'>) => Promise<void>;
  onUpdateMessage: (id: string, updates: Partial<ScheduledMessage>) => Promise<void>;
  onDeleteMessage: (id: string) => Promise<void>;
  onSendNow: (id: string) => Promise<void>;
  onGenerateAI?: (personId: string, type: string) => Promise<string>;
}

const sourceTypeColors: Record<string, string> = {
  manual: 'bg-gray-100 dark:bg-gray-500/15 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
  drip_campaign: 'bg-purple-100 dark:bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  birthday: 'bg-pink-100 dark:bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/20',
  anniversary: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  donation: 'bg-green-100 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20',
  follow_up: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  ai_generated: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
};

const sourceTypeIcons: Record<string, React.ReactNode> = {
  manual: <Mail size={12} />,
  drip_campaign: <Send size={12} />,
  birthday: <Gift size={12} />,
  anniversary: <Heart size={12} />,
  donation: <DollarSign size={12} />,
  follow_up: <UserPlus size={12} />,
  ai_generated: <Sparkles size={12} />,
};

const channelIcons: Record<string, React.ReactNode> = {
  email: <Mail size={14} />,
  sms: <MessageSquare size={14} />,
  both: <><Mail size={12} /><MessageSquare size={12} /></>,
};

export function ContentCalendar({
  scheduledMessages,
  people,
  onCreateMessage,
  onUpdateMessage,
  onDeleteMessage,
  onSendNow,
  onGenerateAI,
}: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ScheduledMessage | null>(null);
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'sms'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    personId: '',
    channel: 'email' as 'email' | 'sms' | 'both',
    subject: '',
    body: '',
    scheduledFor: '',
    sourceType: 'manual' as ScheduledMessage['sourceType'],
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Get messages for a specific date
  const getMessagesForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledMessages.filter(msg => {
      const msgDate = new Date(msg.scheduledFor).toISOString().split('T')[0];
      const matchesDate = msgDate === dateStr;
      const matchesChannel = filterChannel === 'all' || msg.channel === filterChannel || msg.channel === 'both';
      const matchesType = filterType === 'all' || msg.sourceType === filterType;
      return matchesDate && matchesChannel && matchesType;
    });
  }, [scheduledMessages, filterChannel, filterType]);

  // Build calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: Date; isCurrentMonth: boolean; messages: ScheduledMessage[] }> = [];

    // Previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      const date = new Date(year, month, -firstDayOfMonth + i + 1);
      days.push({ date, isCurrentMonth: false, messages: getMessagesForDate(date) });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({ date, isCurrentMonth: true, messages: getMessagesForDate(date) });
    }

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, messages: getMessagesForDate(date) });
    }

    return days;
  }, [year, month, firstDayOfMonth, daysInMonth, getMessagesForDate]);

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      scheduledFor: date.toISOString().slice(0, 16),
    }));
  };

  // Handle create message
  const handleCreateMessage = async () => {
    if (!formData.body || !formData.scheduledFor) return;

    const person = people.find(p => p.id === formData.personId);

    await onCreateMessage({
      personId: formData.personId || undefined,
      personName: person ? `${person.firstName} ${person.lastName}` : undefined,
      channel: formData.channel,
      subject: formData.subject || undefined,
      body: formData.body,
      scheduledFor: formData.scheduledFor,
      status: 'scheduled',
      sourceType: formData.sourceType,
      aiGenerated: false,
    });

    setShowCreateModal(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      personId: '',
      channel: 'email',
      subject: '',
      body: '',
      scheduledFor: selectedDate?.toISOString().slice(0, 16) || '',
      sourceType: 'manual',
    });
  };

  // Generate AI message
  const handleGenerateAI = async () => {
    if (!onGenerateAI || !formData.personId) return;

    setIsGeneratingAI(true);
    try {
      const generatedText = await onGenerateAI(formData.personId, formData.sourceType);
      setFormData(prev => ({ ...prev, body: generatedText }));
    } catch (error) {
      console.error('Failed to generate AI message:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in the past
  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = scheduledMessages.filter(msg => {
      const msgDate = new Date(msg.scheduledFor);
      return msgDate.getMonth() === month && msgDate.getFullYear() === year;
    });

    return {
      total: thisMonth.length,
      scheduled: thisMonth.filter(m => m.status === 'scheduled').length,
      sent: thisMonth.filter(m => m.status === 'sent').length,
      pending: thisMonth.filter(m => m.status === 'scheduled' && new Date(m.scheduledFor) <= now).length,
    };
  }, [scheduledMessages, month, year]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Content Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">Schedule and manage your outgoing messages</p>
        </div>
        <button
          onClick={() => {
            setShowCreateModal(true);
            setSelectedMessage(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Schedule Message
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">This Month</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.scheduled}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Scheduled</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.sent}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Sent</p>
        </div>
        <div className="p-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700">
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Ready to Send</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-dark-400">Filter:</span>
        </div>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as 'all' | 'email' | 'sms')}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300"
        >
          <option value="all">All Channels</option>
          <option value="email">Email Only</option>
          <option value="sms">SMS Only</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300"
        >
          <option value="all">All Types</option>
          <option value="manual">Manual</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="donation">Donation</option>
          <option value="drip_campaign">Drip Campaign</option>
          <option value="follow_up">Follow Up</option>
        </select>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-dark-300" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 min-w-[180px] text-center">
              {monthName}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600 dark:text-dark-300" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-dark-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-gray-500 dark:text-dark-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth, messages }, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(date)}
              className={`min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-dark-700 cursor-pointer transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 dark:bg-dark-850' : 'hover:bg-gray-50 dark:hover:bg-dark-750'}
                ${isToday(date) ? 'bg-indigo-50 dark:bg-indigo-500/10' : ''}
                ${selectedDate?.toDateString() === date.toDateString() ? 'ring-2 ring-indigo-500 ring-inset' : ''}
              `}
            >
              <div className={`text-sm font-medium mb-1
                ${!isCurrentMonth ? 'text-gray-300 dark:text-dark-600' : 'text-gray-900 dark:text-dark-100'}
                ${isToday(date) ? 'text-indigo-600 dark:text-indigo-400' : ''}
              `}>
                {date.getDate()}
              </div>

              {/* Message indicators */}
              <div className="space-y-1">
                {messages.slice(0, 3).map((msg) => (
                  <div
                    key={msg.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMessage(msg);
                    }}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate flex items-center gap-1 ${sourceTypeColors[msg.sourceType]}`}
                  >
                    {channelIcons[msg.channel]}
                    <span className="truncate">{msg.personName || 'No recipient'}</span>
                  </div>
                ))}
                {messages.length > 3 && (
                  <div className="text-[10px] text-gray-400 dark:text-dark-500 px-1">
                    +{messages.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date Messages Panel */}
      {selectedDate && (
        <div className="mt-4 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-dark-100">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setSelectedMessage(null);
                setFormData(prev => ({
                  ...prev,
                  scheduledFor: selectedDate.toISOString().slice(0, 16),
                }));
              }}
              className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
            >
              <Plus size={14} />
              Add Message
            </button>
          </div>

          {getMessagesForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-dark-500 py-4 text-center">No messages scheduled</p>
          ) : (
            <div className="space-y-2">
              {getMessagesForDate(selectedDate).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${sourceTypeColors[msg.sourceType]}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {channelIcons[msg.channel]}
                      </div>
                      <span className="font-medium text-sm">{msg.personName || 'No recipient'}</span>
                      <span className="flex items-center gap-1 text-xs opacity-75">
                        {sourceTypeIcons[msg.sourceType]}
                        {msg.sourceType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {msg.status === 'scheduled' && isPast(new Date(msg.scheduledFor)) && (
                        <button
                          onClick={() => onSendNow(msg.id)}
                          className="p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded"
                          title="Send Now"
                        >
                          <Send size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedMessage(msg);
                          setFormData({
                            personId: msg.personId || '',
                            channel: msg.channel,
                            subject: msg.subject || '',
                            body: msg.body,
                            scheduledFor: msg.scheduledFor.slice(0, 16),
                            sourceType: msg.sourceType,
                          });
                          setShowCreateModal(true);
                        }}
                        className="p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteMessage(msg.id)}
                        className="p-1 hover:bg-white/50 dark:hover:bg-white/10 rounded text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {msg.subject && (
                    <p className="text-sm font-medium mt-2">{msg.subject}</p>
                  )}
                  <p className="text-sm mt-1 opacity-75 line-clamp-2">{msg.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs opacity-60">
                    <Clock size={12} />
                    {new Date(msg.scheduledFor).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    <span className={`px-1.5 py-0.5 rounded ${
                      msg.status === 'sent' ? 'bg-green-200 text-green-800' :
                      msg.status === 'failed' ? 'bg-red-200 text-red-800' :
                      msg.status === 'cancelled' ? 'bg-gray-200 text-gray-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-850 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
                {selectedMessage ? 'Edit Message' : 'Schedule New Message'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedMessage(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                  Recipient
                </label>
                <select
                  value={formData.personId}
                  onChange={(e) => setFormData(prev => ({ ...prev, personId: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                >
                  <option value="">Select a person (optional)</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
                  Channel
                </label>
                <div className="flex gap-2">
                  {(['email', 'sms', 'both'] as const).map((channel) => (
                    <button
                      key={channel}
                      onClick={() => setFormData(prev => ({ ...prev, channel }))}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                        formData.channel === channel
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30'
                          : 'bg-gray-50 dark:bg-dark-800 text-gray-500 dark:text-dark-400 border-gray-200 dark:border-dark-600'
                      }`}
                    >
                      {channel === 'email' && <Mail size={16} />}
                      {channel === 'sms' && <MessageSquare size={16} />}
                      {channel === 'both' && <><Mail size={14} /><MessageSquare size={14} /></>}
                      {channel.charAt(0).toUpperCase() + channel.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date/Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                  Schedule For
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                />
              </div>

              {/* Subject (for email) */}
              {(formData.channel === 'email' || formData.channel === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Email subject line"
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                  />
                </div>
              )}

              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                  Message Type
                </label>
                <select
                  value={formData.sourceType}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceType: e.target.value as ScheduledMessage['sourceType'] }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
                >
                  <option value="manual">Manual</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="donation">Donation Thank You</option>
                </select>
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
                    Message
                  </label>
                  {onGenerateAI && formData.personId && (
                    <button
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
                    >
                      <Sparkles size={12} />
                      {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                    </button>
                  )}
                </div>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={5}
                  placeholder="Write your message..."
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-dark-700 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedMessage(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-700 dark:text-dark-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (selectedMessage) {
                    await onUpdateMessage(selectedMessage.id, formData);
                  } else {
                    await handleCreateMessage();
                  }
                  setShowCreateModal(false);
                  setSelectedMessage(null);
                  resetForm();
                }}
                disabled={!formData.body || !formData.scheduledFor}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {selectedMessage ? 'Update' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
