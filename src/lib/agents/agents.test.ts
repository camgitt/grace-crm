/**
 * Agent Unit Tests
 * Tests for LifeEventAgent, DonationProcessingAgent, and NewMemberAgent
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LifeEventAgent, createDefaultLifeEventConfig } from './LifeEventAgent';
import { DonationProcessingAgent, createDefaultDonationConfig } from './DonationProcessingAgent';
import { NewMemberAgent, createDefaultNewMemberConfig } from './NewMemberAgent';
import type { AgentContext, LifeEventConfig, DonationProcessingConfig, NewMemberConfig } from './types';

// Mock services
vi.mock('../services/email', () => ({
  emailService: {
    send: vi.fn().mockResolvedValue({ success: true, messageId: 'test-123' }),
    sendBirthdayEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-birthday-123' }),
    sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-welcome-123' }),
  },
}));

vi.mock('../services/sms', () => ({
  smsService: {
    send: vi.fn().mockResolvedValue({ success: true, messageId: 'test-sms-123' }),
    sendBirthdaySMS: vi.fn().mockResolvedValue({ success: true, messageId: 'test-birthday-sms-123' }),
    sendWelcomeSMS: vi.fn().mockResolvedValue({ success: true, messageId: 'test-welcome-sms-123' }),
  },
}));

vi.mock('../services/ai', () => ({
  generateWelcomeMessage: vi.fn().mockResolvedValue({ success: true, text: 'Welcome to our church family!' }),
  generateDonationThankYou: vi.fn().mockResolvedValue({ success: true, text: 'Thank you for your generous gift!' }),
  generateBirthdayGreeting: vi.fn().mockResolvedValue({ success: true, text: 'Happy Birthday!' }),
}));

// Test context
const testContext: AgentContext = {
  churchId: 'test-church-id',
  churchName: 'Test Church',
  currentDate: new Date('2026-01-20'),
  dryRun: true, // Always dry run for tests
};

describe('LifeEventAgent', () => {
  let config: LifeEventConfig;

  beforeEach(() => {
    config = createDefaultLifeEventConfig('Test Church');
    vi.clearAllMocks();
  });

  it('should create agent with default config', () => {
    const agent = new LifeEventAgent(config, testContext, []);
    expect(agent).toBeDefined();
  });

  it('should find no events when no people have birthdays today', async () => {
    const people = [
      {
        id: 'person-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        birthDate: '1990-05-15', // Not today
        joinDate: '2020-03-10',
        status: 'active',
      },
    ];

    const agent = new LifeEventAgent(config, testContext, people);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.actionsExecuted).toBe(0);
  });

  it('should find birthday events for today', async () => {
    const people = [
      {
        id: 'person-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        birthDate: '1990-01-20', // Same month/day as test date
        joinDate: '2020-03-10',
        status: 'active',
      },
    ];

    const agent = new LifeEventAgent(config, testContext, people);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    // In dry run mode, actions are recorded
    expect(result.logs.some(log => log.message.includes('birthday'))).toBe(true);
  });

  it('should skip inactive members', async () => {
    const people = [
      {
        id: 'person-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        birthDate: '1990-01-20', // Same month/day
        joinDate: '2020-03-10',
        status: 'inactive', // Should be skipped
      },
    ];

    const agent = new LifeEventAgent(config, testContext, people);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.actionsExecuted).toBe(0);
  });

  it('should find membership anniversary events', async () => {
    const people = [
      {
        id: 'person-1',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+15551234567',
        birthDate: '1985-05-15',
        joinDate: '2024-01-20', // 2 years ago on same day
        status: 'active',
      },
    ];

    const agent = new LifeEventAgent(config, testContext, people);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log => log.message.includes('membership_anniversary'))).toBe(true);
  });

  it('should get upcoming events', () => {
    const people = [
      {
        id: 'person-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+15551234567',
        birthDate: '1990-01-22', // 2 days from test date
        joinDate: '2020-03-10',
        status: 'active',
      },
    ];

    const agent = new LifeEventAgent(config, testContext, people);
    const upcoming = agent.getUpcomingEvents(7);

    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming[0].type).toBe('birthday');
    expect(upcoming[0].personName).toBe('John Doe');
  });
});

describe('DonationProcessingAgent', () => {
  let config: DonationProcessingConfig;

  const testPeople = [
    {
      id: 'person-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+15551234567',
    },
    {
      id: 'person-2',
      firstName: 'Generous',
      lastName: 'Donor',
      email: 'generous@example.com',
      phone: '+15559876543',
    },
  ];

  beforeEach(() => {
    config = createDefaultDonationConfig('Test Church', '12-3456789');
    vi.clearAllMocks();
  });

  it('should create agent with default config', () => {
    const agent = new DonationProcessingAgent(config, testContext, [], testPeople, []);
    expect(agent).toBeDefined();
  });

  it('should process donation and send receipt (dry run)', async () => {
    const donations = [
      {
        id: 'donation-1',
        personId: 'person-1',
        amount: 100,
        fund: 'general',
        method: 'card',
        date: '2026-01-20',
        isRecurring: false,
      },
    ];

    const agent = new DonationProcessingAgent(config, testContext, donations, testPeople, ['person-1']);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log => log.message.includes('donation') || log.message.includes('Donation'))).toBe(true);
  });

  it('should handle first-time givers', async () => {
    const donations = [
      {
        id: 'donation-1',
        personId: 'person-1',
        amount: 50,
        fund: 'general',
        method: 'card',
        date: '2026-01-20',
        isRecurring: false,
      },
    ];

    // Empty existingDonorIds means this is a first-time giver
    const agent = new DonationProcessingAgent(config, testContext, donations, testPeople, []);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log => log.message.toLowerCase().includes('first'))).toBe(true);
  });

  it('should alert on large gifts', async () => {
    const donations = [
      {
        id: 'donation-1',
        personId: 'person-2',
        amount: 5000, // Above default threshold
        fund: 'general',
        method: 'card',
        date: '2026-01-20',
        isRecurring: false,
      },
    ];

    const agent = new DonationProcessingAgent(config, testContext, donations, testPeople, ['person-2']);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log => log.message.toLowerCase().includes('large'))).toBe(true);
  });
});

describe('NewMemberAgent', () => {
  let config: NewMemberConfig;

  const testPeople = [
    {
      id: 'person-1',
      firstName: 'New',
      lastName: 'Member',
      email: 'newmember@example.com',
      phone: '+15551234567',
      status: 'member',
      joinDate: '2026-01-20',
    },
    {
      id: 'person-2',
      firstName: 'Drip',
      lastName: 'Campaign',
      email: 'drip@example.com',
      phone: '+15559876543',
      status: 'member',
      joinDate: '2026-01-17', // 3 days ago - should trigger day 3 drip
    },
  ];

  beforeEach(() => {
    config = createDefaultNewMemberConfig('Test Church', 'Pastor Smith');
    vi.clearAllMocks();
  });

  it('should create agent with default config', () => {
    const agent = new NewMemberAgent(config, testContext, []);
    expect(agent).toBeDefined();
  });

  it('should process drip campaign for existing members', async () => {
    const agent = new NewMemberAgent(config, testContext, testPeople);
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log =>
      log.message.includes('New Member') ||
      log.message.includes('drip') ||
      log.message.includes('Drip')
    )).toBe(true);
  });

  it('should handle new member event directly', async () => {
    const agent = new NewMemberAgent(config, testContext, testPeople);

    const newMemberEvent = {
      personId: 'person-1',
      personName: 'Jane Welcome',
      email: 'jane@example.com',
      phone: '+15551234567',
      previousStatus: 'visitor',
      newStatus: 'member',
      joinDate: '2026-01-20',
    };

    const success = await agent.handleNewMember(newMemberEvent);
    // Call execute() to get the results (public method)
    const result = await agent.execute();

    expect(success).toBe(true);
    expect(result.logs.some(log =>
      log.message.includes('Processing new member') ||
      log.message.includes('Welcome') ||
      log.message.includes('welcome')
    )).toBe(true);
  });

  it('should create follow-up task when enabled', async () => {
    config.settings.assignFollowUpTask = true;

    const mockCreateTask = vi.fn().mockResolvedValue(undefined);
    const agent = new NewMemberAgent(config, testContext, testPeople, {
      onCreateTask: mockCreateTask,
    });

    const newMemberEvent = {
      personId: 'person-1',
      personName: 'Follow Up Person',
      email: 'followup@example.com',
      phone: '+15551234567',
      previousStatus: 'visitor',
      newStatus: 'member',
      joinDate: '2026-01-20',
    };

    await agent.handleNewMember(newMemberEvent);
    // Call execute() to get the results (public method)
    const result = await agent.execute();

    expect(result.success).toBe(true);
    expect(result.logs.some(log =>
      log.message.toLowerCase().includes('follow') ||
      log.message.includes('task')
    )).toBe(true);
  });

  it('should find new members within timeframe', () => {
    const agent = new NewMemberAgent(config, testContext, testPeople);
    const newMembers = agent.findNewMembers(30);

    expect(newMembers.length).toBe(2);
    expect(newMembers[0].firstName).toBe('New');
  });
});

describe('Agent Default Configs', () => {
  it('should create valid LifeEventConfig', () => {
    const config = createDefaultLifeEventConfig('My Church');
    expect(config.id).toBe('life-event-agent');
    expect(config.settings.churchName).toBe('My Church');
    expect(config.settings.enableBirthdays).toBe(true);
    expect(config.enabled).toBe(true);
  });

  it('should create valid DonationProcessingConfig', () => {
    const config = createDefaultDonationConfig('My Church', '12-3456789');
    expect(config.id).toBe('donation-processing-agent');
    expect(config.settings.churchName).toBe('My Church');
    expect(config.settings.taxId).toBe('12-3456789');
    expect(config.settings.autoSendReceipts).toBe(true);
  });

  it('should create valid NewMemberConfig', () => {
    const config = createDefaultNewMemberConfig('My Church', 'Pastor John');
    expect(config.id).toBe('new-member-agent');
    expect(config.settings.churchName).toBe('My Church');
    expect(config.settings.pastorName).toBe('Pastor John');
    expect(config.settings.enableWelcomeSequence).toBe(true);
  });
});
