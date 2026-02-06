import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Bot,
  Phone,
  AlertTriangle,
  Info,
  X,
  UserCheck,
} from 'lucide-react';
import type { AIPersona, LeaderProfile, CareConversation, CareMessage } from '../../types';
import { generatePersonaResponse } from '../../lib/services/personaChat';

interface CharacterChatProps {
  conversation: CareConversation;
  persona: AIPersona;
  leader: LeaderProfile;
  onSendMessage: (conversationId: string, content: string, aiResponse: string, crisisDetected: boolean) => void;
  onBack: () => void;
  onRequestConnect: (leaderId: string) => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function CharacterChat({
  conversation,
  persona,
  leader,
  onSendMessage,
  onBack,
  onRequestConnect,
}: CharacterChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect if a leader has taken over (any 'leader' messages exist)
  const hasLeaderJoined = conversation.messages.some(m => m.sender === 'leader');
  const isEscalated = conversation.status === 'escalated';

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      const result = await generatePersonaResponse(
        persona,
        leader,
        conversation.messages,
        text
      );
      onSendMessage(conversation.id, text, result.text, result.crisisDetected);
    } catch {
      onSendMessage(
        conversation.id,
        text,
        "I'm sorry, I'm having trouble responding right now. Please try again.",
        false
      );
    }

    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-850 border-b border-gray-200/60 dark:border-white/5">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-500 dark:text-dark-400" />
        </button>

        <div className="relative">
          {leader.photo ? (
            <img src={leader.photo} alt={leader.displayName} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm ${
              hasLeaderJoined
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              {getInitials(leader.displayName)}
            </div>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-dark-850 ${
            leader.isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-dark-600'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-dark-100 truncate">
            {hasLeaderJoined ? leader.displayName : persona.name}
          </h2>
          <p className="text-xs text-gray-500 dark:text-dark-400">
            {hasLeaderJoined
              ? `${leader.displayName} has joined — Live conversation`
              : `AI Assistant for ${leader.displayName}${leader.isOnline ? ' — Live Now' : ''}`
            }
          </p>
        </div>

        {/* Connect Button — hide if leader already joined */}
        {!hasLeaderJoined && (
          <button
            onClick={() => onRequestConnect(leader.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
          >
            <Phone size={12} />
            Connect with {leader.displayName.split(' ')[0]}
          </button>
        )}
      </div>

      {/* Leader Takeover Banner */}
      {hasLeaderJoined && !isEscalated && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border-b border-emerald-100 dark:border-emerald-500/10">
          <UserCheck size={14} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="text-xs text-emerald-700 dark:text-emerald-300 flex-1">
            {leader.displayName} has joined this conversation. You're now speaking directly with a care leader.
          </p>
        </div>
      )}

      {/* Disclaimer Banner — hide if leader took over */}
      {showDisclaimer && !hasLeaderJoined && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-100 dark:border-blue-500/10">
          <Info size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300 flex-1">
            This is an AI assistant trained on {leader.displayName}'s approach. Not a substitute for professional counseling.
          </p>
          <button onClick={() => setShowDisclaimer(false)} className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded">
            <X size={12} className="text-blue-400" />
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {conversation.messages.map((message, index) => {
          // Show handoff divider when leader first appears
          const isFirstLeaderMsg = message.sender === 'leader' && !conversation.messages.slice(0, index).some(m => m.sender === 'leader');

          return (
            <div key={message.id}>
              {isFirstLeaderMsg && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-emerald-200 dark:bg-emerald-500/20" />
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full">
                    <UserCheck size={10} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                      {leader.displayName} joined the conversation
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-emerald-200 dark:bg-emerald-500/20" />
                </div>
              )}
              <MessageBubble message={message} leader={leader} />
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              hasLeaderJoined
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                : 'bg-gradient-to-br from-violet-500 to-purple-600'
            }`}>
              {hasLeaderJoined ? <UserCheck size={14} className="text-white" /> : <Bot size={14} className="text-white" />}
            </div>
            <div className="bg-gray-100 dark:bg-dark-800 rounded-2xl rounded-tl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-dark-400">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Crisis Warning Footer */}
      {conversation.priority === 'crisis' && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-500/10 border-t border-red-100 dark:border-red-500/10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              <strong>Need immediate help?</strong> Call or text <strong>988</strong> (Suicide & Crisis Lifeline) or text HOME to <strong>741741</strong>
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white dark:bg-dark-850 border-t border-gray-200/60 dark:border-white/5">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-gray-400 dark:placeholder:text-dark-500 resize-none max-h-32"
            style={{ minHeight: '42px' }}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Message Bubble Component
// ============================================

function MessageBubble({ message, leader }: { message: CareMessage; leader: LeaderProfile }) {
  const isUser = message.sender === 'user';
  const isAI = message.sender === 'ai';
  const isLeader = message.sender === 'leader';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-dark-700 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-gray-500 dark:text-dark-400" />
        </div>
      ) : isLeader ? (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-semibold">
            {leader.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
      )}

      {/* Message */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Leader name label */}
        {isLeader && (
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mb-0.5 px-1">
            {leader.displayName}
          </p>
        )}

        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-violet-600 text-white rounded-tr-md'
              : isLeader
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-gray-900 dark:text-dark-100 rounded-tl-md border border-emerald-100 dark:border-emerald-500/20'
                : 'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-tl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Flagged indicator */}
        {message.flagged && (
          <div className="flex items-center gap-1 mt-1 px-1">
            <AlertTriangle size={10} className="text-amber-500" />
            <span className="text-[10px] text-amber-600 dark:text-amber-400">{message.flagReason || 'Flagged for review'}</span>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 dark:text-dark-500 mt-1 px-1 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          {isAI && ' — AI'}
          {isLeader && ` — ${leader.displayName}`}
        </p>
      </div>
    </div>
  );
}
