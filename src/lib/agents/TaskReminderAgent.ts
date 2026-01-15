/**
 * Task Reminder Agent
 *
 * Automatically sends reminders for upcoming and overdue tasks.
 * Helps staff stay on top of follow-ups and care assignments.
 */

import { BaseAgent } from './BaseAgent';
import type { AgentResult, AgentContext, TaskReminderConfig } from './types';
import { emailService } from '../services/email';
import { smsService } from '../services/sms';

// Re-export config type for convenience
export type { TaskReminderConfig };

interface TaskData {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  completed: boolean;
  personId?: string;
  assignedTo?: string;
}

interface PersonData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export class TaskReminderAgent extends BaseAgent {
  protected config: TaskReminderConfig;
  private tasks: TaskData[];
  private people: PersonData[];
  private staff: StaffMember[];

  constructor(
    config: TaskReminderConfig,
    context: AgentContext,
    tasks: TaskData[],
    people: PersonData[],
    staff: StaffMember[]
  ) {
    super(config, context);
    this.config = config;
    this.tasks = tasks;
    this.people = people;
    this.staff = staff;
  }

  /**
   * Find tasks that need reminders
   */
  private findTasksNeedingReminders(): {
    upcoming: TaskData[];
    dueToday: TaskData[];
    overdue: TaskData[];
  } {
    const today = this.context.currentDate;
    const todayStr = today.toISOString().split('T')[0];

    const upcoming: TaskData[] = [];
    const dueToday: TaskData[] = [];
    const overdue: TaskData[] = [];

    for (const task of this.tasks) {
      // Skip completed tasks
      if (task.completed) continue;

      // Skip excluded categories
      if (this.config.settings.excludeCategories.includes(task.category)) continue;

      // Skip non-high priority if filtering
      if (this.config.settings.onlyHighPriority && task.priority !== 'high') continue;

      const dueDate = new Date(task.dueDate);
      const dueDateStr = task.dueDate;
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dueDateStr === todayStr && this.config.settings.remindOnDueDate) {
        dueToday.push(task);
      } else if (daysUntilDue === this.config.settings.remindDaysBefore) {
        upcoming.push(task);
      } else if (daysUntilDue < 0 && this.config.settings.remindWhenOverdue) {
        // Check overdue reminder frequency
        const daysOverdue = Math.abs(daysUntilDue);
        const shouldRemind = this.shouldSendOverdueReminder(daysOverdue);
        if (shouldRemind) {
          overdue.push(task);
        }
      }
    }

    return { upcoming, dueToday, overdue };
  }

  /**
   * Determine if we should send an overdue reminder based on frequency setting
   */
  private shouldSendOverdueReminder(daysOverdue: number): boolean {
    switch (this.config.settings.overdueReminderFrequency) {
      case 'daily':
        return true;
      case 'every3days':
        return daysOverdue % 3 === 1; // Day 1, 4, 7, etc.
      case 'weekly':
        return daysOverdue % 7 === 1; // Day 1, 8, 15, etc.
      default:
        return daysOverdue === 1; // Just the first day overdue
    }
  }

  /**
   * Get recipient info for a task
   */
  private getRecipient(task: TaskData): StaffMember | null {
    if (!task.assignedTo) {
      // If no assignee, could return a default admin or null
      return this.staff[0] || null;
    }
    return this.staff.find((s) => s.id === task.assignedTo) || null;
  }

  /**
   * Get person name for a task
   */
  private getPersonName(task: TaskData): string {
    if (!task.personId) return 'N/A';
    const person = this.people.find((p) => p.id === task.personId);
    return person ? `${person.firstName} ${person.lastName}` : 'Unknown';
  }

  /**
   * Send task reminder
   */
  private async sendReminder(
    task: TaskData,
    type: 'upcoming' | 'due_today' | 'overdue'
  ): Promise<boolean> {
    const recipient = this.getRecipient(task);
    if (!recipient) {
      this.warn(`No recipient found for task: ${task.title}`);
      return false;
    }

    const { sendEmail, sendSMS } = this.config.settings;
    let success = true;

    const personName = this.getPersonName(task);
    const dueDate = new Date(task.dueDate).toLocaleDateString();

    // Determine urgency message
    let urgencyPrefix = '';
    if (type === 'overdue') {
      urgencyPrefix = 'OVERDUE: ';
    } else if (type === 'due_today') {
      urgencyPrefix = 'DUE TODAY: ';
    }

    // Send email reminder
    if (sendEmail && recipient.email) {
      try {
        if (!this.context.dryRun) {
          const result = await emailService.sendTaskReminder(
            { email: recipient.email, name: recipient.name },
            {
              recipientName: recipient.name.split(' ')[0],
              taskTitle: `${urgencyPrefix}${task.title}`,
              dueDate,
              personName,
            }
          );
          if (!result.success) {
            this.error(`Failed to send task reminder email: ${result.error}`);
            success = false;
          } else {
            this.log(`Sent ${type} task reminder email to ${recipient.name}`, {
              task: task.title,
              messageId: result.messageId,
            });
          }
        } else {
          this.log(`[DRY RUN] Would send ${type} task reminder email to ${recipient.name}`);
        }
        this.recordAction('email', success, {
          template: 'TASK_REMINDER',
          templateData: { taskTitle: task.title, dueDate, personName },
          metadata: { reminderType: type },
        });
      } catch (err) {
        this.error(`Error sending task reminder email: ${err}`);
        success = false;
      }
    }

    // Send SMS reminder
    if (sendSMS && recipient.phone) {
      try {
        const message =
          type === 'overdue'
            ? `OVERDUE: "${task.title}" was due ${dueDate}. Please complete this task ASAP.`
            : type === 'due_today'
              ? `Reminder: "${task.title}" is due today. Related to: ${personName}`
              : `Upcoming task: "${task.title}" is due ${dueDate}. Related to: ${personName}`;

        if (!this.context.dryRun) {
          const result = await smsService.send({ to: recipient.phone, message });
          if (!result.success) {
            this.error(`Failed to send task reminder SMS: ${result.error}`);
            success = false;
          } else {
            this.log(`Sent ${type} task reminder SMS to ${recipient.name}`);
          }
        } else {
          this.log(`[DRY RUN] Would send ${type} task reminder SMS to ${recipient.name}`);
        }
        this.recordAction('sms', success, {
          template: 'TASK_REMINDER',
          templateData: { taskTitle: task.title },
          metadata: { reminderType: type },
        });
      } catch (err) {
        this.error(`Error sending task reminder SMS: ${err}`);
        success = false;
      }
    }

    return success;
  }

  /**
   * Execute the agent
   */
  async execute(): Promise<AgentResult> {
    if (!this.isActive()) {
      this.log('Agent is not active, skipping execution');
      return this.getResults();
    }

    this.log('Starting Task Reminder Agent', {
      remindDaysBefore: this.config.settings.remindDaysBefore,
      remindOnDueDate: this.config.settings.remindOnDueDate,
      remindWhenOverdue: this.config.settings.remindWhenOverdue,
    });

    const { upcoming, dueToday, overdue } = this.findTasksNeedingReminders();

    this.log(
      `Found ${upcoming.length} upcoming, ${dueToday.length} due today, ${overdue.length} overdue tasks`
    );

    // Process upcoming task reminders
    for (const task of upcoming) {
      await this.sendReminder(task, 'upcoming');
    }

    // Process due today reminders
    for (const task of dueToday) {
      await this.sendReminder(task, 'due_today');
    }

    // Process overdue reminders
    for (const task of overdue) {
      await this.sendReminder(task, 'overdue');
    }

    this.log('Task Reminder Agent completed');
    return this.getResults();
  }

  /**
   * Get summary of pending reminders (for dashboard preview)
   */
  getTaskSummary(): {
    upcoming: number;
    dueToday: number;
    overdue: number;
    tasks: TaskData[];
  } {
    const { upcoming, dueToday, overdue } = this.findTasksNeedingReminders();
    return {
      upcoming: upcoming.length,
      dueToday: dueToday.length,
      overdue: overdue.length,
      tasks: [...overdue, ...dueToday, ...upcoming],
    };
  }
}

/**
 * Create default configuration for Task Reminder Agent
 */
export function createDefaultTaskReminderConfig(churchName: string): TaskReminderConfig {
  return {
    id: 'task-reminder-agent',
    name: 'Task Reminders',
    description: 'Automatically sends reminders for upcoming and overdue tasks',
    category: 'operational',
    status: 'active',
    enabled: true,
    settings: {
      remindDaysBefore: 1,
      remindOnDueDate: true,
      remindWhenOverdue: true,
      overdueReminderFrequency: 'daily',
      sendEmail: true,
      sendSMS: false,
      onlyHighPriority: false,
      excludeCategories: [],
      churchName,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
