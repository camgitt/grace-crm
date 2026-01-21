/**
 * AI Service - Frontend client for Gemini API integration
 *
 * Provides AI-powered message generation for church CRM communications.
 * All prompts are carefully crafted for warmth, authenticity, and appropriate tone.
 */

export interface AIGenerateOptions {
  prompt: string;
  context?: string;
  maxTokens?: number;
}

export interface AIGenerateResult {
  success: boolean;
  text?: string;
  error?: string;
  model?: string;
}

// Person context for personalized messages
export interface PersonContext {
  firstName: string;
  lastName?: string;
  memberSince?: string;
  interests?: string[];
  recentAttendance?: number; // weeks
  givingHistory?: 'first-time' | 'regular' | 'generous';
  familyMembers?: string[];
  smallGroup?: string;
  volunteerRoles?: string[];
}

const API_ENDPOINT = '/api/ai/generate';

// System prompt that sets the tone for all church communications
const CHURCH_COMMUNICATION_SYSTEM = `You are a warm, authentic communication assistant for a church.
Your writing style is:
- Genuine and heartfelt, never formulaic or corporate
- Warm but not overly effusive or sappy
- Inclusive and welcoming to all backgrounds
- Respectful of faith without being preachy or using heavy religious jargon
- Personal and specific, not generic
- Concise and scannable for mobile reading

AVOID:
- Clichés like "blessed beyond measure", "fellowship", "the Lord laid on my heart"
- Overly formal language or corporate speak
- Assuming everyone's faith level or church background
- Generic phrases that could apply to anyone
- Excessive exclamation marks or emojis`;

/**
 * Generate text using the Gemini AI model
 */
export async function generateAIText(options: AIGenerateOptions): Promise<AIGenerateResult> {
  const { prompt, context, maxTokens } = options;

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${CHURCH_COMMUNICATION_SYSTEM}\n\n${prompt}`,
        context,
        maxTokens,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Request failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      text: data.text,
      model: data.model,
    };
  } catch (error) {
    console.error('AI service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// WELCOME & ONBOARDING MESSAGES
// ============================================

/**
 * Generate a personalized welcome message for a new member/visitor
 */
export async function generateWelcomeMessage(
  firstName: string,
  churchName: string,
  options?: {
    interests?: string[];
    visitDate?: string;
    howTheyFoundUs?: string;
    isFirstVisit?: boolean;
    pastorName?: string;
  }
): Promise<AIGenerateResult> {
  const context: string[] = [];

  if (options?.interests?.length) {
    context.push(`They mentioned interest in: ${options.interests.join(', ')}`);
  }
  if (options?.visitDate) {
    context.push(`They visited on ${options.visitDate}`);
  }
  if (options?.howTheyFoundUs) {
    context.push(`They found us through: ${options.howTheyFoundUs}`);
  }

  const contextStr = context.length > 0 ? `\nContext: ${context.join('. ')}.` : '';

  return generateAIText({
    prompt: `Write a warm welcome message for ${firstName} who ${options?.isFirstVisit ? 'just visited' : 'joined'} ${churchName}.
${contextStr}

Requirements:
- 2-3 short sentences (under 80 words)
- Make them feel genuinely noticed and valued
- Reference something specific about them if context is available
- Include a soft invitation to connect further (don't push)
- Sign off from ${options?.pastorName || 'the team'} if appropriate

Example tone: "Hey ${firstName}! It was great meeting you on Sunday..." not "Dear ${firstName}, On behalf of all of us at..."`,
    maxTokens: 200,
  });
}

/**
 * Generate a drip campaign message (for automated follow-up sequences)
 */
export async function generateDripMessage(
  firstName: string,
  churchName: string,
  dayNumber: number,
  messageType: 'day1' | 'day3' | 'day7' | 'day14' | 'day30',
  personContext?: Partial<PersonContext>
): Promise<AIGenerateResult> {
  const messageGoals: Record<string, string> = {
    day1: 'Thank them for visiting and share one helpful next step',
    day3: 'Check in and invite them to a specific upcoming event or group',
    day7: 'Share a resource (podcast, devotional, YouTube channel) they might enjoy',
    day14: 'Invite them to connect with a small group or volunteer opportunity',
    day30: 'Celebrate their journey and offer a personal connection (coffee with a pastor)',
  };

  const contextDetails = [];
  if (personContext?.interests?.length) {
    contextDetails.push(`Interests: ${personContext.interests.join(', ')}`);
  }
  if (personContext?.smallGroup) {
    contextDetails.push(`Attended: ${personContext.smallGroup}`);
  }

  return generateAIText({
    prompt: `Write a ${messageType} follow-up message for ${firstName} at ${churchName}.

Day ${dayNumber} goal: ${messageGoals[messageType]}
${contextDetails.length > 0 ? `Their context: ${contextDetails.join('. ')}` : ''}

Requirements:
- Brief (60-80 words max for email, 30 words for SMS)
- Feels like it's from a real person, not automated
- One clear call-to-action
- Reference time naturally ("It's been about a week since...")
- Don't repeat what previous messages might have said`,
    maxTokens: 200,
  });
}

// ============================================
// GIVING & DONATION MESSAGES
// ============================================

/**
 * Generate a personalized thank-you message for a donation
 */
export async function generateDonationThankYou(
  firstName: string,
  amount: number,
  fund: string,
  churchName: string,
  options?: {
    isFirstTime?: boolean;
    isRecurring?: boolean;
    totalGivenThisYear?: number;
    recentProjectNews?: string;
  }
): Promise<AIGenerateResult> {
  const context: string[] = [];

  if (options?.isFirstTime) {
    context.push('This is their first gift - make it memorable!');
  }
  if (options?.isRecurring) {
    context.push('This is part of their recurring giving - acknowledge their consistency');
  }
  if (options?.totalGivenThisYear && options.totalGivenThisYear > amount * 2) {
    context.push(`They've given $${options.totalGivenThisYear.toFixed(0)} this year total`);
  }
  if (options?.recentProjectNews) {
    context.push(`Recent fund update: ${options.recentProjectNews}`);
  }

  const fundDescriptions: Record<string, string> = {
    tithe: 'general operations and ministry',
    offering: 'church programs and outreach',
    missions: 'missionary support and global outreach',
    building: 'facility improvements and expansion',
    benevolence: 'helping families in need',
    youth: 'youth programs and activities',
  };

  return generateAIText({
    prompt: `Write a heartfelt thank-you for ${firstName}'s $${amount.toFixed(2)} gift to the ${fund} fund at ${churchName}.

What this fund supports: ${fundDescriptions[fund.toLowerCase()] || 'church ministry'}
${context.length > 0 ? `Additional context: ${context.join('. ')}` : ''}

Requirements:
- 2-3 sentences (under 70 words)
- Be specific about impact without being manipulative
- Genuine gratitude, not transactional
- ${options?.isFirstTime ? 'Make first-time givers feel the significance of their step' : 'Acknowledge their ongoing faithfulness'}
- Avoid mentioning exact amounts in a way that feels like a receipt`,
    maxTokens: 180,
  });
}

/**
 * Generate a year-end giving summary message
 */
export async function generateYearEndGivingSummary(
  firstName: string,
  churchName: string,
  totalGiven: number,
  impactHighlights: string[]
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Write a year-end thank you for ${firstName} who gave $${totalGiven.toFixed(2)} to ${churchName} this year.

Impact highlights to weave in:
${impactHighlights.map(h => `- ${h}`).join('\n')}

Requirements:
- 3-4 sentences celebrating their generosity
- Connect their giving to real impact (use the highlights)
- Express genuine partnership, not just "thanks for the money"
- End with excitement for the year ahead
- Keep under 100 words`,
    maxTokens: 250,
  });
}

// ============================================
// LIFE EVENT MESSAGES
// ============================================

/**
 * Generate a birthday greeting
 */
export async function generateBirthdayGreeting(
  firstName: string,
  churchName: string,
  personContext?: Partial<PersonContext>
): Promise<AIGenerateResult> {
  const contextDetails = [];
  if (personContext?.memberSince) {
    const years = new Date().getFullYear() - new Date(personContext.memberSince).getFullYear();
    if (years > 0) contextDetails.push(`Been part of the church for ${years} year${years > 1 ? 's' : ''}`);
  }
  if (personContext?.volunteerRoles?.length) {
    contextDetails.push(`Serves as: ${personContext.volunteerRoles.join(', ')}`);
  }
  if (personContext?.smallGroup) {
    contextDetails.push(`Part of ${personContext.smallGroup}`);
  }

  return generateAIText({
    prompt: `Write a birthday message for ${firstName} from ${churchName}.

${contextDetails.length > 0 ? `What we know about them: ${contextDetails.join('. ')}` : ''}

Requirements:
- 2-3 short sentences (under 50 words)
- Warm and personal, not generic "Happy Birthday!"
- Include a thoughtful wish or blessing that feels genuine
- ${contextDetails.length > 0 ? 'Reference something specific about their involvement if appropriate' : 'Keep it simple but heartfelt'}
- Avoid churchy clichés like "blessed beyond measure"

Good example: "Happy birthday, ${firstName}! We're so glad you're part of our community. Hope your day is filled with good food, great people, and a few surprises."`,
    maxTokens: 150,
  });
}

/**
 * Generate a membership anniversary message
 */
export async function generateAnniversaryGreeting(
  firstName: string,
  churchName: string,
  years: number,
  highlights?: string[]
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Write a ${years}-year membership anniversary message for ${firstName} at ${churchName}.

${highlights?.length ? `Their highlights over the years: ${highlights.join(', ')}` : ''}

Requirements:
- 3-4 sentences celebrating their journey
- Reference the milestone (${years} years) naturally
- ${highlights?.length ? 'Weave in their specific contributions' : 'Celebrate their faithful presence'}
- Express genuine appreciation for their part in the community
- Under 80 words`,
    maxTokens: 200,
  });
}

/**
 * Generate a condolence/sympathy message
 */
export async function generateCondolenceMessage(
  firstName: string,
  churchName: string,
  situation: 'death' | 'illness' | 'loss',
  details?: string
): Promise<AIGenerateResult> {
  const situationContext = {
    death: 'They are grieving the loss of a loved one',
    illness: 'They or a family member is dealing with serious illness',
    loss: 'They are going through a difficult loss or hardship',
  };

  return generateAIText({
    prompt: `Write a brief, heartfelt message of support for ${firstName} from ${churchName}.

Situation: ${situationContext[situation]}
${details ? `Additional context: ${details}` : ''}

Requirements:
- 2-3 sentences of genuine comfort
- Acknowledge their pain without minimizing it
- Offer presence/support without being intrusive
- Avoid platitudes like "everything happens for a reason"
- Keep under 60 words
- Simple and sincere, not flowery

Good example: "I'm so sorry for your loss. There are no words that feel adequate right now. Please know we're here for you - whether that's a meal, a listening ear, or just sitting together."`,
    maxTokens: 160,
  });
}

// ============================================
// ENGAGEMENT & RE-ENGAGEMENT
// ============================================

/**
 * Generate a gentle check-in for someone who hasn't attended recently
 */
export async function generateReengagementMessage(
  firstName: string,
  churchName: string,
  weeksSinceLastVisit: number,
  personContext?: Partial<PersonContext>
): Promise<AIGenerateResult> {
  const contextDetails = [];
  if (personContext?.smallGroup) {
    contextDetails.push(`Was part of ${personContext.smallGroup}`);
  }
  if (personContext?.volunteerRoles?.length) {
    contextDetails.push(`Used to volunteer as: ${personContext.volunteerRoles.join(', ')}`);
  }

  return generateAIText({
    prompt: `Write a genuine check-in message for ${firstName} who hasn't been to ${churchName} in about ${weeksSinceLastVisit} weeks.

${contextDetails.length > 0 ? `Their previous involvement: ${contextDetails.join('. ')}` : ''}

Requirements:
- Express genuine care, not guilt or obligation
- Don't assume why they've been away
- Make it easy to respond (low pressure)
- 2-3 sentences, under 60 words
- Focus on them as a person, not on attendance

Good tone: "Hey ${firstName}, just wanted to check in and see how you're doing. Hope all is well with you. Would love to catch up sometime if you're up for it."
Bad tone: "We've missed you at church! You should really come back because..."`,
    maxTokens: 160,
  });
}

/**
 * Generate an event invitation message
 */
export async function generateEventInvitation(
  firstName: string,
  eventName: string,
  eventDate: string,
  eventDescription: string,
  churchName: string,
  personContext?: Partial<PersonContext>
): Promise<AIGenerateResult> {
  const whyThisEvent = personContext?.interests?.length
    ? `This might interest them because they like: ${personContext.interests.join(', ')}`
    : '';

  return generateAIText({
    prompt: `Write a personal invitation for ${firstName} to "${eventName}" at ${churchName}.

Event: ${eventName}
Date: ${eventDate}
Description: ${eventDescription}
${whyThisEvent}

Requirements:
- Brief and inviting (3-4 sentences, under 80 words)
- Make it sound fun/valuable, not obligatory
- ${personContext?.interests?.length ? 'Connect the event to their interests' : 'Highlight what makes this event special'}
- Include clear next step (RSVP, just show up, etc.)
- Personal tone, not announcement-style`,
    maxTokens: 200,
  });
}

/**
 * Generate a volunteer appreciation message
 */
export async function generateVolunteerAppreciation(
  firstName: string,
  role: string,
  churchName: string,
  specificImpact?: string
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Write a thank-you message for ${firstName} who volunteers as ${role} at ${churchName}.

${specificImpact ? `Specific impact to highlight: ${specificImpact}` : ''}

Requirements:
- Genuine appreciation, not generic "thanks for volunteering"
- Be specific about their role and impact
- 2-3 sentences, under 70 words
- Make them feel truly valued and seen
- Avoid making it feel like "employee of the month"`,
    maxTokens: 180,
  });
}

// ============================================
// STAFF TOOLS
// ============================================

/**
 * Generate follow-up talking points for a visitor call
 */
export async function generateFollowUpTalkingPoints(
  visitorName: string,
  visitDate: string,
  notes?: string,
  interests?: string[]
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Generate 3-4 brief talking points for a follow-up call with ${visitorName} who visited on ${visitDate}.

${notes ? `Notes from their visit: ${notes}` : 'No specific notes available.'}
${interests?.length ? `Expressed interest in: ${interests.join(', ')}` : ''}

Requirements:
- Practical, conversational reminders
- Focus on: making them feel remembered, asking about their experience, naturally inviting them back
- Include a question or two they might appreciate being asked
- Format as a bulleted list
- Keep each point brief (1-2 sentences)`,
    maxTokens: 350,
  });
}

/**
 * Summarize prayer requests for a weekly digest
 */
export async function summarizePrayerRequests(
  requests: Array<{ name: string; request: string; date?: string }>
): Promise<AIGenerateResult> {
  if (requests.length === 0) {
    return { success: true, text: 'No prayer requests this week.' };
  }

  const requestList = requests
    .map((r) => `- ${r.name}: ${r.request}${r.date ? ` (${r.date})` : ''}`)
    .join('\n');

  return generateAIText({
    prompt: `Create a prayer digest from these requests for church staff:

${requestList}

Requirements:
- Group similar requests (health, family, work, guidance, etc.)
- Keep names but summarize requests briefly
- Note any urgent situations
- Add a brief note on how to pray for each category
- Format with clear sections
- Total length: 150-200 words`,
    context: 'This is for internal church staff to pray over during the week.',
    maxTokens: 450,
  });
}

/**
 * Generate small group discussion questions
 */
export async function generateDiscussionQuestions(
  topic: string,
  numberOfQuestions: number = 3,
  context?: { biblePassage?: string; audienceType?: 'new believers' | 'mature' | 'mixed' }
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Generate ${numberOfQuestions} thoughtful small group discussion questions about: "${topic}"

${context?.biblePassage ? `Related passage: ${context.biblePassage}` : ''}
${context?.audienceType ? `Audience: ${context.audienceType} believers` : ''}

Requirements:
- Encourage personal reflection and honest sharing
- Open-ended (not yes/no answers)
- Progress from accessible to deeper
- ${context?.audienceType === 'new believers' ? 'Use accessible language, avoid church jargon' : 'Can explore theological depth'}
- Include one practical application question
- Format as a numbered list`,
    maxTokens: 450,
  });
}

/**
 * Generate a daily staff briefing summary
 */
export async function generateDailyBriefing(
  churchName: string,
  data: {
    birthdays: Array<{ name: string }>;
    followUps: Array<{ name: string; reason: string }>;
    events: Array<{ name: string; time: string }>;
    prayerRequests: number;
    newMembers?: Array<{ name: string }>;
  }
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Generate a brief, friendly daily briefing for ${churchName} staff.

Today's data:
- Birthdays: ${data.birthdays.length > 0 ? data.birthdays.map(b => b.name).join(', ') : 'None'}
- People to follow up with: ${data.followUps.length > 0 ? data.followUps.map(f => `${f.name} (${f.reason})`).join(', ') : 'None'}
- Events today: ${data.events.length > 0 ? data.events.map(e => `${e.name} at ${e.time}`).join(', ') : 'None'}
- Open prayer requests: ${data.prayerRequests}
${data.newMembers?.length ? `- New members this week: ${data.newMembers.map(m => m.name).join(', ')}` : ''}

Requirements:
- Conversational, scannable format
- Highlight priorities for the day
- Brief encouragement or thought for the day
- Keep under 150 words
- Use clear sections with headers`,
    maxTokens: 350,
  });
}

// ============================================
// SEASONAL & SPECIAL OCCASIONS
// ============================================

/**
 * Generate a seasonal greeting (Christmas, Easter, etc.)
 */
export async function generateSeasonalGreeting(
  firstName: string,
  churchName: string,
  occasion: 'christmas' | 'easter' | 'thanksgiving' | 'new-year' | 'mothers-day' | 'fathers-day',
  personContext?: Partial<PersonContext>
): Promise<AIGenerateResult> {
  const occasionDetails: Record<string, { name: string; tone: string }> = {
    christmas: { name: 'Christmas', tone: 'joy, peace, and celebration' },
    easter: { name: 'Easter', tone: 'hope, renewal, and celebration' },
    thanksgiving: { name: 'Thanksgiving', tone: 'gratitude and warmth' },
    'new-year': { name: 'New Year', tone: 'hope, fresh starts, and excitement' },
    'mothers-day': { name: "Mother's Day", tone: 'appreciation and love' },
    'fathers-day': { name: "Father's Day", tone: 'appreciation and gratitude' },
  };

  const { name: occasionName, tone } = occasionDetails[occasion];

  return generateAIText({
    prompt: `Write a ${occasionName} greeting for ${firstName} from ${churchName}.

Tone: ${tone}
${personContext?.familyMembers?.length ? `Family context: They have family members named ${personContext.familyMembers.join(', ')}` : ''}

Requirements:
- 2-3 sentences, under 60 words
- Genuine and warm, not generic
- Appropriate religious reference if natural, but not preachy
- Personal touch if possible
- Avoid overused phrases for this holiday`,
    maxTokens: 160,
  });
}
