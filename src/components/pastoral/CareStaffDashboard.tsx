import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle2,
  Users,
  ArrowLeft,
  Filter,
  AlertCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import type { View } from '../../types';
import { usePastoralCareData, type ConversationWithMessages } from '../../hooks/usePastoralCareData';

interface CareStaffDashboardProps {
  setView: (view: View) => void;
  churchId?: string;
}

type FilterStatus = 'all' | 'active' | 'waiting' | 'escalated' | 'resolved' | 'archived';
type FilterPriority = 'all' | 'crisis' | 'high' | 'medium' | 'low';

const categoryLabels: Record<string, string> = {
  'marriage': 'Marriage & Relationships',
  'addiction': 'Addiction & Recovery',
  'grief': 'Grief & Loss',
  'faith-questions': 'Faith & Questions',
  'anxiety-depression': 'Anxiety & Depression',
  'financial': 'Financial Struggles',
  'parenting': 'Parenting',
  'crisis': 'Crisis',
  'general': 'General Support',
};

const priorityConfig: Record<string, { color: string; bg: string }> = {
  crisis: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-500/10' },
  high: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10' },
  medium: { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
  low: { color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/10' },
};

const statusConfig: Record<string, { color: string; bg: string; icon: typeof MessageSquare }> = {
  active: { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10', icon: MessageSquare },
  waiting: { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10', icon: Clock },
  escalated: { color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10', icon: AlertCircle },
  resolved: { color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/10', icon: CheckCircle2 },
  archived: { color: 'text-gray-500 dark:text-gray-500', bg: 'bg-gray-100 dark:bg-gray-500/10', icon: XCircle },
};

export function CareStaffDashboard({ setView, churchId }: CareStaffDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [expandedConv, setExpandedConv] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    conversations,
    crisisEvents,
    stats,
    getLeaderProfiles,
    getAIPersonas,
    updateConversationStatus,
    updateConversationPriority,
    resolveCrisisEvent,
    leaderTakeover,
    scheduleFollowUp,
  } = usePastoralCareData(churchId);

  const leaders = getLeaderProfiles();
  const personas = getAIPersonas();

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }
    // Sort: crisis first, then by updated_at
    return filtered.sort((a, b) => {
      if (a.priority === 'crisis' && b.priority !== 'crisis') return -1;
      if (b.priority === 'crisis' && a.priority !== 'crisis') return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [conversations, statusFilter, priorityFilter]);

  const unresolvedCrisis = crisisEvents.filter(e => !e.resolved);

  const getPersonaName = (personaId: string | null) => {
    if (!personaId) return 'Unknown';
    return personas.find(p => p.id === personaId)?.name || 'Unknown';
  };

  const getLeaderName = (leaderId: string | null) => {
    if (!leaderId) return 'Unassigned';
    return leaders.find(l => l.id === leaderId)?.displayName || 'Unknown';
  };

  const handleStatusChange = async (convId: string, newStatus: string) => {
    if (newStatus === 'all') return;
    await updateConversationStatus(convId, newStatus as 'active' | 'waiting' | 'escalated' | 'resolved' | 'archived');
  };

  const handlePriorityChange = async (convId: string, newPriority: string) => {
    if (newPriority === 'all') return;
    await updateConversationPriority(convId, newPriority as 'low' | 'medium' | 'high' | 'crisis');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView('pastoral-care')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-dark-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <Shield className="text-violet-600 dark:text-violet-400" size={24} />
            Care Staff Dashboard
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-0.5 text-sm">
            Monitor and manage all pastoral care conversations
          </p>
        </div>
      </div>

      {/* Crisis Alert Banner */}
      {unresolvedCrisis.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                {unresolvedCrisis.length} unresolved crisis event{unresolvedCrisis.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Immediate attention required — review flagged conversations below
              </p>
            </div>
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('crisis'); }}
              className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Show Crisis
            </button>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={<MessageSquare size={14} />}
          label="Active"
          value={stats.activeCount}
          color="text-emerald-500"
          onClick={() => { setStatusFilter('active'); setPriorityFilter('all'); }}
          active={statusFilter === 'active'}
        />
        <StatCard
          icon={<AlertTriangle size={14} />}
          label="Crisis"
          value={stats.crisisCount}
          color="text-red-500"
          onClick={() => { setStatusFilter('all'); setPriorityFilter('crisis'); }}
          active={priorityFilter === 'crisis'}
        />
        <StatCard
          icon={<Clock size={14} />}
          label="Waiting"
          value={stats.waitingCount}
          color="text-amber-500"
          onClick={() => { setStatusFilter('waiting'); setPriorityFilter('all'); }}
          active={statusFilter === 'waiting'}
        />
        <StatCard
          icon={<CheckCircle2 size={14} />}
          label="Resolved"
          value={stats.resolvedCount}
          color="text-gray-500"
          onClick={() => { setStatusFilter('resolved'); setPriorityFilter('all'); }}
          active={statusFilter === 'resolved'}
        />
        <StatCard
          icon={<Users size={14} />}
          label="Leaders"
          value={leaders.filter(l => l.isActive).length}
          color="text-violet-500"
        />
        <StatCard
          icon={<AlertCircle size={14} />}
          label="Total"
          value={stats.totalConversations}
          color="text-blue-500"
          onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
          active={statusFilter === 'all' && priorityFilter === 'all'}
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
          Conversations
          {filteredConversations.length !== conversations.length && (
            <span className="text-sm font-normal text-gray-500 dark:text-dark-400 ml-2">
              ({filteredConversations.length} of {conversations.length})
            </span>
          )}
        </h2>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            showFilters
              ? 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400'
              : 'bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-dark-300 hover:bg-gray-200 dark:hover:bg-dark-700'
          }`}
        >
          <Filter size={12} />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-3 mb-4 p-3 bg-gray-50 dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-400 font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
              className="block mt-1 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-dark-100"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="waiting">Waiting</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-dark-400 font-medium">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as FilterPriority)}
              className="block mt-1 text-sm bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1.5 text-gray-900 dark:text-dark-100"
            >
              <option value="all">All</option>
              <option value="crisis">Crisis</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          {(statusFilter !== 'all' || priorityFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
              className="self-end px-2 py-1.5 text-xs text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Conversations Table */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5">
          <MessageSquare size={32} className="mx-auto text-gray-300 dark:text-dark-600 mb-3" />
          <p className="text-gray-500 dark:text-dark-400">No conversations match your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map(conv => (
            <ConversationRow
              key={conv.id}
              conversation={conv}
              personaName={getPersonaName(conv.persona_id)}
              leaderName={getLeaderName(conv.leader_id)}
              leaderId={conv.leader_id}
              isExpanded={expandedConv === conv.id}
              onToggle={() => setExpandedConv(expandedConv === conv.id ? null : conv.id)}
              onStatusChange={(status) => handleStatusChange(conv.id, status)}
              onPriorityChange={(priority) => handlePriorityChange(conv.id, priority)}
              unresolvedCrisis={unresolvedCrisis.filter(e => e.conversation_id === conv.id)}
              onResolveCrisis={resolveCrisisEvent}
              onLeaderTakeover={(convId, leadId) => leaderTakeover(convId, leadId)}
              onSendFollowUp={(convId) => scheduleFollowUp(convId)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUBCOMPONENTS
// ============================================

function StatCard({ icon, label, value, color, onClick, active }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-dark-850 rounded-xl border p-3 text-left transition-all ${
        active
          ? 'border-violet-300 dark:border-violet-500/30 ring-1 ring-violet-200 dark:ring-violet-500/20'
          : 'border-gray-200/60 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10'
      } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900 dark:text-dark-100">{value}</p>
    </button>
  );
}

function ConversationRow({ conversation, personaName, leaderName, leaderId, isExpanded, onToggle, onStatusChange, onPriorityChange, unresolvedCrisis, onResolveCrisis, onLeaderTakeover, onSendFollowUp }: {
  conversation: ConversationWithMessages;
  personaName: string;
  leaderName: string;
  leaderId: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  unresolvedCrisis: { id: string; severity: string; matched_keywords: string[] }[];
  onResolveCrisis: (id: string, notes?: string) => Promise<void>;
  onLeaderTakeover: (convId: string, leaderId: string) => void;
  onSendFollowUp: (convId: string) => void;
}) {
  const priCfg = priorityConfig[conversation.priority] || priorityConfig.medium;
  const staCfg = statusConfig[conversation.status] || statusConfig.active;
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const flaggedMessages = conversation.messages.filter(m => m.flagged);

  return (
    <div className={`bg-white dark:bg-dark-850 rounded-xl border transition-all ${
      conversation.priority === 'crisis'
        ? 'border-red-200 dark:border-red-500/20'
        : 'border-gray-200/60 dark:border-white/5'
    }`}>
      {/* Main Row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50/50 dark:hover:bg-dark-800/50 transition-colors rounded-xl"
      >
        {/* Priority indicator */}
        <div className={`w-2 h-10 rounded-full flex-shrink-0 ${
          conversation.priority === 'crisis' ? 'bg-red-500 animate-pulse' :
          conversation.priority === 'high' ? 'bg-orange-500' :
          conversation.priority === 'medium' ? 'bg-blue-400' : 'bg-gray-300 dark:bg-dark-600'
        }`} />

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-dark-100 truncate">
              {conversation.is_anonymous ? (conversation.anonymous_id || 'Anonymous') : 'Identified User'}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priCfg.bg} ${priCfg.color}`}>
              {conversation.priority}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${staCfg.bg} ${staCfg.color}`}>
              {conversation.status}
            </span>
            {flaggedMessages.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                {flaggedMessages.length} flagged
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
            {categoryLabels[conversation.category] || conversation.category} — {personaName} — {leaderName}
          </p>
          {lastMessage && (
            <p className="text-xs text-gray-400 dark:text-dark-500 truncate mt-0.5">
              Last: "{lastMessage.content.slice(0, 80)}{lastMessage.content.length > 80 ? '...' : ''}"
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {conversation.messages.length} msgs
          </p>
          <p className="text-[10px] text-gray-400 dark:text-dark-500">
            {formatRelativeTime(conversation.updated_at)}
          </p>
        </div>

        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Detail */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-white/5 pt-3 space-y-3">
          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] text-gray-500 dark:text-dark-400 uppercase">Status:</label>
              <select
                value={conversation.status}
                onChange={(e) => onStatusChange(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1 text-gray-900 dark:text-dark-100"
              >
                <option value="active">Active</option>
                <option value="waiting">Waiting</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="text-[10px] text-gray-500 dark:text-dark-400 uppercase">Priority:</label>
              <select
                value={conversation.priority}
                onChange={(e) => onPriorityChange(e.target.value)}
                className="text-xs bg-gray-50 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-2 py-1 text-gray-900 dark:text-dark-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="crisis">Crisis</option>
              </select>
            </div>

            {/* Leader Actions */}
            {conversation.status !== 'resolved' && conversation.status !== 'archived' && leaderId && (
              <div className="flex items-center gap-2 ml-auto">
                {conversation.status !== 'escalated' && !conversation.messages.some(m => m.sender === 'leader') && (
                  <button
                    onClick={() => onLeaderTakeover(conversation.id, leaderId)}
                    className="text-[10px] px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Join Conversation
                  </button>
                )}
                <button
                  onClick={() => onSendFollowUp(conversation.id)}
                  className="text-[10px] px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Send Follow-up
                </button>
              </div>
            )}
          </div>

          {/* Crisis Events */}
          {unresolvedCrisis.length > 0 && (
            <div className="space-y-2">
              {unresolvedCrisis.map(event => (
                <div key={event.id} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg">
                  <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                      {event.severity === 'high' ? 'High severity' : 'Low severity'} crisis detected
                    </p>
                    {event.matched_keywords.length > 0 && (
                      <p className="text-[10px] text-red-600 dark:text-red-400/70">
                        Keywords: {event.matched_keywords.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onResolveCrisis(event.id, 'Reviewed by staff')}
                    className="text-[10px] px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent Messages */}
          <div>
            <p className="text-[10px] text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-2">Recent Messages</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {conversation.messages.slice(-5).map(msg => (
                <div key={msg.id} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${
                  msg.flagged ? 'bg-red-50 dark:bg-red-500/5' : 'bg-gray-50 dark:bg-dark-800'
                }`}>
                  <span className={`font-medium flex-shrink-0 ${
                    msg.sender === 'user' ? 'text-blue-600 dark:text-blue-400' :
                    msg.sender === 'ai' ? 'text-violet-600 dark:text-violet-400' :
                    'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    [{msg.sender}]
                  </span>
                  <p className="text-gray-700 dark:text-dark-300 flex-1 break-words">
                    {msg.content.slice(0, 200)}{msg.content.length > 200 ? '...' : ''}
                  </p>
                  {msg.flagged && (
                    <AlertTriangle size={10} className="text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conversation Meta */}
          <div className="flex items-center gap-4 text-[10px] text-gray-400 dark:text-dark-500 pt-2 border-t border-gray-100 dark:border-white/5">
            <span>Created: {new Date(conversation.created_at).toLocaleString()}</span>
            <span>Updated: {new Date(conversation.updated_at).toLocaleString()}</span>
            <span>Category: {categoryLabels[conversation.category] || conversation.category}</span>
            {conversation.is_anonymous && <span>Anonymous: {conversation.anonymous_id}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
