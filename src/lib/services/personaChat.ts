import type { AIPersona, LeaderProfile, CareMessage } from '../../types';
import { generateAIText } from './ai';
import { scanForCrisis, getCrisisResponseText } from './crisisDetection';

export interface PersonaChatResult {
  text: string;
  crisisDetected: boolean;
  crisisSeverity: 'none' | 'low' | 'high';
}

function buildSystemPrompt(persona: AIPersona, leader: LeaderProfile): string {
  const toneDescription = describeTone(persona.tone);
  const sampleSection = persona.sampleResponses.length > 0
    ? `\n\nEXAMPLE RESPONSES (match this style):\n${persona.sampleResponses.map(s => `Q: ${s.scenario}\nA: ${s.response}`).join('\n\n')}`
    : '';

  return `${persona.systemPrompt}

TONE: ${toneDescription}

LEADER INFO:
Name: ${leader.displayName}
Title: ${leader.title}
Expertise: ${leader.expertiseAreas.join(', ')}
Online: ${leader.isOnline ? 'Yes — user can request live connection' : 'No — currently offline'}
${sampleSection}

IMPORTANT RULES:
1. You are an AI assistant, be transparent about this if asked
2. Keep responses concise — 2-4 paragraphs max
3. Ask follow-up questions to understand the situation
4. Be empathetic and validating
5. If someone is in crisis, prioritize their safety above all else
6. End responses with a question or clear next step when appropriate`;
}

function describeTone(tone: { warmth: number; formality: number; directness: number; humor: number; faithLevel: number }): string {
  const parts: string[] = [];
  parts.push(tone.warmth >= 7 ? 'Very warm and empathetic' : tone.warmth >= 4 ? 'Balanced warmth' : 'Professional');
  parts.push(tone.formality >= 7 ? 'formal' : tone.formality >= 4 ? 'conversational' : 'casual and approachable');
  parts.push(tone.directness >= 7 ? 'direct and honest' : tone.directness >= 4 ? 'gently direct' : 'gentle and indirect');
  if (tone.humor >= 6) parts.push('occasional appropriate humor');
  parts.push(tone.faithLevel >= 7 ? 'scripture-rich' : tone.faithLevel >= 4 ? 'faith-informed' : 'lightly faith-referenced');
  return parts.join(', ');
}

function buildConversationContext(messages: CareMessage[]): string {
  if (messages.length === 0) return '';

  const recent = messages.slice(-10); // Last 10 messages for context
  return '\n\nCONVERSATION SO FAR:\n' + recent.map(m => {
    const role = m.sender === 'user' ? 'User' : m.sender === 'ai' ? 'You (AI)' : 'Leader';
    return `${role}: ${m.content}`;
  }).join('\n');
}

export async function generatePersonaResponse(
  persona: AIPersona,
  leader: LeaderProfile,
  messages: CareMessage[],
  userMessage: string
): Promise<PersonaChatResult> {
  // Check for crisis first
  const crisisScan = scanForCrisis(userMessage);

  if (crisisScan.detected && crisisScan.severity === 'high') {
    // Return crisis response immediately, don't even call AI
    return {
      text: getCrisisResponseText(),
      crisisDetected: true,
      crisisSeverity: 'high',
    };
  }

  const systemPrompt = buildSystemPrompt(persona, leader);
  const conversationContext = buildConversationContext(messages);

  const prompt = `${systemPrompt}${conversationContext}

User: ${userMessage}

Respond as the AI assistant for ${leader.displayName}. Be empathetic, helpful, and stay in character.${
    crisisScan.detected ? '\n\nNOTE: The user may be in distress. Be extra careful and empathetic. Include crisis resources if appropriate.' : ''
  }`;

  try {
    const result = await generateAIText({
      prompt,
      maxTokens: 600,
    });

    if (result.success && result.text) {
      // If low-level crisis was detected, append resources
      let text = result.text;
      if (crisisScan.detected && crisisScan.severity === 'low') {
        text += '\n\n---\n*If you\'re in crisis or need immediate help, please call or text **988** (Suicide & Crisis Lifeline) or text HOME to **741741** (Crisis Text Line).*';
      }
      return {
        text,
        crisisDetected: crisisScan.detected,
        crisisSeverity: crisisScan.severity,
      };
    }

    return {
      text: "I'm sorry, I'm having trouble responding right now. Please try again, or if you need immediate help, you can reach our care team directly.",
      crisisDetected: crisisScan.detected,
      crisisSeverity: crisisScan.severity,
    };
  } catch {
    return {
      text: "I'm sorry, I'm having trouble connecting right now. If you need immediate support, please call 988 (Suicide & Crisis Lifeline) or reach out to our church office.",
      crisisDetected: crisisScan.detected,
      crisisSeverity: crisisScan.severity,
    };
  }
}
