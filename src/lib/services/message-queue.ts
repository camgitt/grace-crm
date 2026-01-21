/**
 * Message Queue Service
 *
 * Manages the queue of AI-generated messages pending staff review.
 * Provides CRUD operations and filtering for the review workflow.
 */

import type { PendingMessage, ReviewQueueStats, ReviewStatus } from '../agents/types';
import { emailService } from './email';
import { smsService } from './sms';

// In-memory queue (in production, this would be backed by a database)
let messageQueue: PendingMessage[] = [];

// Generate unique IDs
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add a message to the review queue
 */
export function queueMessage(
  message: Omit<PendingMessage, 'id' | 'status' | 'createdAt'>
): PendingMessage {
  const pendingMessage: PendingMessage = {
    ...message,
    id: generateId(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  messageQueue.unshift(pendingMessage);
  console.log(`[MessageQueue] Queued message for ${message.recipientName} (${message.messageType})`);

  return pendingMessage;
}

/**
 * Get all pending messages
 */
export function getPendingMessages(): PendingMessage[] {
  return messageQueue.filter((m) => m.status === 'pending');
}

/**
 * Get messages by status
 */
export function getMessagesByStatus(status: ReviewStatus): PendingMessage[] {
  return messageQueue.filter((m) => m.status === status);
}

/**
 * Get a single message by ID
 */
export function getMessage(id: string): PendingMessage | undefined {
  return messageQueue.find((m) => m.id === id);
}

/**
 * Get queue statistics
 */
export function getQueueStats(): ReviewQueueStats {
  const today = new Date().toISOString().split('T')[0];

  const todayMessages = messageQueue.filter(
    (m) => m.reviewedAt?.startsWith(today)
  );

  return {
    pending: messageQueue.filter((m) => m.status === 'pending').length,
    approvedToday: todayMessages.filter((m) => m.status === 'approved').length,
    rejectedToday: todayMessages.filter((m) => m.status === 'rejected').length,
    editedToday: todayMessages.filter((m) => m.status === 'edited').length,
  };
}

/**
 * Approve a message and send it
 */
export async function approveMessage(
  id: string,
  reviewedBy: string
): Promise<{ success: boolean; error?: string }> {
  const message = messageQueue.find((m) => m.id === id);
  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  if (message.status !== 'pending') {
    return { success: false, error: 'Message already processed' };
  }

  // Send the message
  try {
    if (message.channel === 'email' && message.recipientEmail) {
      const result = await emailService.send({
        to: { email: message.recipientEmail, name: message.recipientName },
        subject: message.subject || 'Message from Grace Church',
        html: formatEmailHtml(message.messageBody),
      });

      if (!result.success) {
        message.error = result.error;
        return { success: false, error: result.error };
      }
    } else if (message.channel === 'sms' && message.recipientPhone) {
      const result = await smsService.send({
        to: message.recipientPhone,
        message: message.messageBody,
      });

      if (!result.success) {
        message.error = result.error;
        return { success: false, error: result.error };
      }
    } else {
      return { success: false, error: 'No valid contact method' };
    }

    // Mark as approved
    message.status = 'approved';
    message.reviewedAt = new Date().toISOString();
    message.reviewedBy = reviewedBy;

    console.log(`[MessageQueue] Approved and sent message ${id} to ${message.recipientName}`);
    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send message';
    message.error = error;
    return { success: false, error };
  }
}

/**
 * Reject a message
 */
export function rejectMessage(
  id: string,
  reviewedBy: string,
  reason?: string
): { success: boolean; error?: string } {
  const message = messageQueue.find((m) => m.id === id);
  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  if (message.status !== 'pending') {
    return { success: false, error: 'Message already processed' };
  }

  message.status = 'rejected';
  message.reviewedAt = new Date().toISOString();
  message.reviewedBy = reviewedBy;
  if (reason) {
    message.error = `Rejected: ${reason}`;
  }

  console.log(`[MessageQueue] Rejected message ${id}`);
  return { success: true };
}

/**
 * Edit a message and optionally send it
 */
export async function editMessage(
  id: string,
  editedMessage: string,
  reviewedBy: string,
  sendNow: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const message = messageQueue.find((m) => m.id === id);
  if (!message) {
    return { success: false, error: 'Message not found' };
  }

  if (message.status !== 'pending') {
    return { success: false, error: 'Message already processed' };
  }

  // Store original message if not already stored
  if (!message.originalMessage) {
    message.originalMessage = message.messageBody;
  }

  message.messageBody = editedMessage;
  message.status = 'edited';
  message.reviewedAt = new Date().toISOString();
  message.reviewedBy = reviewedBy;

  if (sendNow) {
    try {
      if (message.channel === 'email' && message.recipientEmail) {
        const result = await emailService.send({
          to: { email: message.recipientEmail, name: message.recipientName },
          subject: message.subject || 'Message from Grace Church',
          html: formatEmailHtml(editedMessage),
        });

        if (!result.success) {
          message.error = result.error;
          return { success: false, error: result.error };
        }
      } else if (message.channel === 'sms' && message.recipientPhone) {
        const result = await smsService.send({
          to: message.recipientPhone,
          message: editedMessage,
        });

        if (!result.success) {
          message.error = result.error;
          return { success: false, error: result.error };
        }
      }

      console.log(`[MessageQueue] Edited and sent message ${id} to ${message.recipientName}`);
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to send message';
      message.error = error;
      return { success: false, error };
    }
  }

  return { success: true };
}

/**
 * Bulk approve messages
 */
export async function bulkApprove(
  ids: string[],
  reviewedBy: string
): Promise<{ approved: number; failed: number; errors: string[] }> {
  let approved = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const id of ids) {
    const result = await approveMessage(id, reviewedBy);
    if (result.success) {
      approved++;
    } else {
      failed++;
      if (result.error) {
        errors.push(`${id}: ${result.error}`);
      }
    }
  }

  return { approved, failed, errors };
}

/**
 * Bulk reject messages
 */
export function bulkReject(
  ids: string[],
  reviewedBy: string,
  reason?: string
): { rejected: number; failed: number } {
  let rejected = 0;
  let failed = 0;

  for (const id of ids) {
    const result = rejectMessage(id, reviewedBy, reason);
    if (result.success) {
      rejected++;
    } else {
      failed++;
    }
  }

  return { rejected, failed };
}

/**
 * Get messages filtered by various criteria
 */
export function filterMessages(options: {
  status?: ReviewStatus;
  agentId?: string;
  messageType?: string;
  channel?: 'email' | 'sms';
  isAIGenerated?: boolean;
  search?: string;
}): PendingMessage[] {
  let filtered = [...messageQueue];

  if (options.status) {
    filtered = filtered.filter((m) => m.status === options.status);
  }

  if (options.agentId) {
    filtered = filtered.filter((m) => m.agentId === options.agentId);
  }

  if (options.messageType) {
    filtered = filtered.filter((m) => m.messageType === options.messageType);
  }

  if (options.channel) {
    filtered = filtered.filter((m) => m.channel === options.channel);
  }

  if (options.isAIGenerated !== undefined) {
    filtered = filtered.filter((m) => m.isAIGenerated === options.isAIGenerated);
  }

  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.recipientName.toLowerCase().includes(searchLower) ||
        m.messageBody.toLowerCase().includes(searchLower) ||
        m.subject?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Clear old processed messages (cleanup)
 */
export function clearOldMessages(daysToKeep: number = 30): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  const cutoffStr = cutoff.toISOString();

  const originalLength = messageQueue.length;
  messageQueue = messageQueue.filter(
    (m) => m.status === 'pending' || m.createdAt > cutoffStr
  );

  const removed = originalLength - messageQueue.length;
  if (removed > 0) {
    console.log(`[MessageQueue] Cleared ${removed} old messages`);
  }

  return removed;
}

/**
 * Format message body as HTML for email
 */
function formatEmailHtml(body: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p>${body.replace(/\n/g, '<br>')}</p>
    </div>
  `;
}

/**
 * Export for testing/debugging
 */
export function getQueueLength(): number {
  return messageQueue.length;
}

export function clearQueue(): void {
  messageQueue = [];
}
