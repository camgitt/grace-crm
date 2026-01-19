/**
 * Grace CRM Agent System
 *
 * Exports all agent-related types, classes, and utilities.
 */

// Types
export * from './types';

// Base agent
export { BaseAgent } from './BaseAgent';

// Specific agents
export {
  LifeEventAgent,
  createDefaultLifeEventConfig,
} from './LifeEventAgent';

export {
  DonationProcessingAgent,
  createDefaultDonationConfig,
} from './DonationProcessingAgent';

export {
  NewMemberAgent,
  createDefaultNewMemberConfig,
} from './NewMemberAgent';

export {
  DayPlannerAgent,
  createDefaultDayPlannerConfig,
  type DayPlannerConfig,
  type DailyDigest,
  type TaskItem,
  type ContactItem,
  type MessageItem,
  type CelebrationItem,
} from './DayPlannerAgent';
