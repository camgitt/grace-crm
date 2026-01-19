import { useState, useMemo, useCallback } from 'react';
import {
  Inbox,
  Mail,
  MessageSquare,
  User,
  Clock,
  Send,
  Archive,
  Flag,
  AlertCircle,
  HelpCircle,
  Heart,
  Calendar,
  XCircle,
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import type { Person } from '../types';

// Inbound message types
export interface InboundMessage {
  id: string;
  personId?: string;
  personName?: string;
  channel: 'email' | 'sms';
  fromAddress: string;
  subject?: string;
  body: string;
  aiCategory?: 'question' | 'thanks' | 'concern' | 'prayer_request' | 'event_rsvp' | 'unsubscribe' | 'spam' | 'other';
  aiSentiment?: 'positive' | 'neutral' | 'negative' | 'urgent';
  aiSuggestedResponse?: string;
  aiConfidence?: number;
  status: 'new' | 'read' | 'replied' | 'archived' | 'flagged';
  repliedAt?: string;
  repliedBy?: string;
  inReplyTo?: string;
  receivedAt: string;
}

interface MessageInboxProps {
  messages: InboundMessage[];
  people: Person[];
  isLoading: boolean;
  onRefresh: () => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onFlag: (id: string) => void;
  onSendReply: (id: string, response: string, channel: 'email' | 'sms') => Promise<void>;
  onGenerateResponse: (id: string) => Promise<string>;
  onViewPerson: (personId: string) => void;
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  question: {
    icon: <HelpCircle size={12} />,
    label: 'Question',
    color: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  },
  thanks: {
    icon: <Heart size={12} />,
    label: 'Thanks',
    color: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400',
  },
  concern: {
    icon: <AlertCircle size={12} />,
    label: 'Concern',
    color: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  },
  prayer_request: {
    icon: <Heart size={12} />,
    label: 'Prayer',
    color: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400',
  },
  event_rsvp: {
    icon: <Calendar size={12} />,
    label: 'RSVP',
    color: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400',
  },
  unsubscribe: {
    icon: <XCircle size={12} />,
    label: 'Unsubscribe',
    color: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
  },
  spam: {
    icon: <XCircle size={12} />,
    label: 'Spam',
    color: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400',
  },
  other: {
    icon: <Mail size={12} />,
    label: 'Other',
    color: 'bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400',
  },
};

const sentimentConfig: Record<string, { color: string; label: string }> = {
  positive: { color: 'text-green-600 dark:text-green-400', label: 'Positive' },
  neutral: { color: 'text-gray-600 dark:text-gray-400', label: 'Neutral' },
  negative: { color: 'text-amber-600 dark:text-amber-400', label: 'Negative' },
  urgent: { color: 'text-red-600 dark:text-red-400', label: 'Urgent' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-500' },
  read: { label: 'Read', color: 'bg-gray-400' },
  replied: { label: 'Replied', color: 'bg-green-500' },
  archived: { label: 'Archived', color: 'bg-gray-300' },
  flagged: { label: 'Flagged', color: 'bg-red-500' },
};

export function MessageInbox({
  messages,
  people: _people,
  isLoading,
  onRefresh,
  onMarkRead,
  onArchive,
  onFlag,
  onSendReply,
  onGenerateResponse,
  onViewPerson,
}: MessageInboxProps) {
  // _people available for future person matching functionality
  const [selectedMessage, setSelectedMessage] = useState<InboundMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyChannel, setReplyChannel] = useState<'email' | 'sms'>('email');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'new' | 'flagged' | 'replied'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'new' && msg.status !== 'new') return false;
        if (filterStatus === 'flagged' && msg.status !== 'flagged') return false;
        if (filterStatus === 'replied' && msg.status !== 'replied') return false;
      }

      // Category filter
      if (filterCategory !== 'all' && msg.aiCategory !== filterCategory) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesBody = msg.body.toLowerCase().includes(query);
        const matchesSubject = msg.subject?.toLowerCase().includes(query);
        const matchesName = msg.personName?.toLowerCase().includes(query);
        const matchesFrom = msg.fromAddress.toLowerCase().includes(query);
        if (!matchesBody && !matchesSubject && !matchesName && !matchesFrom) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort: new first, then by date
      if (a.status === 'new' && b.status !== 'new') return -1;
      if (b.status === 'new' && a.status !== 'new') return 1;
      return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
    });
  }, [messages, filterStatus, filterCategory, searchQuery]);

  // Select message and load suggested response
  const handleSelectMessage = useCallback(async (msg: InboundMessage) => {
    setSelectedMessage(msg);
    setReplyChannel(msg.channel);

    // Mark as read if new
    if (msg.status === 'new') {
      onMarkRead(msg.id);
    }

    // Load AI suggestion if available
    if (msg.aiSuggestedResponse) {
      setReplyText(msg.aiSuggestedResponse);
    } else {
      setReplyText('');
    }
  }, [onMarkRead]);

  // Generate AI response
  const handleGenerateResponse = async () => {
    if (!selectedMessage) return;

    setIsGenerating(true);
    try {
      const response = await onGenerateResponse(selectedMessage.id);
      setReplyText(response);
    } catch (error) {
      console.error('Failed to generate response:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsSending(true);
    try {
      await onSendReply(selectedMessage.id, replyText, replyChannel);
      setSelectedMessage(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    flagged: messages.filter(m => m.status === 'flagged').length,
    replied: messages.filter(m => m.status === 'replied').length,
  }), [messages]);

  // Message list view
  const renderMessageList = () => (
    <div className="flex-1 overflow-y-auto">
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="text-gray-300 dark:text-dark-600 mb-3" size={40} />
          <p className="text-gray-500 dark:text-dark-400">No messages found</p>
          {filterStatus !== 'all' || filterCategory !== 'all' || searchQuery ? (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-dark-700">
          {filteredMessages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => handleSelectMessage(msg)}
              className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-750 transition-colors ${
                msg.status === 'new' ? 'bg-blue-50/50 dark:bg-blue-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusConfig[msg.status].color}`} />

                {/* Channel icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.channel === 'email'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20'
                    : 'bg-green-100 dark:bg-green-500/20'
                }`}>
                  {msg.channel === 'email' ? (
                    <Mail className="text-indigo-600 dark:text-indigo-400" size={14} />
                  ) : (
                    <MessageSquare className="text-green-600 dark:text-green-400" size={14} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      msg.status === 'new' ? 'text-gray-900 dark:text-dark-100' : 'text-gray-700 dark:text-dark-300'
                    }`}>
                      {msg.personName || msg.fromAddress}
                    </span>
                    {msg.aiCategory && categoryConfig[msg.aiCategory] && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 ${categoryConfig[msg.aiCategory].color}`}>
                        {categoryConfig[msg.aiCategory].icon}
                        {categoryConfig[msg.aiCategory].label}
                      </span>
                    )}
                    {msg.aiSentiment === 'urgent' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                        Urgent
                      </span>
                    )}
                  </div>
                  {msg.subject && (
                    <p className="text-sm text-gray-700 dark:text-dark-200 truncate mt-0.5">
                      {msg.subject}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-dark-400 truncate mt-1">
                    {msg.body}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-gray-400 dark:text-dark-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(msg.receivedAt).toLocaleString()}
                    </span>
                    {msg.aiConfidence && (
                      <span className="text-[10px] text-gray-400 dark:text-dark-500 flex items-center gap-1">
                        <Sparkles size={10} />
                        {Math.round(msg.aiConfidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>

                <ChevronRight className="text-gray-300 dark:text-dark-600 flex-shrink-0" size={16} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Message detail view
  const renderMessageDetail = () => {
    if (!selectedMessage) return null;

    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 mb-3"
          >
            <ArrowLeft size={16} />
            Back to inbox
          </button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedMessage.channel === 'email'
                  ? 'bg-indigo-100 dark:bg-indigo-500/20'
                  : 'bg-green-100 dark:bg-green-500/20'
              }`}>
                {selectedMessage.channel === 'email' ? (
                  <Mail className="text-indigo-600 dark:text-indigo-400" size={18} />
                ) : (
                  <MessageSquare className="text-green-600 dark:text-green-400" size={18} />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-dark-100">
                  {selectedMessage.personName || selectedMessage.fromAddress}
                </h2>
                <p className="text-sm text-gray-500 dark:text-dark-400">
                  {selectedMessage.fromAddress}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedMessage.personId && (
                <button
                  onClick={() => onViewPerson(selectedMessage.personId!)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                  title="View profile"
                >
                  <User size={16} className="text-gray-500" />
                </button>
              )}
              <button
                onClick={() => onFlag(selectedMessage.id)}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg ${
                  selectedMessage.status === 'flagged' ? 'text-red-500' : 'text-gray-500'
                }`}
                title="Flag"
              >
                <Flag size={16} />
              </button>
              <button
                onClick={() => onArchive(selectedMessage.id)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg text-gray-500"
                title="Archive"
              >
                <Archive size={16} />
              </button>
            </div>
          </div>

          {/* AI Classification */}
          <div className="flex items-center gap-3 mt-3">
            {selectedMessage.aiCategory && categoryConfig[selectedMessage.aiCategory] && (
              <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${categoryConfig[selectedMessage.aiCategory].color}`}>
                {categoryConfig[selectedMessage.aiCategory].icon}
                {categoryConfig[selectedMessage.aiCategory].label}
              </span>
            )}
            {selectedMessage.aiSentiment && (
              <span className={`text-xs ${sentimentConfig[selectedMessage.aiSentiment].color}`}>
                {sentimentConfig[selectedMessage.aiSentiment].label} tone
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-dark-500">
              {new Date(selectedMessage.receivedAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {selectedMessage.subject && (
            <h3 className="font-medium text-gray-900 dark:text-dark-100 mb-2">
              {selectedMessage.subject}
            </h3>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-dark-300 whitespace-pre-wrap">
              {selectedMessage.body}
            </p>
          </div>
        </div>

        {/* Reply Section */}
        <div className="border-t border-gray-200 dark:border-dark-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-dark-100">Reply</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateResponse}
                disabled={isGenerating}
                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Sparkles size={12} />
                )}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>

          {/* Channel selector */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setReplyChannel('email')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                replyChannel === 'email'
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
              }`}
            >
              <Mail size={14} />
              Email
            </button>
            <button
              onClick={() => setReplyChannel('sms')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                replyChannel === 'sms'
                  ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400'
              }`}
            >
              <MessageSquare size={14} />
              SMS
            </button>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={4}
            placeholder="Write your reply..."
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 resize-none"
          />

          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={() => {
                setSelectedMessage(null);
                setReplyText('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || isSending}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSending ? 'Sending...' : 'Send Reply'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-100">Message Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-0.5">
            Review and respond to incoming messages
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-dark-600 rounded-xl text-gray-700 dark:text-dark-300 font-medium hover:bg-gray-50 dark:hover:bg-dark-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30'
              : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750'
          }`}
        >
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-100">{stats.total}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Total</p>
        </button>
        <button
          onClick={() => setFilterStatus('new')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'new'
              ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
              : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750'
          }`}
        >
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.new}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">New</p>
        </button>
        <button
          onClick={() => setFilterStatus('flagged')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'flagged'
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
              : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750'
          }`}
        >
          <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{stats.flagged}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Flagged</p>
        </button>
        <button
          onClick={() => setFilterStatus('replied')}
          className={`p-4 rounded-xl border transition-colors ${
            filterStatus === 'replied'
              ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
              : 'bg-white dark:bg-dark-800 border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750'
          }`}
        >
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.replied}</p>
          <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">Replied</p>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300"
          >
            <option value="all">All Categories</option>
            <option value="question">Questions</option>
            <option value="thanks">Thanks</option>
            <option value="concern">Concerns</option>
            <option value="prayer_request">Prayer Requests</option>
            <option value="event_rsvp">RSVPs</option>
            <option value="unsubscribe">Unsubscribes</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden min-h-[500px] flex">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="ml-3 text-gray-500 dark:text-dark-400">Loading messages...</span>
          </div>
        ) : selectedMessage ? (
          renderMessageDetail()
        ) : (
          renderMessageList()
        )}
      </div>
    </div>
  );
}
