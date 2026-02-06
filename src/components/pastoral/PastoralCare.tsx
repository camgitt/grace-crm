import { useState, useCallback } from 'react';
import {
  Heart,
  HelpCircle,
  MessageSquare,
  Users,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';
import type {
  HelpCategory,
  View,
} from '../../types';
import { LeaderProfileCard } from './LeaderProfileCard';
import { HelpIntakeForm } from './HelpIntakeForm';
import { CharacterChat } from './CharacterChat';
import { usePastoralCareData } from '../../hooks/usePastoralCareData';

type PastoralSubView = 'leaders' | 'intake' | 'chat' | 'conversations';

interface PastoralCareProps {
  setView?: (view: View) => void;
  churchId?: string;
  initialSubView?: PastoralSubView;
}

export function PastoralCare({ setView, churchId, initialSubView }: PastoralCareProps) {
  const [subView, setSubView] = useState<PastoralSubView>(initialSubView || 'leaders');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const {
    conversations,
    stats,
    getLeaderProfiles,
    getAIPersonas,
    createConversation,
    addMessage,
    requestLiveConnect,
    logCrisisEvent,
    updateConversationPriority,
  } = usePastoralCareData(churchId);

  const leaders = getLeaderProfiles();
  const personas = getAIPersonas();

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activePersona = activeConversation ? personas.find(p => p.id === activeConversation.persona_id) : null;
  const activeLeader = activeConversation ? leaders.find(l => l.id === activeConversation.leader_id) : null;

  // Convert DB conversation to the CareConversation shape CharacterChat expects
  const activeConversationForChat = activeConversation ? {
    id: activeConversation.id,
    helpRequestId: activeConversation.id,
    personaId: activeConversation.persona_id || '',
    leaderId: activeConversation.leader_id || '',
    status: activeConversation.status as 'active' | 'waiting' | 'escalated' | 'resolved' | 'archived',
    priority: activeConversation.priority as 'low' | 'medium' | 'high' | 'crisis',
    category: activeConversation.category as HelpCategory,
    isAnonymous: activeConversation.is_anonymous,
    anonymousId: activeConversation.anonymous_id || undefined,
    messages: activeConversation.messages.map(m => ({
      id: m.id,
      conversationId: m.conversation_id,
      sender: m.sender as 'user' | 'ai' | 'leader',
      senderName: m.sender_name,
      content: m.content,
      timestamp: m.created_at,
      flagged: m.flagged,
      flagReason: m.flag_reason || undefined,
    })),
    createdAt: activeConversation.created_at,
    updatedAt: activeConversation.updated_at,
  } : null;

  const handleStartChat = useCallback(async (leaderId: string) => {
    const conv = await createConversation('general', '', false, leaderId);
    if (conv) {
      setActiveConversationId(conv.id);
      setSubView('chat');
    }
  }, [createConversation]);

  const handleIntakeSubmit = useCallback(async (category: HelpCategory, description: string, isAnonymous: boolean) => {
    const conv = await createConversation(category, description, isAnonymous);
    if (conv) {
      setActiveConversationId(conv.id);
      setSubView('chat');
    }
  }, [createConversation]);

  const handleSendMessage = useCallback(async (conversationId: string, userContent: string, aiResponse: string, crisisDetected: boolean) => {
    const conv = conversations.find(c => c.id === conversationId);
    const persona = conv ? personas.find(p => p.id === conv.persona_id) : null;

    // Add user message
    await addMessage(
      conversationId,
      'user',
      conv?.is_anonymous ? (conv.anonymous_id || 'Anonymous') : 'You',
      userContent
    );

    // Add AI response
    const aiMsg = await addMessage(
      conversationId,
      'ai',
      persona?.name || 'AI Assistant',
      aiResponse,
      crisisDetected,
      crisisDetected ? 'Crisis keywords detected' : null
    );

    // Log crisis event if detected
    if (crisisDetected && aiMsg) {
      await logCrisisEvent(conversationId, aiMsg.id, 'high', []);
      await updateConversationPriority(conversationId, 'crisis');
    }
  }, [conversations, personas, addMessage, logCrisisEvent, updateConversationPriority]);

  const handleRequestConnect = useCallback(async (leaderId: string) => {
    if (activeConversationId) {
      await requestLiveConnect(activeConversationId, leaderId);
    }
  }, [activeConversationId, requestLiveConnect]);

  // Navigate to staff dashboard
  const handleOpenStaffDashboard = useCallback(() => {
    if (setView) {
      setView('care-dashboard' as View);
    }
  }, [setView]);

  // Render sub-views
  if (subView === 'intake') {
    return (
      <HelpIntakeForm
        onSubmit={handleIntakeSubmit}
        onBack={() => setSubView('leaders')}
      />
    );
  }

  if (subView === 'chat' && activeConversationForChat && activePersona && activeLeader) {
    return (
      <CharacterChat
        conversation={activeConversationForChat}
        persona={activePersona}
        leader={activeLeader}
        onSendMessage={handleSendMessage}
        onBack={() => setSubView('leaders')}
        onRequestConnect={handleRequestConnect}
      />
    );
  }

  if (subView === 'conversations') {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <button
          onClick={() => setSubView('leaders')}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 mb-6"
        >
          &larr; Back to Care Team
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-dark-100 mb-4">Conversations</h2>
        {conversations.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-400">No conversations yet.</p>
        ) : (
          <div className="space-y-2">
            {conversations.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).map(conv => {
              const persona = personas.find(p => p.id === conv.persona_id);
              const priorityColors: Record<string, string> = {
                crisis: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
                high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
                medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
                low: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400',
              };
              const statusColors: Record<string, string> = {
                active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
                waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
                escalated: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
                resolved: 'bg-gray-100 text-gray-600 dark:bg-gray-500/10 dark:text-gray-400',
                archived: 'bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-500',
              };
              return (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConversationId(conv.id); setSubView('chat'); }}
                  className="w-full flex items-center gap-4 p-4 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-500/20 transition-all text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-dark-100 truncate">
                        {conv.is_anonymous ? conv.anonymous_id : 'Conversation'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColors[conv.priority]}`}>
                        {conv.priority}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[conv.status]}`}>
                        {conv.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-dark-400 truncate">
                      {persona?.name} — {getCategoryLabel(conv.category)} — {conv.messages.length} messages
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 dark:text-dark-500">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-dark-500">
                      {new Date(conv.updated_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Default: Leader list + dashboard
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <Heart className="text-violet-600 dark:text-violet-400" size={24} />
            Pastoral Care
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            AI-powered care team — available 24/7
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleOpenStaffDashboard}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-dark-300 bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            <Shield size={14} />
            Staff Dashboard
          </button>
          <button
            onClick={() => setSubView('conversations')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-dark-300 bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
          >
            <MessageSquare size={14} />
            Conversations
            {stats.activeCount > 0 && (
              <span className="bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs px-1.5 py-0.5 rounded-full font-medium">
                {stats.activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={14} className="text-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-dark-400">Active</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-dark-100">{stats.activeCount}</p>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs text-gray-500 dark:text-dark-400">Crisis</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-dark-100">{stats.crisisCount}</p>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-violet-500" />
            <span className="text-xs text-gray-500 dark:text-dark-400">Leaders</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-dark-100">{leaders.filter(l => l.isActive).length}</p>
        </div>
        <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className="text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-dark-400">Resolved</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-dark-100">{stats.resolvedCount}</p>
        </div>
      </div>

      {/* Ask for Help CTA */}
      <div className="mb-8 p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-violet-900 dark:text-violet-200 flex items-center gap-2">
              <HelpCircle size={20} />
              Need someone to talk to?
            </h2>
            <p className="text-sm text-violet-700 dark:text-violet-300 mt-1">
              Select a topic and we'll connect you with the right person. Anonymous option available.
            </p>
          </div>
          <button
            onClick={() => setSubView('intake')}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm hover:shadow-md flex-shrink-0"
          >
            Ask for Help
          </button>
        </div>
      </div>

      {/* Leader Cards */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">
        Our Care Team
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaders.filter(l => l.isActive).map((leader) => (
          <LeaderProfileCard
            key={leader.id}
            leader={leader}
            onChat={handleStartChat}
          />
        ))}
      </div>
    </div>
  );
}

// Helper
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
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
  return labels[category] || category;
}
