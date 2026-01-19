/**
 * useScheduledMessages Hook
 *
 * Manages scheduled messages for the Content Calendar.
 * In a production environment, this would connect to Supabase.
 * Currently uses localStorage for demo purposes.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ScheduledMessage } from '../components/ContentCalendar';
import { generateScheduledMessage } from '../lib/services/ai';

interface UseScheduledMessagesOptions {
  churchId: string;
  churchName: string;
}

const STORAGE_KEY = 'grace-crm-scheduled-messages';

export function useScheduledMessages({ churchId, churchName }: UseScheduledMessagesOptions) {
  const [messages, setMessages] = useState<ScheduledMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Create a new scheduled message
  const createMessage = useCallback(async (message: Omit<ScheduledMessage, 'id'>) => {
    const newMessage: ScheduledMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Update an existing message
  const updateMessage = useCallback(async (id: string, updates: Partial<ScheduledMessage>) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, []);

  // Delete a message
  const deleteMessage = useCallback(async (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  // Send a message immediately
  const sendNow = useCallback(async (id: string) => {
    // In production, this would trigger the actual send
    // For now, just update the status
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id
          ? { ...msg, status: 'sent' as const, sentAt: new Date().toISOString() }
          : msg
      )
    );
  }, []);

  // Generate AI message content
  const generateAIMessage = useCallback(async (
    personId: string,
    messageType: string,
    personName?: string
  ): Promise<string> => {
    const name = personName || 'Friend';
    const type = messageType as 'birthday' | 'anniversary' | 'follow_up' | 'welcome' | 'thank_you';

    const result = await generateScheduledMessage(name, type, churchName);

    if (result.success && result.text) {
      return result.text;
    }

    throw new Error(result.error || 'Failed to generate message');
  }, [churchName]);

  // Get messages for a date range
  const getMessagesInRange = useCallback((startDate: Date, endDate: Date) => {
    return messages.filter(msg => {
      const msgDate = new Date(msg.scheduledFor);
      return msgDate >= startDate && msgDate <= endDate;
    });
  }, [messages]);

  // Get pending messages (scheduled but past due)
  const pendingMessages = useMemo(() => {
    const now = new Date();
    return messages.filter(msg =>
      msg.status === 'scheduled' && new Date(msg.scheduledFor) <= now
    );
  }, [messages]);

  // Get upcoming messages
  const upcomingMessages = useMemo(() => {
    const now = new Date();
    return messages
      .filter(msg => msg.status === 'scheduled' && new Date(msg.scheduledFor) > now)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
  }, [messages]);

  // Bulk operations
  const bulkUpdateStatus = useCallback(async (ids: string[], status: ScheduledMessage['status']) => {
    setMessages(prev =>
      prev.map(msg =>
        ids.includes(msg.id) ? { ...msg, status } : msg
      )
    );
  }, []);

  return {
    messages,
    isLoading,
    createMessage,
    updateMessage,
    deleteMessage,
    sendNow,
    generateAIMessage,
    getMessagesInRange,
    pendingMessages,
    upcomingMessages,
    bulkUpdateStatus,
  };
}
