/**
 * AI Service - Integrates with Google Gemini API for intelligent agent actions
 */

import type { Person, Giving } from '../types';

// AI Configuration stored in localStorage
const AI_CONFIG_KEY = 'grace-crm-ai-config';

export interface AIConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  enabled: boolean;
}

export interface AIGenerationRequest {
  type: 'birthday_message' | 'donation_thank_you' | 'follow_up' | 'pastoral_care' | 'insights' | 'custom';
  person?: Person;
  context?: Record<string, unknown>;
  customPrompt?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export interface AIInsight {
  type: 'warning' | 'opportunity' | 'celebration' | 'info';
  title: string;
  description: string;
  personId?: string;
  personName?: string;
  actionSuggestion?: string;
}

// Default config
const defaultConfig: AIConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
  enabled: false,
};

// Get AI config from localStorage
export function getAIConfig(): AIConfig {
  try {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Error reading AI config:', e);
  }
  return defaultConfig;
}

// Save AI config to localStorage
export function saveAIConfig(config: Partial<AIConfig>): void {
  const current = getAIConfig();
  const updated = { ...current, ...config };
  localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(updated));
}

// Check if AI is configured and enabled
export function isAIEnabled(): boolean {
  const config = getAIConfig();
  return config.enabled && !!config.apiKey;
}

// Build context about a person for AI prompts
function buildPersonContext(person: Person, giving?: Giving[]): string {
  const parts: string[] = [];

  parts.push(`Name: ${person.firstName} ${person.lastName}`);
  parts.push(`Status: ${person.status}`);

  if (person.tags && person.tags.length > 0) {
    parts.push(`Tags: ${person.tags.join(', ')}`);
  }

  if (person.joinDate) {
    const joinDate = new Date(person.joinDate);
    const years = Math.floor((Date.now() - joinDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    parts.push(`Member for: ${years} year${years !== 1 ? 's' : ''}`);
  }

  if (giving && giving.length > 0) {
    const personGiving = giving.filter(g => g.personId === person.id);
    const totalGiven = personGiving.reduce((sum, g) => sum + g.amount, 0);
    const recentGiving = personGiving.slice(0, 5);
    parts.push(`Total giving: $${totalGiven.toFixed(2)}`);
    parts.push(`Recent donations: ${recentGiving.length}`);
  }

  return parts.join('\n');
}

// Call Gemini API
async function callGeminiAPI(prompt: string, config: AIConfig): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Generate AI content
export async function generateAIContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  const config = getAIConfig();

  if (!config.enabled || !config.apiKey) {
    return { success: false, error: 'AI is not configured' };
  }

  try {
    let prompt = '';
    const personContext = request.person ? buildPersonContext(request.person) : '';

    switch (request.type) {
      case 'birthday_message':
        prompt = `You are a friendly church staff member. Write a warm, personalized birthday message for a church member.

Member Info:
${personContext}

Requirements:
- Keep it warm and personal (2-3 sentences)
- Include a brief blessing or well-wish
- Reference their connection to the church community if appropriate
- Don't be overly formal or generic
- Sign it from "Grace Church Family"

Write only the message, no explanations.`;
        break;

      case 'donation_thank_you':
        const amount = request.context?.amount as number;
        const fund = request.context?.fund as string;
        prompt = `You are a grateful church staff member. Write a heartfelt thank-you message for a donation.

Member Info:
${personContext}

Donation Details:
- Amount: $${amount?.toFixed(2) || 'N/A'}
- Fund: ${fund || 'General'}

Requirements:
- Express genuine gratitude (2-3 sentences)
- Mention the impact their giving has on the church/community
- Be warm but not over-the-top
- Don't mention specific amounts in the message
- Sign it appropriately

Write only the message, no explanations.`;
        break;

      case 'follow_up':
        prompt = `You are a caring church staff member. Write a thoughtful follow-up message for a member who may need connection.

Member Info:
${personContext}

Context: ${request.context?.reason || 'General check-in'}

Requirements:
- Be warm and genuine, not pushy
- Express care for their wellbeing
- Invite them to connect without pressure
- Keep it brief (2-3 sentences)
- Include a way to respond or connect

Write only the message, no explanations.`;
        break;

      case 'pastoral_care':
        prompt = `You are a compassionate pastor. Write a supportive message for someone who may be going through a difficult time.

Member Info:
${personContext}

Situation: ${request.context?.situation || 'General pastoral care'}

Requirements:
- Be empathetic and supportive
- Offer to be available without being intrusive
- Include an appropriate scripture or encouragement if fitting
- Keep it personal and heartfelt (3-4 sentences)

Write only the message, no explanations.`;
        break;

      case 'insights':
        prompt = request.customPrompt || 'Provide helpful insights about church engagement.';
        break;

      case 'custom':
        prompt = request.customPrompt || '';
        break;
    }

    if (!prompt) {
      return { success: false, error: 'No prompt generated' };
    }

    const content = await callGeminiAPI(prompt, config);
    return { success: true, content: content.trim() };
  } catch (error) {
    console.error('AI generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Analyze member data and generate insights
export async function generateInsights(
  people: Person[],
  giving: Giving[]
): Promise<AIInsight[]> {
  const config = getAIConfig();

  if (!config.enabled || !config.apiKey) {
    return [];
  }

  try {
    // Build a summary of the church data
    const totalMembers = people.length;
    const activeMembers = people.filter(p => p.status === 'member').length;
    const visitors = people.filter(p => p.status === 'visitor').length;
    const inactive = people.filter(p => p.status === 'inactive').length;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    const recentGiving = giving.filter(g => new Date(g.date) >= thisMonth);
    const totalRecentGiving = recentGiving.reduce((sum, g) => sum + g.amount, 0);

    // Find members who haven't given recently but used to
    const regularGivers = new Set(
      giving
        .filter(g => new Date(g.date) < thisMonth)
        .map(g => g.personId)
    );
    const recentGivers = new Set(recentGiving.map(g => g.personId));
    const lapsedGivers = [...regularGivers].filter(id => !recentGivers.has(id));

    // Find upcoming birthdays
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingBirthdays = people.filter(p => {
      if (!p.birthDate) return false;
      const bday = new Date(p.birthDate);
      const thisYearBday = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      return thisYearBday >= today && thisYearBday <= nextWeek;
    });

    const prompt = `You are a church management AI assistant. Analyze this church data and provide 3-5 actionable insights.

Church Statistics:
- Total People: ${totalMembers}
- Active Members: ${activeMembers}
- Visitors: ${visitors}
- Inactive Members: ${inactive}
- This Month's Giving: $${totalRecentGiving.toFixed(2)}
- Lapsed Givers (gave before, not this month): ${lapsedGivers.length}
- Upcoming Birthdays This Week: ${upcomingBirthdays.length}

Provide insights in this exact JSON format (array of objects):
[
  {
    "type": "warning|opportunity|celebration|info",
    "title": "Brief title",
    "description": "1-2 sentence description",
    "actionSuggestion": "Specific action to take"
  }
]

Focus on actionable, pastoral insights that help the church care for their members better.
Return ONLY the JSON array, no other text.`;

    const response = await callGeminiAPI(prompt, config);

    // Parse the JSON response
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }

      const insights = JSON.parse(cleanedResponse.trim()) as AIInsight[];
      return insights;
    } catch (parseError) {
      console.error('Failed to parse AI insights:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

// Test the AI connection
export async function testAIConnection(): Promise<{ success: boolean; message: string }> {
  const config = getAIConfig();

  if (!config.apiKey) {
    return { success: false, message: 'API key not configured' };
  }

  try {
    const response = await callGeminiAPI('Say "Hello from Grace CRM!" in a friendly way.', config);
    if (response) {
      return { success: true, message: response };
    }
    return { success: false, message: 'No response received' };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed'
    };
  }
}
