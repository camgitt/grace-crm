/**
 * Message Review Queue Component
 *
 * Displays AI-generated messages pending staff review.
 * Allows staff to approve, reject, or edit messages before sending.
 */

import { useState, useMemo } from 'react';
import {
  Inbox,
  Check,
  X,
  Edit3,
  RefreshCw,
  Mail,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Send,
  FileText,
} from 'lucide-react';
import type { PendingMessage, ReviewQueueStats } from '../lib/agents/types';

interface MessageReviewQueueProps {
  messages: PendingMessage[];
  stats: ReviewQueueStats;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => void;
  onEdit: (id: string, editedMessage: string) => Promise<void>;
  onRegenerate?: (id: string) => Promise<void>;
  onBulkApprove?: (ids: string[]) => Promise<void>;
  onBulkReject?: (ids: string[], reason?: string) => void;
  isLoading?: boolean;
}

interface EditModalProps {
  message: PendingMessage;
  onSave: (editedMessage: string) => void;
  onCancel: () => void;
}

function EditModal({ message, onSave, onCancel }: EditModalProps) {
  const [editedText, setEditedText] = useState(message.messageBody);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-indigo-600" />
            Edit Message
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-400 mt-1">
            To: {message.recipientName} via {message.channel}
          </p>
        </div>

        <div className="p-4">
          {message.subject && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                Subject
              </label>
              <p className="text-sm text-gray-600 dark:text-dark-400">
                {message.subject}
              </p>
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
            Message
          </label>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={8}
            className="w-full rounded-lg border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Edit the message..."
          />

          {message.channel === 'sms' && (
            <p className={`text-xs mt-1 ${editedText.length > 160 ? 'text-amber-600' : 'text-gray-500'}`}>
              {editedText.length}/160 characters
              {editedText.length > 160 && ' (will be split into multiple SMS)'}
            </p>
          )}

          {message.originalMessage && message.originalMessage !== message.messageBody && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <p className="text-xs font-medium text-gray-500 dark:text-dark-400 mb-1">
                Original Message:
              </p>
              <p className="text-sm text-gray-600 dark:text-dark-300">
                {message.originalMessage}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-dark-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(editedText)}
            disabled={!editedText.trim()}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Save & Send
          </button>
        </div>
      </div>
    </div>
  );
}

export function MessageReviewQueue({
  messages,
  stats,
  onApprove,
  onReject,
  onEdit,
  onRegenerate,
  onBulkApprove,
  onBulkReject,
  isLoading = false,
}: MessageReviewQueueProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'sms'>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingMessage, setEditingMessage] = useState<PendingMessage | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Get unique message types for filter
  const messageTypes = useMemo(() => {
    const types = new Set(messages.map((m) => m.messageType));
    return Array.from(types);
  }, [messages]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      // Only show pending
      if (m.status !== 'pending') return false;

      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          m.recipientName.toLowerCase().includes(query) ||
          m.messageBody.toLowerCase().includes(query) ||
          m.subject?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Channel filter
      if (filterChannel !== 'all' && m.channel !== filterChannel) return false;

      // Type filter
      if (filterType !== 'all' && m.messageType !== filterType) return false;

      return true;
    });
  }, [messages, searchQuery, filterChannel, filterType]);

  const handleApprove = async (id: string) => {
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await onApprove(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleReject = (id: string) => {
    onReject(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleEditSave = async (editedMessage: string) => {
    if (!editingMessage) return;

    setProcessingIds((prev) => new Set(prev).add(editingMessage.id));
    try {
      await onEdit(editingMessage.id, editedMessage);
      setEditingMessage(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(editingMessage.id);
        return next;
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(editingMessage.id);
        return next;
      });
    }
  };

  const handleBulkApprove = async () => {
    if (!onBulkApprove || selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    ids.forEach((id) => setProcessingIds((prev) => new Set(prev).add(id)));

    try {
      await onBulkApprove(ids);
      setSelectedIds(new Set());
    } finally {
      ids.forEach((id) =>
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        })
      );
    }
  };

  const handleBulkReject = () => {
    if (!onBulkReject || selectedIds.size === 0) return;
    onBulkReject(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map((m) => m.id)));
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Inbox className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Message Review Queue
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-400">
                {stats.pending} message{stats.pending !== 1 ? 's' : ''} pending review
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600">
              <Check className="w-4 h-4" />
              <span>{stats.approvedToday} today</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <X className="w-4 h-4" />
              <span>{stats.rejectedToday}</span>
            </div>
            <div className="flex items-center gap-1 text-amber-600">
              <Edit3 className="w-4 h-4" />
              <span>{stats.editedToday}</span>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
              showFilters || filterChannel !== 'all' || filterType !== 'all'
                ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-300 dark:border-dark-600 text-gray-600 dark:text-dark-400 hover:bg-gray-50 dark:hover:bg-dark-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-dark-700">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-dark-400">Channel:</span>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value as 'all' | 'email' | 'sms')}
                className="text-sm rounded-lg border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
              >
                <option value="all">All</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-dark-400">Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm rounded-lg border-gray-300 dark:border-dark-600 dark:bg-dark-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {messageTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
          <span className="text-sm text-indigo-700 dark:text-indigo-300">
            {selectedIds.size} message{selectedIds.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            {onBulkApprove && (
              <button
                onClick={handleBulkApprove}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                <Check className="w-4 h-4" />
                Approve All
              </button>
            )}
            {onBulkReject && (
              <button
                onClick={handleBulkReject}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                <X className="w-4 h-4" />
                Reject All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="divide-y divide-gray-200 dark:divide-dark-700 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-dark-400">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
            <p>Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-dark-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages pending review</p>
            {(searchQuery || filterChannel !== 'all' || filterType !== 'all') && (
              <p className="text-sm mt-1">Try adjusting your filters</p>
            )}
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="px-4 py-2 bg-gray-50 dark:bg-dark-900/50 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedIds.size === filteredMessages.length && filteredMessages.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500 dark:text-dark-400">
                Select all ({filteredMessages.length})
              </span>
            </div>

            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors ${
                  processingIds.has(message.id) ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedIds.has(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    disabled={processingIds.has(message.id)}
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  {/* Channel Icon */}
                  <div
                    className={`p-2 rounded-lg ${
                      message.channel === 'email'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}
                  >
                    {message.channel === 'email' ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {message.recipientName}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400">
                        {message.messageType.replace(/_/g, ' ')}
                      </span>
                      {message.isAIGenerated && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <Sparkles className="w-3 h-3" />
                          AI
                        </span>
                      )}
                      {message.usedFallback && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertCircle className="w-3 h-3" />
                          Template
                        </span>
                      )}
                    </div>

                    {message.subject && (
                      <p className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
                        {message.subject}
                      </p>
                    )}

                    <p className="text-sm text-gray-600 dark:text-dark-400 line-clamp-2">
                      {message.messageBody}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-dark-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                      <span>{message.agentName}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApprove(message.id)}
                      disabled={processingIds.has(message.id)}
                      className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Approve & Send"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingMessage(message)}
                      disabled={processingIds.has(message.id)}
                      className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    {onRegenerate && message.isAIGenerated && (
                      <button
                        onClick={() => onRegenerate(message.id)}
                        disabled={processingIds.has(message.id)}
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                        title="Regenerate"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(message.id)}
                      disabled={processingIds.has(message.id)}
                      className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                      title="Reject"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingMessage && (
        <EditModal
          message={editingMessage}
          onSave={handleEditSave}
          onCancel={() => setEditingMessage(null)}
        />
      )}
    </div>
  );
}
