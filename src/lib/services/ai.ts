/**
 * AI Service - Frontend client for Gemini API integration
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

const API_ENDPOINT = '/api/ai/generate';

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
        prompt,
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
// Pre-built prompts for common church CRM tasks
// ============================================

/**
 * Generate a personalized welcome message for a new member
 */
export async function generateWelcomeMessage(
  firstName: string,
  churchName: string,
  interests?: string[]
): Promise<AIGenerateResult> {
  const interestContext = interests?.length
    ? `They have expressed interest in: ${interests.join(', ')}.`
    : '';

  return generateAIText({
    prompt: `Write a warm, personal welcome message for ${firstName} who just joined ${churchName}.
${interestContext}

Guidelines:
- Start with their name and express genuine joy about their visit
- Keep it conversational and warm, like a friend welcoming them
- Mention one specific thing they can look forward to (community, worship, etc.)
- End with an invitation to connect (coffee, small group, or just reach out)
- Keep it under 100 words
- Avoid churchy jargon - be accessible and genuine
- Sign off warmly (e.g., "Looking forward to seeing you!" or "Can't wait to get to know you better!")`,
    maxTokens: 256,
  });
}

/**
 * Generate a personalized thank-you message for a donation
 */
export async function generateDonationThankYou(
  firstName: string,
  amount: number,
  fund: string,
  churchName: string,
  isFirstTime: boolean
): Promise<AIGenerateResult> {
  const firstTimeNote = isFirstTime
    ? 'This is their FIRST gift to the church - make this extra special and acknowledging!'
    : 'They are a returning giver - acknowledge their ongoing faithfulness.';

  const fundImpact: Record<string, string> = {
    tithe: 'supporting the daily ministry and operations of the church',
    missions: 'spreading hope to communities around the world',
    building: 'creating welcoming spaces for worship and community',
    benevolence: 'helping neighbors in need in our community',
    offering: 'furthering the mission and vision of our church',
  };

  const impact = fundImpact[fund.toLowerCase()] || 'making a real difference in our community';

  return generateAIText({
    prompt: `Write a heartfelt thank-you message for ${firstName} who donated $${amount.toFixed(2)} to the ${fund} fund at ${churchName}.
${firstTimeNote}

Guidelines:
- Express genuine, specific gratitude (not generic "thanks for your gift")
- Briefly mention how their gift helps: ${impact}
- Make them feel like a valued partner, not just a donor
- Keep it under 80 words
- Be warm and personal, not formal or transactional
- Don't be preachy or mention "sowing seeds" or "blessings returned"
- End with warmth (e.g., "Grateful for you!" or "You're making a difference!")`,
    maxTokens: 200,
  });
}

/**
 * Generate a birthday greeting
 */
export async function generateBirthdayGreeting(
  firstName: string,
  churchName: string,
  age?: number
): Promise<AIGenerateResult> {
  const ageContext = age ? `They are turning ${age} today.` : '';

  return generateAIText({
    prompt: `Write a warm, personal birthday greeting for ${firstName} from your church family at ${churchName}.
${ageContext}

Guidelines:
- Start with "Happy Birthday" and their name
- Express that they are thought of and valued
- Include a brief, sincere blessing or wish for the year ahead
- Keep it under 50 words - quality over quantity
- Be genuine and warm, not generic
- Optional: mention something about celebrating them
- Avoid clichés like "may all your dreams come true"
- End on an uplifting note`,
    maxTokens: 128,
  });
}

/**
 * Generate follow-up talking points for a visitor
 */
export async function generateFollowUpTalkingPoints(
  visitorName: string,
  visitDate: string,
  notes?: string
): Promise<AIGenerateResult> {
  const notesContext = notes ? `Notes from their visit: ${notes}` : '';

  return generateAIText({
    prompt: `Generate 3-4 brief talking points for a follow-up call with ${visitorName} who visited on ${visitDate}.
${notesContext}
Focus on: making them feel remembered, asking about their experience, and naturally inviting them back.
Format as a bulleted list.`,
    maxTokens: 300,
  });
}

/**
 * Summarize prayer requests for a weekly digest
 */
export async function summarizePrayerRequests(
  requests: Array<{ name: string; request: string }>
): Promise<AIGenerateResult> {
  if (requests.length === 0) {
    return { success: true, text: 'No prayer requests this week.' };
  }

  const requestList = requests
    .map((r) => `- ${r.name}: ${r.request}`)
    .join('\n');

  return generateAIText({
    prompt: `Summarize these prayer requests into a concise weekly prayer digest for church staff:

${requestList}

Group similar requests together. Keep names but summarize the requests briefly.
Format with clear sections if there are different categories (health, family, work, etc.).`,
    context: 'This is for internal church staff to pray over during the week.',
    maxTokens: 500,
  });
}

/**
 * Generate a small group discussion question based on a topic
 */
export async function generateDiscussionQuestions(
  topic: string,
  numberOfQuestions: number = 3
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Generate ${numberOfQuestions} thoughtful small group discussion questions about: "${topic}"

Questions should:
- Encourage personal reflection and sharing
- Be open-ended (not yes/no)
- Progress from easier to deeper
- Be appropriate for a church small group setting

Format as a numbered list.`,
    maxTokens: 400,
  });
}

// ============================================
// Message Classification & Reply Generation
// ============================================

export interface MessageClassification {
  category: 'question' | 'thanks' | 'concern' | 'prayer_request' | 'event_rsvp' | 'unsubscribe' | 'spam' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  summary: string;
  suggestedAction: string;
  confidence: number;
}

/**
 * Classify an incoming message using AI
 */
export async function classifyInboundMessage(
  body: string,
  subject?: string,
  senderName?: string
): Promise<{ success: boolean; classification?: MessageClassification; error?: string }> {
  const prompt = `Classify this incoming message from a church member.

${subject ? `Subject: ${subject}` : ''}
${senderName ? `From: ${senderName}` : ''}
Message: "${body}"

Analyze the message and respond with JSON only:
{
  "category": "question|thanks|concern|prayer_request|event_rsvp|unsubscribe|spam|other",
  "sentiment": "positive|neutral|negative|urgent",
  "summary": "One sentence summary of what they're saying",
  "suggestedAction": "Brief suggested response approach",
  "confidence": 0.0 to 1.0
}

Categories:
- question: Asking for information or help
- thanks: Expressing gratitude
- concern: Expressing worry, complaint, or issue
- prayer_request: Requesting prayer
- event_rsvp: Responding to an event invitation
- unsubscribe: Wanting to stop receiving messages
- spam: Irrelevant or promotional content
- other: Doesn't fit other categories`;

  try {
    const result = await generateAIText({ prompt, maxTokens: 300 });

    if (result.success && result.text) {
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as MessageClassification;
        return { success: true, classification: parsed };
      }
    }

    return { success: false, error: 'Failed to parse classification' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Classification failed',
    };
  }
}

/**
 * Generate a reply draft for an incoming message
 */
export async function generateReplyDraft(
  originalMessage: string,
  category: string,
  personName: string,
  churchName: string,
  additionalContext?: string
): Promise<AIGenerateResult> {
  const categoryGuidelines: Record<string, string> = {
    question: `They're asking a question. Provide a helpful, clear answer. If you don't have enough info, offer to help them find the answer or connect them with someone who can.`,
    thanks: `They're expressing gratitude. Receive it graciously, affirm that they're valued, and perhaps share how their presence/involvement blesses the community.`,
    concern: `They've shared a concern or complaint. Acknowledge their feelings first, thank them for sharing, express that you take it seriously, and offer a next step (call, meeting, or follow-up).`,
    prayer_request: `They've shared a prayer request. Respond with compassion, let them know they're not alone, confirm you'll be praying, and offer any practical support if appropriate.`,
    event_rsvp: `They're responding about an event. Confirm receipt, express excitement about seeing them (or understanding if they can't make it), and share any relevant details.`,
    unsubscribe: `They want to stop receiving messages. Respect their request, apologize for any inconvenience, confirm you'll remove them, and leave the door open warmly.`,
    other: `Respond thoughtfully to their message, acknowledge what they've shared, and offer appropriate next steps.`,
  };

  const guidelines = categoryGuidelines[category] || categoryGuidelines.other;

  return generateAIText({
    prompt: `Write a warm, pastoral reply to this message from ${personName}:

"${originalMessage}"

${additionalContext ? `Context: ${additionalContext}` : ''}

Category: ${category}
${guidelines}

Reply on behalf of ${churchName}. Guidelines:
- Start by addressing them by name
- Keep it under 100 words but make every word count
- Be genuinely warm and personal, not formal or corporate
- Match the tone to the situation (caring for concerns, joyful for celebrations)
- End with a warm sign-off that fits the context
- Don't use religious jargon unless they did
- Be a real person, not a form letter

Write only the message body, no subject line.`,
    maxTokens: 300,
  });
}

/**
 * Generate a scheduled message for a specific purpose
 */
export async function generateScheduledMessage(
  personName: string,
  messageType: 'birthday' | 'anniversary' | 'follow_up' | 'welcome' | 'thank_you' | 'check_in' | 'encouragement',
  churchName: string,
  additionalContext?: string
): Promise<AIGenerateResult> {
  const prompts: Record<string, string> = {
    birthday: `Write a warm, personal birthday message for ${personName} from ${churchName}.

Guidelines:
- Start with "Happy Birthday, ${personName}!"
- Express that they're celebrated and valued in the church family
- Include a brief, heartfelt blessing for the year ahead
- Keep it under 60 words - sincere and memorable
- Avoid generic phrases like "may all your wishes come true"
- End warmly`,

    anniversary: `Write a message celebrating ${personName}'s membership anniversary at ${churchName}.
${additionalContext ? `Context: ${additionalContext}` : ''}

Guidelines:
- Acknowledge the milestone with genuine appreciation
- Mention something about their journey/contribution (even generally)
- Express gratitude for their faithfulness and presence
- Keep it under 60 words, heartfelt and personal
- Make them feel valued and seen`,

    follow_up: `Write a friendly follow-up message for ${personName} from ${churchName}.
${additionalContext ? `Context: ${additionalContext}` : 'They visited recently.'}

Guidelines:
- Express that you're thinking of them
- Reference their visit/connection naturally
- Extend a warm, no-pressure invitation to return or connect
- Keep it under 80 words, caring and genuine
- Make it easy to respond (offer specific next steps)`,

    welcome: `Write a warm welcome message for ${personName} who recently joined ${churchName}.

Guidelines:
- Welcome them genuinely to the church family
- Express excitement about getting to know them
- Mention one way they can connect (small group, service, event)
- Keep it under 80 words, friendly and inviting
- Make them feel like they belong already`,

    thank_you: `Write a heartfelt thank you message for ${personName} from ${churchName}.
${additionalContext ? `Context: ${additionalContext}` : ''}

Guidelines:
- Be specific about what you're thanking them for (if context provided)
- Express the impact of their contribution/service/presence
- Keep it under 60 words, genuine and warm
- Avoid being over-the-top; sincere is better than effusive`,

    check_in: `Write a caring check-in message for ${personName} from ${churchName}.
${additionalContext ? `Context: ${additionalContext}` : 'Haven\'t seen them in a while.'}

Guidelines:
- Express that they've been missed and thought of
- Show genuine care without guilt-tripping
- Keep the door open for them to share how they're doing
- Offer support without being pushy
- Keep it under 70 words, warm and gracious`,

    encouragement: `Write an encouraging message for ${personName} from ${churchName}.
${additionalContext ? `Context: ${additionalContext}` : ''}

Guidelines:
- Acknowledge any difficulty they may be facing
- Offer genuine encouragement and hope
- Remind them they're not alone
- Keep it under 70 words, uplifting but not dismissive of struggles
- Be a friend, not preachy`,
  };

  return generateAIText({
    prompt: prompts[messageType] || prompts.follow_up,
    maxTokens: 200,
  });
}

/**
 * Generate talking points for contacting someone
 */
export async function generateContactTalkingPoints(
  personName: string,
  reason: string,
  context?: string
): Promise<AIGenerateResult> {
  return generateAIText({
    prompt: `Generate 3-4 brief talking points for reaching out to ${personName}.

Reason for contact: ${reason}
${context ? `Context: ${context}` : ''}

Format as a bulleted list. Keep each point concise (1-2 sentences).
Focus on being warm, personal, and helpful.`,
    maxTokens: 300,
  });
}
