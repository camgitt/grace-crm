/**
 * Day Planner Agent
 *
 * Generates a prioritized daily digest including:
 * - Today's tasks (sorted by priority)
 * - People to contact (follow-ups due, new visitors)
 * - Messages ready to send
 * - Birthdays & anniversaries today
 * - AI-generated recommendations
 */

import { BaseAgent } from './BaseAgent';
import type { AgentConfig, AgentContext, AgentResult } from './types';
import { generateAIText } from '../services/ai';

// Day Planner specific types
export interface DayPlannerConfig extends AgentConfig {
  settings: {
    includeTasksByPriority: boolean;
    lookAheadDays: number;
    maxContactsPerDay: number;
    generateAISummary: boolean;
    sendDigestEmail: boolean;
    digestEmailTime: string; // "07:00"
    churchName: string;
    includeFollowUps: boolean;
    includeNewVisitors: boolean;
    includeBirthdays: boolean;
    includeScheduledMessages: boolean;
  };
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  personId?: string;
  personName?: string;
  category: string;
  isOverdue: boolean;
}

export interface ContactItem {
  id: string;
  personId: string;
  name: string;
  email?: string;
  phone?: string;
  reason: 'follow_up' | 'new_visitor' | 'birthday' | 'anniversary' | 'inactive' | 'first_time_giver';
  reasonDetails?: string;
  priority: number; // 1-10, higher = more urgent
  suggestedAction?: string;
  talkingPoints?: string[];
}

export interface MessageItem {
  id: string;
  personId?: string;
  personName?: string;
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  preview: string;
  scheduledFor: string;
  sourceType: string;
}

export interface CelebrationItem {
  personId: string;
  name: string;
  type: 'birthday' | 'anniversary' | 'membership_anniversary';
  email?: string;
  phone?: string;
  yearsCount?: number;
}

export interface DailyDigest {
  date: Date;
  greeting: string;
  priorityTasks: TaskItem[];
  peopleToContact: ContactItem[];
  scheduledMessages: MessageItem[];
  celebrations: CelebrationItem[];
  stats: {
    totalTasks: number;
    overdueTasks: number;
    messagesScheduled: number;
    contactsToReach: number;
  };
  aiSummary?: string;
  aiRecommendations: string[];
}

interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: string;
  birthDate?: string;
  joinDate?: string;
  firstVisit?: string;
  tags?: string[];
}

interface TaskData {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  personId?: string;
  category: string;
}

interface ScheduledMessageData {
  id: string;
  personId?: string;
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  body: string;
  scheduledFor: string;
  status: string;
  sourceType: string;
}

interface InteractionData {
  id: string;
  personId: string;
  type: string;
  createdAt: string;
}

export function createDefaultDayPlannerConfig(churchName: string): DayPlannerConfig {
  return {
    id: 'day-planner-agent',
    name: 'Day Planner',
    description: 'Generates daily task digests and prioritized contact lists',
    category: 'administration',
    status: 'active',
    enabled: true,
    settings: {
      includeTasksByPriority: true,
      lookAheadDays: 7,
      maxContactsPerDay: 10,
      generateAISummary: true,
      sendDigestEmail: false,
      digestEmailTime: '07:00',
      churchName,
      includeFollowUps: true,
      includeNewVisitors: true,
      includeBirthdays: true,
      includeScheduledMessages: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export class DayPlannerAgent extends BaseAgent {
  private dayPlannerConfig: DayPlannerConfig;
  private people: PersonData[];
  private tasks: TaskData[];
  private scheduledMessages: ScheduledMessageData[];
  private interactions: InteractionData[];

  constructor(
    config: DayPlannerConfig,
    context: AgentContext,
    people: PersonData[],
    tasks: TaskData[],
    scheduledMessages: ScheduledMessageData[] = [],
    interactions: InteractionData[] = []
  ) {
    super(config, context);
    this.dayPlannerConfig = config;
    this.people = people;
    this.tasks = tasks;
    this.scheduledMessages = scheduledMessages;
    this.interactions = interactions;
  }

  async execute(): Promise<AgentResult> {
    this.log('Starting Day Planner Agent');

    try {
      const digest = await this.generateDailyDigest();

      this.log('Daily digest generated successfully', {
        tasks: digest.priorityTasks.length,
        contacts: digest.peopleToContact.length,
        messages: digest.scheduledMessages.length,
        celebrations: digest.celebrations.length,
      });

      this.recordAction('notification', true, {
        template: 'daily_digest',
        metadata: { digest },
      });

      return this.getResults();
    } catch (error) {
      this.error('Failed to generate daily digest', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return this.getResults();
    }
  }

  async generateDailyDigest(): Promise<DailyDigest> {
    const today = this.context.currentDate;
    const settings = this.dayPlannerConfig.settings;

    // Get priority tasks
    const priorityTasks = this.getPriorityTasks();

    // Get people to contact
    const peopleToContact = this.getPeopleToContact();

    // Get scheduled messages for today
    const todaysMessages = this.getTodaysMessages();

    // Get celebrations (birthdays, anniversaries)
    const celebrations = this.getCelebrations();

    // Calculate stats
    const stats = {
      totalTasks: priorityTasks.length,
      overdueTasks: priorityTasks.filter(t => t.isOverdue).length,
      messagesScheduled: todaysMessages.length,
      contactsToReach: peopleToContact.length,
    };

    // Generate AI summary if enabled
    let aiSummary: string | undefined;
    let aiRecommendations: string[] = [];

    if (settings.generateAISummary && !this.context.dryRun) {
      const aiResult = await this.generateAISummary({
        tasks: priorityTasks,
        contacts: peopleToContact,
        messages: todaysMessages,
        celebrations,
        stats,
      });

      if (aiResult) {
        aiSummary = aiResult.summary;
        aiRecommendations = aiResult.recommendations;
      }
    }

    // Generate greeting based on time of day
    const hour = today.getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    if (hour >= 17) greeting = 'Good evening';

    return {
      date: today,
      greeting,
      priorityTasks,
      peopleToContact,
      scheduledMessages: todaysMessages,
      celebrations,
      stats,
      aiSummary,
      aiRecommendations,
    };
  }

  private getPriorityTasks(): TaskItem[] {
    const today = this.context.currentDate;
    const lookAhead = new Date(today);
    lookAhead.setDate(lookAhead.getDate() + this.dayPlannerConfig.settings.lookAheadDays);

    // Get person lookup map
    const personMap = new Map(this.people.map(p => [p.id, p]));

    // Filter and sort tasks
    const relevantTasks = this.tasks
      .filter(task => {
        if (task.completed) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate <= lookAhead;
      })
      .map(task => {
        const person = task.personId ? personMap.get(task.personId) : undefined;
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < today;

        return {
          id: task.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          dueDate: task.dueDate,
          personId: task.personId,
          personName: person ? `${person.firstName} ${person.lastName}` : undefined,
          category: task.category,
          isOverdue,
        };
      })
      .sort((a, b) => {
        // Sort by: overdue first, then priority, then due date
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });

    return relevantTasks.slice(0, 20); // Limit to top 20
  }

  private getPeopleToContact(): ContactItem[] {
    const today = this.context.currentDate;
    const settings = this.dayPlannerConfig.settings;
    const contacts: ContactItem[] = [];

    // Create interaction lookup (most recent interaction per person)
    const lastInteraction = new Map<string, Date>();
    this.interactions.forEach(i => {
      const current = lastInteraction.get(i.personId);
      const interactionDate = new Date(i.createdAt);
      if (!current || interactionDate > current) {
        lastInteraction.set(i.personId, interactionDate);
      }
    });

    this.people.forEach(person => {
      // New visitors (first visit within last 7 days)
      if (settings.includeNewVisitors && person.status === 'visitor' && person.firstVisit) {
        const firstVisit = new Date(person.firstVisit);
        const daysSinceVisit = Math.floor((today.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24));

        if (daysSinceVisit <= 7) {
          contacts.push({
            id: `visitor-${person.id}`,
            personId: person.id,
            name: `${person.firstName} ${person.lastName}`,
            email: person.email,
            phone: person.phone,
            reason: 'new_visitor',
            reasonDetails: `Visited ${daysSinceVisit} day${daysSinceVisit !== 1 ? 's' : ''} ago`,
            priority: 10 - daysSinceVisit, // More recent = higher priority
            suggestedAction: 'Send welcome follow-up',
          });
        }
      }

      // Follow-ups needed (no interaction in 14+ days for members)
      if (settings.includeFollowUps && (person.status === 'member' || person.status === 'regular')) {
        const lastContact = lastInteraction.get(person.id);
        if (lastContact) {
          const daysSinceContact = Math.floor((today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceContact >= 14) {
            contacts.push({
              id: `followup-${person.id}`,
              personId: person.id,
              name: `${person.firstName} ${person.lastName}`,
              email: person.email,
              phone: person.phone,
              reason: 'follow_up',
              reasonDetails: `Last contact ${daysSinceContact} days ago`,
              priority: Math.min(daysSinceContact / 7, 8), // Cap at 8
              suggestedAction: 'Check in and see how they are doing',
            });
          }
        }
      }

      // Inactive members
      if (person.status === 'inactive') {
        contacts.push({
          id: `inactive-${person.id}`,
          personId: person.id,
          name: `${person.firstName} ${person.lastName}`,
          email: person.email,
          phone: person.phone,
          reason: 'inactive',
          reasonDetails: 'Marked as inactive',
          priority: 5,
          suggestedAction: 'Reach out to reconnect',
        });
      }
    });

    // Sort by priority (descending) and limit
    return contacts
      .sort((a, b) => b.priority - a.priority)
      .slice(0, settings.maxContactsPerDay);
  }

  private getTodaysMessages(): MessageItem[] {
    const today = this.context.currentDate;
    const todayStr = today.toISOString().split('T')[0];

    const personMap = new Map(this.people.map(p => [p.id, p]));

    return this.scheduledMessages
      .filter(msg => {
        const msgDate = new Date(msg.scheduledFor).toISOString().split('T')[0];
        return msgDate === todayStr && msg.status === 'scheduled';
      })
      .map(msg => {
        const person = msg.personId ? personMap.get(msg.personId) : undefined;
        return {
          id: msg.id,
          personId: msg.personId,
          personName: person ? `${person.firstName} ${person.lastName}` : undefined,
          channel: msg.channel,
          subject: msg.subject,
          preview: msg.body.substring(0, 100) + (msg.body.length > 100 ? '...' : ''),
          scheduledFor: msg.scheduledFor,
          sourceType: msg.sourceType,
        };
      });
  }

  private getCelebrations(): CelebrationItem[] {
    if (!this.dayPlannerConfig.settings.includeBirthdays) return [];

    const today = this.context.currentDate;
    const celebrations: CelebrationItem[] = [];

    this.people.forEach(person => {
      // Check birthdays
      if (person.birthDate) {
        const birthDate = new Date(person.birthDate);
        if (
          birthDate.getMonth() === today.getMonth() &&
          birthDate.getDate() === today.getDate()
        ) {
          const age = today.getFullYear() - birthDate.getFullYear();
          celebrations.push({
            personId: person.id,
            name: `${person.firstName} ${person.lastName}`,
            type: 'birthday',
            email: person.email,
            phone: person.phone,
            yearsCount: age,
          });
        }
      }

      // Check membership anniversaries
      if (person.joinDate) {
        const joinDate = new Date(person.joinDate);
        if (
          joinDate.getMonth() === today.getMonth() &&
          joinDate.getDate() === today.getDate() &&
          joinDate.getFullYear() !== today.getFullYear()
        ) {
          const years = today.getFullYear() - joinDate.getFullYear();
          celebrations.push({
            personId: person.id,
            name: `${person.firstName} ${person.lastName}`,
            type: 'membership_anniversary',
            email: person.email,
            phone: person.phone,
            yearsCount: years,
          });
        }
      }
    });

    return celebrations;
  }

  private async generateAISummary(data: {
    tasks: TaskItem[];
    contacts: ContactItem[];
    messages: MessageItem[];
    celebrations: CelebrationItem[];
    stats: DailyDigest['stats'];
  }): Promise<{ summary: string; recommendations: string[] } | null> {
    const { tasks, contacts, celebrations, stats } = data;

    const prompt = `You are an assistant for ${this.dayPlannerConfig.settings.churchName}. Generate a brief daily summary and 2-3 actionable recommendations based on this data:

Today's Overview:
- ${stats.totalTasks} pending tasks (${stats.overdueTasks} overdue)
- ${stats.contactsToReach} people to contact
- ${stats.messagesScheduled} messages scheduled to send
- ${celebrations.length} celebrations (birthdays/anniversaries)

Top Priority Tasks:
${tasks.slice(0, 5).map(t => `- ${t.title} (${t.priority} priority${t.isOverdue ? ', OVERDUE' : ''})`).join('\n')}

People to Contact:
${contacts.slice(0, 5).map(c => `- ${c.name}: ${c.reasonDetails}`).join('\n')}

${celebrations.length > 0 ? `Celebrations Today:\n${celebrations.map(c => `- ${c.name}: ${c.type}${c.yearsCount ? ` (${c.yearsCount} years)` : ''}`).join('\n')}` : ''}

Respond in JSON format:
{
  "summary": "A 2-3 sentence summary of the day's priorities",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    try {
      const result = await generateAIText({ prompt, maxTokens: 500 });

      if (result.success && result.text) {
        // Try to parse JSON from response
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            summary: parsed.summary || '',
            recommendations: parsed.recommendations || [],
          };
        }
      }
    } catch (error) {
      this.warn('Failed to generate AI summary', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return null;
  }

  // Public method to get digest without full execution
  async getDigest(): Promise<DailyDigest> {
    return this.generateDailyDigest();
  }
}
