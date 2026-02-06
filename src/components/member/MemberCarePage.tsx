import { useState } from 'react';
import {
  Heart,
  Shield,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  Bot,
  Sparkles,
} from 'lucide-react';
import type { LeaderProfile, PastoralConversation, PastoralMessage, HelpCategory } from '../../types';
import { HelpIntakeForm } from '../pastoral/HelpIntakeForm';

interface MemberCarePageProps {
  leaders: LeaderProfile[];
  conversations: PastoralConversation[];
  churchName?: string;
  onCreateHelpRequest: (request: { category: HelpCategory; description?: string; isAnonymous: boolean }) => void;
  onSendMessage: (conversationId: string, content: string) => void;
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

function MemberChatView({ conversation, leaders, onSendMessage, onBack }: {
  conversation: PastoralConversation;
  leaders: LeaderProfile[];
  onSendMessage: (conversationId: string, content: string) => void;
  onBack: () => void;
}) {
  const [message, setMessage] = useState('');
  const leader = leaders.find(l => l.id === conversation.leaderId);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    onSendMessage(conversation.id, trimmed);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800 flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg">
          <ChevronRight size={18} className="text-gray-400 rotate-180" />
        </button>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {leader ? leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <Bot size={14} />}
          </div>
          {leader?.isAvailable && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800 animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {leader?.displayName || 'AI Care Assistant'}
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {CATEGORY_LABELS[conversation.category]}
            {leader?.isAvailable && ' — Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 dark:text-gray-500 py-1">
          <Shield size={10} />
          This conversation is private and confidential
        </div>
        {conversation.messages.map((msg: PastoralMessage) => {
          const isOwn = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isOwn
                  ? 'bg-violet-600 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {conversation.status !== 'resolved' ? (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700 bg-white dark:bg-dark-800">
          <div className="flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex-1 px-3.5 py-2.5 border border-gray-200 dark:border-dark-600 rounded-xl bg-white dark:bg-dark-700 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl transition-colors"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-700 bg-emerald-50 dark:bg-emerald-500/5 text-center">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle size={14} />
            Conversation resolved
          </p>
        </div>
      )}
    </div>
  );
}

export function MemberCarePage({
  leaders,
  conversations,
  churchName,
  onCreateHelpRequest,
  onSendMessage,
}: MemberCarePageProps) {
  const [view, setView] = useState<'home' | 'intake' | 'chat'>('home');
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const onlineLeaders = leaders.filter(l => l.isAvailable && l.isActive);

  // Chat view
  if (view === 'chat' && activeConv) {
    return (
      <MemberChatView
        conversation={activeConv}
        leaders={leaders}
        onSendMessage={onSendMessage}
        onBack={() => { setView('home'); setActiveConvId(null); }}
      />
    );
  }

  // Intake form
  if (view === 'intake') {
    return (
      <div className="p-4">
        <HelpIntakeForm
          onSubmit={(req) => {
            onCreateHelpRequest(req);
            // After creating, the newest conversation will be the last one
            // We'll switch to home to see it
            setView('home');
          }}
          onBack={() => setView('home')}
          churchName={churchName}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/3 -translate-x-1/3" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles size={14} className="text-violet-200" />
            <span className="text-violet-200 text-[10px] font-medium uppercase tracking-wider">24/7 Confidential Support</span>
          </div>
          <h2 className="text-xl font-bold mb-1.5">Need someone to talk to?</h2>
          <p className="text-violet-100 text-sm mb-4">
            Our care team is here for you — connect with a trained leader anytime, day or night.
          </p>
          <button
            onClick={() => setView('intake')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-violet-700 font-semibold rounded-xl text-sm transition-colors hover:bg-violet-50 shadow-sm"
          >
            <Heart size={16} />
            Ask for Help
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Available Leaders */}
      {onlineLeaders.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-3 px-1">
            Leaders Available Now
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {onlineLeaders.map(leader => (
              <div key={leader.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-gray-50 dark:border-dark-900 animate-pulse" />
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 text-center font-medium truncate w-full">
                  {leader.displayName.split(' ')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Conversations */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 dark:text-dark-400 uppercase tracking-wider mb-3 px-1">
          {conversations.length > 0 ? 'Your Conversations' : 'Start a Conversation'}
        </h3>

        {conversations.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700 p-6 text-center">
            <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              No conversations yet. Reach out anytime — your privacy is protected.
            </p>
            <button
              onClick={() => setView('intake')}
              className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline"
            >
              Start your first conversation
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => {
              const leader = leaders.find(l => l.id === conv.leaderId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const unread = conv.status === 'active';
              return (
                <button
                  key={conv.id}
                  onClick={() => { setActiveConvId(conv.id); setView('chat'); }}
                  className="w-full bg-white dark:bg-dark-800 rounded-xl border border-gray-100 dark:border-dark-700 p-3.5 text-left hover:shadow-md transition-all active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {leader ? leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2) : <Bot size={16} />}
                      </div>
                      {leader?.isAvailable && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-800" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-sm ${unread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                          {leader?.displayName || 'AI Care Assistant'}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {lastMsg ? new Date(lastMsg.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          conv.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : conv.status === 'resolved' ? 'bg-gray-100 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {CATEGORY_LABELS[conv.category]}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy footer */}
      <div className="flex items-center gap-2 justify-center text-[10px] text-gray-400 dark:text-gray-500 pt-2">
        <Shield size={10} />
        All conversations are private, encrypted, and confidential
      </div>

      {/* Bottom nav spacing */}
      <div className="h-2" />
    </div>
  );
}
