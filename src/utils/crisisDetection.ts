import type { CrisisDetectionResult } from '../types';

// Keywords and phrases that indicate different severity levels
const CRITICAL_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'end it all',
  'want to die', 'wanna die', 'better off dead', 'no reason to live',
  'take my life', 'self-harm', 'hurting myself', 'cutting myself',
  'overdose', 'hang myself', 'jump off', 'slit my',
  'homicidal', 'kill someone', 'hurt someone',
  'being abused', 'domestic violence', 'he hits me', 'she hits me',
  'molested', 'sexually assaulted', 'raped',
  'child abuse', 'hurting my child', 'hurting my kids',
];

const HIGH_KEYWORDS = [
  'can\'t go on', 'giving up', 'hopeless', 'no hope',
  'worthless', 'burden to everyone', 'nobody cares',
  'can\'t take it anymore', 'falling apart', 'breaking down',
  'panic attack', 'can\'t breathe', 'emergency',
  'relapsed', 'using again', 'started drinking again',
  'unsafe', 'scared for my life', 'threatened me',
  'homeless', 'on the street', 'nowhere to go',
  'haven\'t eaten', 'starving', 'no food',
];

const MEDIUM_KEYWORDS = [
  'really struggling', 'very depressed', 'so anxious',
  'can\'t sleep', 'not eating', 'crying all the time',
  'lost my job', 'can\'t pay rent', 'eviction',
  'divorce', 'affair', 'separation',
  'someone died', 'just lost', 'funeral',
  'drinking too much', 'using substances',
  'angry all the time', 'rage', 'violent thoughts',
];

const CRISIS_RESOURCES = {
  suicide: '988 Suicide & Crisis Lifeline: Call or text 988',
  crisis: 'Crisis Text Line: Text HOME to 741741',
  domesticViolence: 'National Domestic Violence Hotline: 1-800-799-7233',
  childAbuse: 'Childhelp National Child Abuse Hotline: 1-800-422-4453',
  substanceAbuse: 'SAMHSA National Helpline: 1-800-662-4357',
};

function buildSuggestedResponse(severity: CrisisDetectionResult['severity'], matchedKeywords: string[]): string {
  const keywordStr = matchedKeywords[0]?.toLowerCase() || '';

  if (severity === 'critical') {
    const resources: string[] = [CRISIS_RESOURCES.crisis];

    if (['suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 'wanna die', 'better off dead', 'take my life', 'self-harm', 'hurting myself', 'cutting myself', 'overdose'].some(k => keywordStr.includes(k))) {
      resources.unshift(CRISIS_RESOURCES.suicide);
    }
    if (['abused', 'domestic violence', 'hits me'].some(k => keywordStr.includes(k))) {
      resources.unshift(CRISIS_RESOURCES.domesticViolence);
    }
    if (['child abuse', 'hurting my child', 'molested'].some(k => keywordStr.includes(k))) {
      resources.unshift(CRISIS_RESOURCES.childAbuse);
    }

    return `I want you to know that you reaching out right now shows incredible courage, and your safety is our absolute top priority. If you or someone you know is in immediate danger, please call 911.\n\n${resources.join('\n')}\n\nI'm alerting our care team right now so a trained leader can connect with you as quickly as possible. You are not alone.`;
  }

  if (severity === 'high') {
    if (['relapsed', 'using again', 'drinking again'].some(k => keywordStr.includes(k))) {
      return `Thank you for being honest about what's happening. Relapse is part of many people's recovery journey, and reaching out right now is exactly the right step. Our care team is being notified so we can connect you with support.\n\n${CRISIS_RESOURCES.substanceAbuse}`;
    }
    return `I hear you, and what you're going through sounds really difficult. You don't have to face this alone. I'm flagging this for our care team so a leader can reach out to you soon. In the meantime, know that we are here for you.`;
  }

  return `Thank you for sharing what you're going through. This sounds like a really challenging time, and I want to make sure you get the best support possible. Let me connect you with the right person on our care team.`;
}

/**
 * Analyzes a message for crisis indicators and returns detection results.
 * Uses keyword matching against curated severity-tiered word lists.
 */
export function detectCrisis(message: string): CrisisDetectionResult {
  const lower = message.toLowerCase();

  // Check critical keywords first
  const criticalMatches = CRITICAL_KEYWORDS.filter(kw => lower.includes(kw));
  if (criticalMatches.length > 0) {
    return {
      isCrisis: true,
      severity: 'critical',
      triggerType: 'keyword',
      matchedKeywords: criticalMatches,
      suggestedResponse: buildSuggestedResponse('critical', criticalMatches),
    };
  }

  // Check high severity
  const highMatches = HIGH_KEYWORDS.filter(kw => lower.includes(kw));
  if (highMatches.length > 0) {
    return {
      isCrisis: true,
      severity: highMatches.length >= 2 ? 'high' : 'high',
      triggerType: 'keyword',
      matchedKeywords: highMatches,
      suggestedResponse: buildSuggestedResponse('high', highMatches),
    };
  }

  // Check medium severity (multiple matches escalate)
  const mediumMatches = MEDIUM_KEYWORDS.filter(kw => lower.includes(kw));
  if (mediumMatches.length >= 2) {
    return {
      isCrisis: true,
      severity: 'medium',
      triggerType: 'keyword',
      matchedKeywords: mediumMatches,
      suggestedResponse: buildSuggestedResponse('medium', mediumMatches),
    };
  }

  return {
    isCrisis: false,
    severity: 'medium',
    triggerType: 'auto-detect',
    matchedKeywords: mediumMatches,
  };
}

/**
 * Returns a formatted crisis resource string for a given category.
 */
export function getCrisisResources(category?: string): string[] {
  if (!category) return Object.values(CRISIS_RESOURCES);

  const resources: string[] = [];
  const lower = category.toLowerCase();

  if (lower.includes('suicid') || lower.includes('crisis')) {
    resources.push(CRISIS_RESOURCES.suicide);
  }
  if (lower.includes('abuse') || lower.includes('violence') || lower.includes('domestic')) {
    resources.push(CRISIS_RESOURCES.domesticViolence);
  }
  if (lower.includes('child')) {
    resources.push(CRISIS_RESOURCES.childAbuse);
  }
  if (lower.includes('substance') || lower.includes('addiction') || lower.includes('alcohol') || lower.includes('drug')) {
    resources.push(CRISIS_RESOURCES.substanceAbuse);
  }

  resources.push(CRISIS_RESOURCES.crisis);
  return [...new Set(resources)];
}
