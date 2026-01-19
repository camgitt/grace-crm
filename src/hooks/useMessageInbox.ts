/**
 * useMessageInbox Hook
 *
 * Manages inbound messages and reply handling.
 * In production, this would connect to Supabase and webhook endpoints.
 * Currently uses localStorage for demo purposes.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { InboundMessage } from '../components/MessageInbox';
import {
  classifyInboundMessage,
  generateReplyDraft,
} from '../lib/services/ai';

interface UseMessageInboxOptions {
  churchId: string;
  churchName: string;
}

const STORAGE_KEY = 'grace-crm-inbound-messages';

// Sample demo messages for testing
const DEMO_MESSAGES: InboundMessage[] = [
  {
    id: 'demo-1',
    personId: undefined,
    personName: 'Sarah Johnson',
    channel: 'email',
    fromAddress: 'sarah.j@email.com',
    subject: 'Question about small groups',
    body: 'Hi! I attended service last Sunday and really enjoyed it. I was wondering if you could tell me more about your small groups? I\'m interested in joining one that meets during the week. Are there any groups for young professionals?',
    aiCategory: 'question',
    aiSentiment: 'positive',
    aiSuggestedResponse: 'Thank you for reaching out, Sarah! We\'re so glad you enjoyed the service. We have several small groups that meet during the week, including a young professionals group that meets on Wednesday evenings. I\'d love to connect you with the right group. Would you like me to send you more details?',
    aiConfidence: 0.92,
    status: 'new',
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'demo-2',
    personName: 'Michael Chen',
    channel: 'sms',
    fromAddress: '+1555123456',
    body: 'Thank you so much for the prayers during my surgery. I\'m recovering well and feeling blessed by all the support from the church family.',
    aiCategory: 'thanks',
    aiSentiment: 'positive',
    aiSuggestedResponse: 'Michael, we\'re so grateful to hear about your recovery! The whole church family has been praying for you. Please let us know if there\'s anything else we can do to support you during this time.',
    aiConfidence: 0.95,
    status: 'new',
    receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'demo-3',
    personName: 'Lisa Martinez',
    channel: 'email',
    fromAddress: 'lisa.m@email.com',
    subject: 'Prayer request for my mother',
    body: 'Please pray for my mother who was just diagnosed with cancer. She\'s starting treatment next week and we\'re all very worried. Her name is Rosa and she could really use the prayers of the church.',
    aiCategory: 'prayer_request',
    aiSentiment: 'negative',
    aiSuggestedResponse: 'Lisa, thank you for trusting us with this prayer request. We are so sorry to hear about Rosa\'s diagnosis. Please know that our entire church family will be lifting her up in prayer, especially as she begins treatment. We\'re here for you and your family during this difficult time.',
    aiConfidence: 0.98,
    status: 'new',
    receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

export function useMessageInbox({ churchId: _churchId, churchName }: UseMessageInboxOptions) {
  // _churchId reserved for future Supabase integration
  const [messages, setMessages] = useState<InboundMessage[]>(() => {
    if (typeof window === 'undefined') return DEMO_MESSAGES;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.length > 0 ? parsed : DEMO_MESSAGES;
      } catch {
        return DEMO_MESSAGES;
      }
    }
    return DEMO_MESSAGES;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Refresh (simulate fetching new messages)
  const refresh = useCallback(async () => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  // Mark message as read
  const markRead = useCallback((id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id && msg.status === 'new'
          ? { ...msg, status: 'read' as const }
          : msg
      )
    );
  }, []);

  // Archive message
  const archive = useCallback((id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, status: 'archived' as const } : msg
      )
    );
  }, []);

  // Flag message
  const flag = useCallback((id: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, status: msg.status === 'flagged' ? 'read' as const : 'flagged' as const }
          : msg
      )
    );
  }, []);

  // Send reply
  const sendReply = useCallback(async (
    messageId: string,
    _response: string,
    _channel: 'email' | 'sms'
  ) => {
    // In production, this would actually send the message using _response and _channel
    // For now, just update the status
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              status: 'replied' as const,
              repliedAt: new Date().toISOString(),
            }
          : msg
      )
    );

    // Return success
    return true;
  }, []);

  // Generate AI response
  const generateResponse = useCallback(async (messageId: string): Promise<string> => {
    const message = messages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    const result = await generateReplyDraft(
      message.body,
      message.aiCategory || 'other',
      message.personName || 'Friend',
      churchName
    );

    if (result.success && result.text) {
      return result.text;
    }

    throw new Error(result.error || 'Failed to generate response');
  }, [messages, churchName]);

  // Add a new inbound message (for webhook simulation)
  const addMessage = useCallback(async (message: Omit<InboundMessage, 'id' | 'aiCategory' | 'aiSentiment' | 'aiSuggestedResponse' | 'aiConfidence'>) => {
    // Classify the message with AI
    const classification = await classifyInboundMessage(
      message.body,
      message.subject,
      message.personName
    );

    // Generate suggested response
    let suggestedResponse: string | undefined;
    if (classification.success && classification.classification) {
      const responseResult = await generateReplyDraft(
        message.body,
        classification.classification.category,
        message.personName || 'Friend',
        churchName
      );
      if (responseResult.success) {
        suggestedResponse = responseResult.text;
      }
    }

    const newMessage: InboundMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      aiCategory: classification.classification?.category,
      aiSentiment: classification.classification?.sentiment,
      aiSuggestedResponse: suggestedResponse,
      aiConfidence: classification.classification?.confidence,
      status: 'new',
    };

    setMessages(prev => [newMessage, ...prev]);
    return newMessage;
  }, [churchName]);

  // Stats
  const stats = useMemo(() => ({
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    flagged: messages.filter(m => m.status === 'flagged').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length,
  }), [messages]);

  // Get messages by category
  const getMessagesByCategory = useCallback((category: string) => {
    return messages.filter(m => m.aiCategory === category);
  }, [messages]);

  // Get urgent messages
  const urgentMessages = useMemo(() => {
    return messages.filter(m =>
      m.aiSentiment === 'urgent' ||
      m.aiSentiment === 'negative' ||
      m.aiCategory === 'concern'
    );
  }, [messages]);

  return {
    messages,
    isLoading,
    stats,
    urgentMessages,
    refresh,
    markRead,
    archive,
    flag,
    sendReply,
    generateResponse,
    addMessage,
    getMessagesByCategory,
  };
}
