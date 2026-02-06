import { useState, useCallback, useEffect } from 'react';
import {
  Heart,
  ArrowLeft,
  Lock,
  EyeOff,
  MessageSquare,
} from 'lucide-react';
import type { HelpCategory, View } from '../../types';
import { HelpIntakeForm } from './HelpIntakeForm';
import { CharacterChat } from './CharacterChat';
import { usePastoralCareData, type ConversationWithMessages } from '../../hooks/usePastoralCareData';
import { generatePersonaResponse } from '../../lib/services/personaChat';

interface AnonymousHelpPortalProps {
  setView: (view: View) => void;
  churchId?: string;
}

export function AnonymousHelpPortal({ setView, churchId }: AnonymousHelpPortalProps) {
  const [step, setStep] = useState<'welcome' | 'intake' | 'chat'>('welcome');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ anonymousId: string; sessionToken: string } | null>(null);

  const {
    conversations,
    getLeaderProfiles,
    getAIPersonas,
    createConversation,
    addMessage,
    requestLiveConnect,
    logCrisisEvent,
    updateConversationPriority,
    getOrCreateAnonymousSession,
  } = usePastoralCareData(churchId);

  const leaders = getLeaderProfiles();
  const personas = getAIPersonas();

  // Initialize anonymous session on mount
  useEffect(() => {
    getOrCreateAnonymousSession().then(setSessionInfo);
  }, [getOrCreateAnonymousSession]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activePersona = activeConversation ? personas.find(p => p.id === activeConversation.persona_id) : null;
  const activeLeader = activeConversation ? leaders.find(l => l.id === activeConversation.leader_id) : null;

  const activeConversationForChat = activeConversation ? {
    id: activeConversation.id,
    helpRequestId: activeConversation.id,
    personaId: activeConversation.persona_id || '',
    leaderId: activeConversation.leader_id || '',
    status: activeConversation.status as 'active' | 'waiting' | 'escalated' | 'resolved' | 'archived',
    priority: activeConversation.priority as 'low' | 'medium' | 'high' | 'crisis',
    category: activeConversation.category as HelpCategory,
    isAnonymous: true,
    anonymousId: activeConversation.anonymous_id || sessionInfo?.anonymousId || 'Anonymous',
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

  // Get past anonymous conversations from this session
  const myConversations = conversations.filter(
    c => c.is_anonymous && c.anonymous_id === sessionInfo?.anonymousId
  );

  const handleIntakeSubmit = useCallback(async (category: HelpCategory, description: string) => {
    const conv = await createConversation(category, description, true);
    if (conv) {
      setActiveConversationId(conv.id);
      setStep('chat');
    }
  }, [createConversation]);

  const handleSendMessage = useCallback(async (conversationId: string, userContent: string, aiResponse: string, crisisDetected: boolean) => {
    const conv = conversations.find(c => c.id === conversationId);
    const persona = conv ? personas.find(p => p.id === conv.persona_id) : null;

    await addMessage(
      conversationId,
      'user',
      conv?.anonymous_id || sessionInfo?.anonymousId || 'Anonymous',
      userContent
    );

    const aiMsg = await addMessage(
      conversationId,
      'ai',
      persona?.name || 'AI Assistant',
      aiResponse,
      crisisDetected,
      crisisDetected ? 'Crisis keywords detected' : null
    );

    if (crisisDetected && aiMsg) {
      await logCrisisEvent(conversationId, aiMsg.id, 'high', []);
      await updateConversationPriority(conversationId, 'crisis');
    }
  }, [conversations, personas, addMessage, logCrisisEvent, updateConversationPriority, sessionInfo]);

  const handleRequestConnect = useCallback(async (leaderId: string) => {
    if (activeConversationId) {
      await requestLiveConnect(activeConversationId, leaderId);
    }
  }, [activeConversationId, requestLiveConnect]);

  // Chat view
  if (step === 'chat' && activeConversationForChat && activePersona && activeLeader) {
    return (
      <CharacterChat
        conversation={activeConversationForChat}
        persona={activePersona}
        leader={activeLeader}
        onSendMessage={handleSendMessage}
        onBack={() => setStep('welcome')}
        onRequestConnect={handleRequestConnect}
      />
    );
  }

  // Intake form
  if (step === 'intake') {
    return (
      <HelpIntakeForm
        onSubmit={(category, description, _isAnonymous) => handleIntakeSubmit(category, description)}
        onBack={() => setStep('welcome')}
      />
    );
  }

  // Welcome screen
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Heart size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-2">
            You're Not Alone
          </h1>
          <p className="text-gray-500 dark:text-dark-400">
            Our care team is here for you — 24/7, completely anonymous.
            No login required. No one will know who you are.
          </p>
        </div>

        {/* Privacy Assurance */}
        <div className="mb-8 p-4 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <EyeOff size={16} className="text-violet-600 dark:text-violet-400" />
              <Lock size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <p className="text-sm text-violet-700 dark:text-violet-300 text-left">
              Your identity is completely private. You'll be assigned a random identifier. Nothing you share can be traced back to you.
            </p>
          </div>
          {sessionInfo && (
            <p className="text-xs text-violet-600/70 dark:text-violet-400/70 mt-2 text-left">
              Your anonymous ID: <strong>{sessionInfo.anonymousId}</strong>
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => setStep('intake')}
          className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition-colors shadow-sm hover:shadow-md text-lg mb-4"
        >
          I Need Someone to Talk To
        </button>

        {/* Previous Conversations */}
        {myConversations.length > 0 && (
          <div className="mt-6">
            <p className="text-xs text-gray-500 dark:text-dark-400 mb-3 uppercase tracking-wider font-medium">
              Your Previous Conversations
            </p>
            <div className="space-y-2">
              {myConversations.slice(0, 3).map(conv => {
                const persona = personas.find(p => p.id === conv.persona_id);
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      setStep('chat');
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-white dark:bg-dark-850 rounded-xl border border-gray-200/60 dark:border-white/5 hover:shadow-md transition-all text-left"
                  >
                    <MessageSquare size={14} className="text-violet-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-dark-100 truncate">
                        {persona?.name || 'AI Assistant'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {conv.messages.length} messages — {conv.status}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-dark-500">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Back link */}
        <button
          onClick={() => setView('pastoral-care')}
          className="mt-6 text-sm text-gray-400 dark:text-dark-500 hover:text-gray-600 dark:hover:text-dark-300 transition-colors"
        >
          &larr; Back to Pastoral Care
        </button>
      </div>
    </div>
  );
}
