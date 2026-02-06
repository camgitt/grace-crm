import { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Users,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  ArrowRight,
  Shield,
  Sparkles,
  Activity,
  HeartHandshake,
  UserCheck,
  Bot,
} from 'lucide-react';
import type { LeaderProfile, HelpRequest, PastoralConversation, HelpCategory } from '../../types';
import { HelpIntakeForm } from './HelpIntakeForm';
import { CounselorCard } from './CounselorCard';
import { ChatWindow } from './ChatWindow';

type DashboardTab = 'overview' | 'conversations' | 'leaders' | 'new-request';

interface PastoralCareDashboardProps {
  leaders: LeaderProfile[];
  helpRequests: HelpRequest[];
  conversations: PastoralConversation[];
  activeConversation?: PastoralConversation;
  activeLeader?: LeaderProfile;
  activeConversationId: string | null;
  onCreateHelpRequest: (request: { category: HelpCategory; description?: string; isAnonymous: boolean }) => void;
  onSendMessage: (conversationId: string, content: string) => void;
  onResolveConversation: (conversationId: string) => void;
  onEscalateConversation: (conversationId: string) => void;
  onSetActiveConversation: (id: string | null) => void;
  onBack?: () => void;
  churchName?: string;
}

const CATEGORY_LABELS: Record<HelpCategory, string> = {
  'marriage': 'Marriage',
  'addiction': 'Recovery',
  'grief': 'Grief',
  'faith-questions': 'Faith',
  'crisis': 'Crisis',
  'financial': 'Financial',
  'anxiety-depression': 'Mental Health',
  'parenting': 'Parenting',
  'general': 'General',
};

const CATEGORY_COLORS: Record<HelpCategory, string> = {
  'marriage': 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  'addiction': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  'grief': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  'faith-questions': 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  'crisis': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  'financial': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  'anxiety-depression': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400',
  'parenting': 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  'general': 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
  crisis: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  escalated: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
  resolved: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
  archived: 'bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-500',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function PastoralCareDashboard({
  leaders,
  helpRequests,
  conversations,
  activeConversation,
  activeLeader,
  activeConversationId,
  onCreateHelpRequest,
  onSendMessage,
  onResolveConversation,
  onEscalateConversation,
  onSetActiveConversation,
  onBack,
  churchName,
}: PastoralCareDashboardProps) {
  const [tab, setTab] = useState<DashboardTab>('overview');

  // If there's an active conversation, show the chat
  if (activeConversationId && activeConversation) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ChatWindow
          conversation={activeConversation}
          leader={activeLeader}
          onSendMessage={onSendMessage}
          onBack={() => onSetActiveConversation(null)}
          onResolve={onResolveConversation}
          onEscalate={onEscalateConversation}
          isLeaderView
        />
      </div>
    );
  }

  // New request form
  if (tab === 'new-request') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <HelpIntakeForm
          onSubmit={onCreateHelpRequest}
          onBack={() => setTab('overview')}
          churchName={churchName}
        />
      </div>
    );
  }

  // Stats
  const activeCount = conversations.filter(c => c.status === 'active').length;
  const pendingRequests = helpRequests.filter(r => r.status === 'pending').length;
  const waitingCount = pendingRequests + conversations.filter(c => c.status === 'waiting' || c.status === 'escalated').length;
  const crisisCount = conversations.filter(c => c.priority === 'crisis' && c.status !== 'resolved').length;
  const resolvedCount = conversations.filter(c => c.status === 'resolved').length;
  const availableLeaders = leaders.filter(l => l.isAvailable && l.isActive).length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
              <ChevronLeft size={20} className="text-gray-500" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart size={22} className="text-violet-600" />
              Pastoral Care
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-assisted pastoral support — 24/7 confidential care
            </p>
          </div>
        </div>
        <button
          onClick={() => setTab('new-request')}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Help Request
        </button>
      </div>

      {/* Hero Card — Ask for Help CTA */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-white rounded-full translate-y-1/3 -translate-x-1/4" />
        </div>
        <div className="relative flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-violet-200" />
              <span className="text-violet-200 text-xs font-medium uppercase tracking-wider">AI-Powered 24/7 Support</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Someone needs help? We're here.</h2>
            <p className="text-violet-100 text-sm mb-4 max-w-lg">
              Start a confidential conversation routed to the right counselor. AI provides immediate support while leaders follow up personally.
            </p>
            <button
              onClick={() => setTab('new-request')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-sm font-semibold transition-colors border border-white/20"
            >
              <HeartHandshake size={16} />
              Start Help Request
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="hidden md:flex flex-col gap-2 flex-shrink-0">
            {/* Leader avatars stack */}
            <div className="flex -space-x-3">
              {leaders.filter(l => l.isActive).slice(0, 4).map((leader) => (
                <div
                  key={leader.id}
                  className="relative w-11 h-11 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white/20"
                  title={leader.displayName}
                >
                  {leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  {leader.isAvailable && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-purple-600 animate-pulse" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-violet-200 text-[11px] text-center">
              {availableLeaders} online now
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-dark-800 p-1 rounded-xl w-fit">
        {(['overview', 'conversations', 'leaders'] as DashboardTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${
              tab === t
                ? 'bg-white dark:bg-dark-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={MessageCircle} label="Active" value={activeCount} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" />
            <StatCard icon={Clock} label="Waiting" value={waitingCount} color="text-amber-500 bg-amber-50 dark:bg-amber-500/10" />
            <StatCard icon={AlertTriangle} label="Crisis" value={crisisCount} color="text-red-500 bg-red-50 dark:bg-red-500/10" />
            <StatCard icon={CheckCircle} label="Resolved" value={resolvedCount} color="text-gray-500 bg-gray-50 dark:bg-gray-500/10" />
            <StatCard icon={Users} label="Leaders Online" value={availableLeaders} color="text-violet-500 bg-violet-50 dark:bg-violet-500/10" />
            <StatCard icon={Activity} label="Total Messages" value={totalMessages} color="text-blue-500 bg-blue-50 dark:bg-blue-500/10" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recent Conversations — wider */}
            <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle size={14} className="text-gray-400" />
                  Recent Conversations
                </h2>
                <button
                  onClick={() => setTab('conversations')}
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {conversations.length === 0 ? (
                <div className="text-center py-10">
                  <Shield className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">Conversations will appear here as members reach out for help.</p>
                  <button
                    onClick={() => setTab('new-request')}
                    className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline"
                  >
                    Create a test request
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.slice(0, 6).map(conv => {
                    const leader = leaders.find(l => l.id === conv.leaderId);
                    const lastMsg = conv.messages[conv.messages.length - 1];
                    return (
                      <button
                        key={conv.id}
                        onClick={() => onSetActiveConversation(conv.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors text-left group"
                      >
                        {/* Priority indicator */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          conv.priority === 'crisis' ? 'bg-red-500 animate-pulse' :
                          conv.status === 'active' ? 'bg-emerald-500' :
                          conv.status === 'escalated' ? 'bg-amber-500' :
                          'bg-gray-400'
                        }`} />

                        {/* Leader avatar */}
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-[10px]">
                            {leader ? leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <Bot size={14} />}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {conv.isAnonymous ? 'Anonymous' : 'Member'}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[conv.category]}`}>
                              {CATEGORY_LABELS[conv.category]}
                            </span>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[conv.priority]}`}>
                              {conv.priority}
                            </span>
                          </div>
                          {lastMsg && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {lastMsg.content}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500">
                            {timeAgo(conv.updatedAt)}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[conv.status]}`}>
                            {conv.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right sidebar: Leaders + activity */}
            <div className="space-y-4">
              {/* Available Leaders */}
              <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserCheck size={14} className="text-gray-400" />
                    Leader Status
                  </h2>
                  <button
                    onClick={() => setTab('leaders')}
                    className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
                  >
                    All <ArrowRight size={12} />
                  </button>
                </div>
                <div className="space-y-3">
                  {leaders.filter(l => l.isActive).map(leader => {
                    const leaderConvs = conversations.filter(c => c.leaderId === leader.id && c.status === 'active').length;
                    return (
                      <div key={leader.id} className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                            {leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800 ${
                            leader.isAvailable ? 'bg-emerald-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{leader.displayName}</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-medium ${
                              leader.isAvailable ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {leader.isAvailable ? 'Online' : 'Offline'}
                            </span>
                            {leaderConvs > 0 && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                                {leaderConvs} active
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category breakdown */}
              <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-5">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Activity size={14} className="text-gray-400" />
                  By Category
                </h2>
                <div className="space-y-2">
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => {
                    const count = conversations.filter(c => c.category === cat).length;
                    const total = conversations.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={cat} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-20 truncate">{label}</span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-dark-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 dark:bg-violet-400 rounded-full transition-all"
                            style={{ width: `${count > 0 ? Math.max(pct, 8) : 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-6 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'conversations' && (
        <div className="space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50">
              <MessageCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">No conversations yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Start by creating a help request to begin a pastoral care conversation.
              </p>
              <button
                onClick={() => setTab('new-request')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus size={16} />
                New Help Request
              </button>
            </div>
          ) : (
            conversations.map(conv => {
              const leader = leaders.find(l => l.id === conv.leaderId);
              const lastMessage = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  onClick={() => onSetActiveConversation(conv.id)}
                  className="w-full bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 hover:shadow-md transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                        {leader ? leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <Bot size={16} />}
                      </div>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-800 ${
                        conv.status === 'active' ? 'bg-emerald-500' :
                        conv.status === 'escalated' ? 'bg-amber-500' :
                        'bg-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {conv.isAnonymous ? 'Anonymous' : 'Member'}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[conv.category]}`}>
                          {CATEGORY_LABELS[conv.category]}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[conv.priority]}`}>
                          {conv.priority}
                        </span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${STATUS_COLORS[conv.status]}`}>
                          {conv.status}
                        </span>
                      </div>
                      {lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          <span className="font-medium">{lastMessage.senderName}:</span> {lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400 dark:text-gray-500">
                        {leader && <span>Assigned to {leader.displayName}</span>}
                        <span>{conv.messages.length} messages</span>
                        <span>{timeAgo(conv.updatedAt)}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {tab === 'leaders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaders.filter(l => l.isActive).map(leader => {
            const leaderConvs = conversations.filter(c => c.leaderId === leader.id && c.status === 'active').length;
            return (
              <CounselorCard
                key={leader.id}
                leader={leader}
                onStartChat={() => {
                  setTab('new-request');
                }}
                activeConversations={leaderConvs}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof MessageCircle;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon size={16} />
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
