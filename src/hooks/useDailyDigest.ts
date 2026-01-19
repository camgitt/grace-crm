/**
 * useDailyDigest Hook
 *
 * Manages the daily digest generation using the DayPlannerAgent.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  DayPlannerAgent,
  createDefaultDayPlannerConfig,
  type DailyDigest,
  type DayPlannerConfig,
} from '../lib/agents/DayPlannerAgent';
import type { Person, Task, Interaction } from '../types';
import type { ScheduledMessage } from '../components/ContentCalendar';

interface UseDailyDigestOptions {
  churchId: string;
  churchName: string;
  people: Person[];
  tasks: Task[];
  scheduledMessages?: ScheduledMessage[];
  interactions?: Interaction[];
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

const STORAGE_KEY = 'grace-crm-day-planner-config';

export function useDailyDigest({
  churchId,
  churchName,
  people,
  tasks,
  scheduledMessages = [],
  interactions = [],
  autoRefresh = false,
  refreshInterval = 30 * 60 * 1000, // 30 minutes
}: UseDailyDigestOptions) {
  const [digest, setDigest] = useState<DailyDigest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load config from localStorage
  const [config, setConfig] = useState<DayPlannerConfig>(() => {
    if (typeof window === 'undefined') {
      return createDefaultDayPlannerConfig(churchName);
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return createDefaultDayPlannerConfig(churchName);
      }
    }
    return createDefaultDayPlannerConfig(churchName);
  });

  // Persist config
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Transform data for the agent
  const transformedPeople = people.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
    status: p.status,
    birthDate: p.birthDate,
    joinDate: p.joinDate,
    firstVisit: p.firstVisit,
    tags: p.tags,
  }));

  const transformedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    dueDate: t.dueDate,
    completed: t.completed,
    personId: t.personId,
    category: t.category,
  }));

  const transformedMessages = scheduledMessages.map(m => ({
    id: m.id,
    personId: m.personId,
    channel: m.channel,
    subject: m.subject,
    body: m.body,
    scheduledFor: m.scheduledFor,
    status: m.status,
    sourceType: m.sourceType,
  }));

  const transformedInteractions = interactions.map(i => ({
    id: i.id,
    personId: i.personId,
    type: i.type,
    createdAt: i.createdAt,
  }));

  // Generate digest
  const generateDigest = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const agent = new DayPlannerAgent(
        config,
        {
          churchId,
          churchName,
          currentDate: new Date(),
          dryRun: false,
        },
        transformedPeople,
        transformedTasks,
        transformedMessages,
        transformedInteractions
      );

      const newDigest = await agent.getDigest();
      setDigest(newDigest);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate digest');
      console.error('Failed to generate daily digest:', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    config,
    churchId,
    churchName,
    transformedPeople,
    transformedTasks,
    transformedMessages,
    transformedInteractions,
  ]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      generateDigest();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, generateDigest]);

  // Generate on mount
  useEffect(() => {
    if (!digest && !isLoading) {
      generateDigest();
    }
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<DayPlannerConfig['settings']>) => {
    setConfig(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
      },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  return {
    digest,
    isLoading,
    error,
    lastRefreshed,
    config,
    generateDigest,
    updateConfig,
  };
}
