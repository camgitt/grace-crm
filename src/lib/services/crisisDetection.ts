import { crisisProtocol } from '../../data/pastoralCareData';

export interface CrisisScanResult {
  detected: boolean;
  severity: 'none' | 'low' | 'high';
  matchedKeywords: string[];
}

export function scanForCrisis(message: string): CrisisScanResult {
  const lower = message.toLowerCase();
  const matched: string[] = [];

  for (const keyword of crisisProtocol.keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    }
  }

  if (matched.length === 0) {
    return { detected: false, severity: 'none', matchedKeywords: [] };
  }

  // High severity: direct self-harm or danger indicators
  const highSeverityTerms = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
    'overdose', 'not safe', 'being abused', 'domestic violence',
  ];
  const isHigh = matched.some(k => highSeverityTerms.includes(k));

  return {
    detected: true,
    severity: isHigh ? 'high' : 'low',
    matchedKeywords: matched,
  };
}

export function getCrisisResponseText(): string {
  const { immediateResponse, resources } = crisisProtocol;
  const resourceList = resources
    .map(r => `- **${r.name}**: ${r.phone} — ${r.description}`)
    .join('\n');
  return `${immediateResponse}\n\n${resourceList}\n\nI'm still here to talk, and I want to help connect you with someone who can support you. Would you like me to have someone from our care team reach out to you?`;
}
