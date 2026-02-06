import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  LeaderProfile,
  HelpRequest,
  PastoralConversation,
  PastoralMessage,
  HelpCategory,
  ConversationPriority,
  AIPersona,
  CrisisAlert,
} from '../types';
import { detectCrisis } from '../utils/crisisDetection';

// ========================================
// Database Row Converters
// ========================================

type DbRow = Record<string, unknown>;

function dbToLeader(row: DbRow): LeaderProfile {
  return {
    id: row.id as string,
    personId: row.person_id as string | undefined,
    displayName: row.display_name as string,
    title: (row.title as string) || '',
    bio: (row.bio as string) || '',
    photo: row.photo_url as string | undefined,
    expertiseAreas: (row.expertise_areas as HelpCategory[]) || [],
    isAvailable: row.is_available as boolean,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

function dbToPersona(row: DbRow): AIPersona {
  return {
    id: row.id as string,
    leaderId: row.leader_id as string,
    name: row.name as string,
    systemPrompt: (row.system_prompt as string) || '',
    tone: (row.tone as AIPersona['tone']) || { warmth: 7, formality: 4, directness: 5, faithLevel: 6 },
    boundaries: (row.boundaries as string[]) || [],
    isActive: row.is_active as boolean,
  };
}

function dbToHelpRequest(row: DbRow): HelpRequest {
  return {
    id: row.id as string,
    category: row.category as HelpCategory,
    description: row.description as string | undefined,
    isAnonymous: row.is_anonymous as boolean,
    anonymousId: row.anonymous_id as string | undefined,
    personId: row.person_id as string | undefined,
    assignedLeaderId: row.assigned_leader_id as string | undefined,
    conversationId: row.conversation_id as string | undefined,
    status: row.status as HelpRequest['status'],
    priority: row.priority as ConversationPriority,
    createdAt: row.created_at as string,
    resolvedAt: row.resolved_at as string | undefined,
  };
}

function dbToMessage(row: DbRow): PastoralMessage {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    sender: row.sender as PastoralMessage['sender'],
    senderName: row.sender_name as string,
    content: row.content as string,
    timestamp: row.created_at as string,
    aiConfidence: row.ai_confidence != null ? Number(row.ai_confidence) : undefined,
    flagged: (row.flagged as boolean) || false,
    flagReason: row.flag_reason as string | undefined,
  };
}

function dbToConversation(row: DbRow, messages: PastoralMessage[]): PastoralConversation {
  return {
    id: row.id as string,
    helpRequestId: row.help_request_id as string,
    personaId: row.persona_id as string | undefined,
    leaderId: row.leader_id as string | undefined,
    status: row.status as PastoralConversation['status'],
    priority: row.priority as ConversationPriority,
    category: row.category as HelpCategory,
    isAnonymous: row.is_anonymous as boolean,
    personId: row.person_id as string | undefined,
    messages,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    resolvedAt: row.resolved_at as string | undefined,
  };
}

function dbToCrisisAlert(row: DbRow): CrisisAlert {
  return {
    id: row.id as string,
    conversationId: row.conversation_id as string,
    triggerType: row.trigger_type as CrisisAlert['triggerType'],
    triggerDetail: row.trigger_detail as string,
    severity: row.severity as CrisisAlert['severity'],
    status: row.status as CrisisAlert['status'],
    createdAt: row.created_at as string,
    acknowledgedAt: row.acknowledged_at as string | undefined,
    resolvedAt: row.resolved_at as string | undefined,
  };
}

// ========================================
// Demo Data (fallback when Supabase unavailable)
// ========================================

const INITIAL_LEADERS: LeaderProfile[] = [
  {
    id: 'leader-1',
    personId: 'person-1',
    displayName: 'Pastor Mike Davis',
    title: 'Senior Pastor — Marriage & Family',
    bio: 'Over 20 years of pastoral experience specializing in marriage counseling and family restoration. Certified by the American Association of Christian Counselors.',
    photo: undefined,
    expertiseAreas: ['marriage', 'parenting', 'general'],
    isAvailable: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'leader-2',
    personId: 'person-2',
    displayName: 'Pastor Sarah Johnson',
    title: 'Care Pastor — Grief & Crisis',
    bio: 'Specializing in grief counseling and crisis intervention. Former hospice chaplain with a heart for those walking through the darkest valleys.',
    photo: undefined,
    expertiseAreas: ['grief', 'crisis', 'anxiety-depression'],
    isAvailable: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'leader-3',
    personId: 'person-3',
    displayName: 'Deacon James Williams',
    title: 'Recovery Ministry Lead',
    bio: '15 years in recovery ministry. Leads our Celebrate Recovery program and mentors those overcoming addiction with compassion and accountability.',
    photo: undefined,
    expertiseAreas: ['addiction', 'financial', 'general'],
    isAvailable: false,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'leader-4',
    personId: 'person-4',
    displayName: 'Pastor Rachel Kim',
    title: 'Youth & Young Adults Pastor',
    bio: "Passionate about helping young people navigate faith, doubt, and life's big questions. Masters in Theology with a focus on apologetics.",
    photo: undefined,
    expertiseAreas: ['faith-questions', 'anxiety-depression', 'parenting'],
    isAvailable: true,
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
  },
];

const INITIAL_PERSONAS: AIPersona[] = [
  {
    id: 'persona-1',
    leaderId: 'leader-1',
    name: "Pastor Mike's AI Assistant",
    systemPrompt: 'You are a compassionate pastoral care assistant representing Pastor Mike Davis, specializing in marriage and family counseling.',
    tone: { warmth: 8, formality: 4, directness: 6, faithLevel: 7 },
    boundaries: ['Legal advice', 'Medical diagnosis', 'Medication recommendations'],
    isActive: true,
  },
  {
    id: 'persona-2',
    leaderId: 'leader-2',
    name: "Pastor Sarah's AI Assistant",
    systemPrompt: 'You are a gentle, empathetic pastoral care assistant representing Pastor Sarah Johnson, specializing in grief counseling and crisis support.',
    tone: { warmth: 9, formality: 3, directness: 4, faithLevel: 6 },
    boundaries: ['Suicide risk assessment', 'Psychiatric evaluation', 'Legal counsel'],
    isActive: true,
  },
  {
    id: 'persona-3',
    leaderId: 'leader-3',
    name: "Deacon James's AI Assistant",
    systemPrompt: 'You are a supportive pastoral care assistant representing Deacon James Williams, specializing in addiction recovery and financial guidance.',
    tone: { warmth: 7, formality: 5, directness: 7, faithLevel: 8 },
    boundaries: ['Medical detox advice', 'Legal financial advice', 'Prescriptions'],
    isActive: true,
  },
  {
    id: 'persona-4',
    leaderId: 'leader-4',
    name: "Pastor Rachel's AI Assistant",
    systemPrompt: 'You are a warm, approachable pastoral care assistant representing Pastor Rachel Kim, specializing in faith exploration and supporting young adults.',
    tone: { warmth: 8, formality: 3, directness: 5, faithLevel: 5 },
    boundaries: ['Academic counseling', 'Medical advice'],
    isActive: true,
  },
];

// AI response templates per category
const AI_RESPONSES: Record<HelpCategory, string[]> = {
  'marriage': [
    "I'm glad you reached out. Marriage is one of the most meaningful relationships in our lives, and it's completely normal to need support. Can you tell me a bit more about what's been challenging?",
    "Thank you for sharing that. It takes courage to seek help. In my experience, communication is often at the heart of these challenges. How have things been between you and your spouse recently?",
    "I hear you, and what you're feeling is valid. Pastor Mike has extensive experience with exactly this kind of situation. Would you like me to share some initial thoughts, or would you prefer to schedule a time to speak with him directly?",
  ],
  'addiction': [
    "Thank you for reaching out — that takes real courage. You're not alone in this, and there is hope. Can you tell me a little about what you're going through?",
    "I want you to know that recovery is possible, and our church has resources specifically designed to support you. Our Celebrate Recovery program has helped many people find freedom.",
    "Deacon James leads our recovery ministry and has walked this road himself. He understands what you're going through. Would you like me to connect you with him?",
  ],
  'grief': [
    "I'm so sorry for your loss. Grief is one of the hardest journeys we walk, and there's no 'right' way to grieve. I'm here to listen whenever you're ready to share.",
    "Thank you for trusting us with your pain. What you're feeling — whether it's sadness, anger, confusion, or even numbness — all of it is a natural part of the process.",
    "Pastor Sarah has walked alongside many families through loss. She has a gift for being present without pushing. Would you like to talk more about what happened?",
  ],
  'faith-questions': [
    "Those are great questions! Doubt and curiosity are actually healthy parts of a growing faith. What's been on your mind?",
    "I love that you're wrestling with these things — it means you care deeply about truth. Let me share some thoughts that might help...",
    "Pastor Rachel specializes in exactly these kinds of conversations. She has a way of making space for honest questions without judgment. Would you like to explore this further?",
  ],
  'crisis': [
    "I want you to know that you're not alone right now, and reaching out was the right thing to do. Your safety matters to us above everything else.",
    "If you or someone you know is in immediate danger, please call 911 or the 988 Suicide & Crisis Lifeline. We want to help, and there are trained professionals available 24/7.",
    "I'm alerting our care team right now so someone can follow up with you quickly. Is there anything immediate I can do to help while we connect you?",
  ],
  'financial': [
    "Financial stress can feel overwhelming, but you don't have to navigate it alone. We have resources and people who can help. Can you share a bit about your situation?",
    "Thank you for being open about this. Many people face financial challenges, and our benevolence ministry exists specifically to walk alongside you during these times.",
    "I'd like to connect you with someone who can discuss both practical assistance and longer-term financial guidance. Would that be helpful?",
  ],
  'anxiety-depression': [
    "Thank you for reaching out. It takes strength to acknowledge what you're going through. You matter, and your mental health matters. Tell me more about what you've been experiencing.",
    "What you're describing sounds really difficult, and I want you to know it's not a sign of weak faith — it's a health issue that deserves compassion and support.",
    "We believe in supporting the whole person — spirit, mind, and body. Our pastors work alongside licensed counselors to provide comprehensive care. Would you like to talk about next steps?",
  ],
  'parenting': [
    "Parenting is one of the most rewarding and challenging roles we'll ever have. You're not alone in feeling this way. What's been going on?",
    "Every parent faces moments like these. The fact that you're seeking guidance shows how much you care. Let me share some thoughts that might help...",
    "We have several parents in our community who've walked similar paths. Would you like to connect with a support group or speak with one of our family ministry leaders?",
  ],
  'general': [
    "I'm glad you reached out! Whatever is on your mind, we're here to help. What would you like to talk about?",
    "Thank you for sharing. Let me think about the best way to support you with this...",
    "That makes sense. Would you like to continue chatting, or would you prefer to schedule a time to talk with one of our pastoral team members in person?",
  ],
};

// ========================================
// Helper Functions
// ========================================

function generateAnonymousId(): string {
  const words = ['Helper', 'Friend', 'Seeker', 'Guest', 'Visitor'];
  const word = words[Math.floor(Math.random() * words.length)];
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${word}-${code}`;
}

function matchLeader(category: HelpCategory, leaders: LeaderProfile[]): LeaderProfile | undefined {
  const available = leaders.filter(l => l.isActive && l.expertiseAreas.includes(category));
  const online = available.filter(l => l.isAvailable);
  if (online.length > 0) return online[0];
  if (available.length > 0) return available[0];
  return leaders.find(l => l.isActive);
}

function getPriority(category: HelpCategory): ConversationPriority {
  if (category === 'crisis') return 'crisis';
  if (category === 'anxiety-depression' || category === 'addiction') return 'high';
  return 'medium';
}

// ========================================
// Hook
// ========================================

export function usePastoralCare(churchId?: string) {
  const [leaders, setLeaders] = useState<LeaderProfile[]>([]);
  const [personas, setPersonas] = useState<AIPersona[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [conversations, setConversations] = useState<PastoralConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([]);

  const isDemo = !isSupabaseConfigured();

  // Load data from Supabase or use demo data
  useEffect(() => {
    async function loadData() {
      if (!supabase || isDemo) {
        setLeaders(INITIAL_LEADERS);
        setPersonas(INITIAL_PERSONAS);
        return;
      }

      try {
        const [leadersRes, personasRes, requestsRes, convsRes, msgsRes, alertsRes] = await Promise.all([
          supabase.from('leader_profiles').select('*').order('created_at'),
          supabase.from('ai_personas').select('*').order('created_at'),
          supabase.from('help_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('pastoral_conversations').select('*').order('created_at', { ascending: false }),
          supabase.from('pastoral_messages').select('*').order('created_at'),
          supabase.from('crisis_alerts').select('*').order('created_at', { ascending: false }),
        ]);

        if (leadersRes.error) throw leadersRes.error;
        if (personasRes.error) throw personasRes.error;
        if (requestsRes.error) throw requestsRes.error;
        if (convsRes.error) throw convsRes.error;
        if (msgsRes.error) throw msgsRes.error;
        if (alertsRes.error) throw alertsRes.error;

        const allMessages = (msgsRes.data || []).map((r: DbRow) => dbToMessage(r));

        setLeaders((leadersRes.data || []).map((r: DbRow) => dbToLeader(r)));
        setPersonas((personasRes.data || []).map((r: DbRow) => dbToPersona(r)));
        setHelpRequests((requestsRes.data || []).map((r: DbRow) => dbToHelpRequest(r)));
        setConversations((convsRes.data || []).map((row: DbRow) =>
          dbToConversation(row, allMessages.filter((m: PastoralMessage) => m.conversationId === (row.id as string)))
        ));
        setCrisisAlerts((alertsRes.data || []).map((r: DbRow) => dbToCrisisAlert(r)));
      } catch (err) {
        console.error('Error loading pastoral care data, falling back to demo:', err);
        setLeaders(INITIAL_LEADERS);
        setPersonas(INITIAL_PERSONAS);
      }
    }

    loadData();
  }, [isDemo]);

  // ---- Leader Management ----

  const addLeader = useCallback(async (leader: Omit<LeaderProfile, 'id' | 'createdAt'>) => {
    if (isDemo || !supabase) {
      const newLeader: LeaderProfile = {
        ...leader,
        id: `leader-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setLeaders(prev => [...prev, newLeader]);
      return;
    }

    const { data, error } = await supabase
      .from('leader_profiles')
      .insert({
        church_id: churchId,
        person_id: leader.personId || null,
        display_name: leader.displayName,
        title: leader.title || null,
        bio: leader.bio || null,
        photo_url: leader.photo || null,
        expertise_areas: leader.expertiseAreas,
        is_available: leader.isAvailable,
        is_active: leader.isActive,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding leader:', error);
      const newLeader: LeaderProfile = { ...leader, id: `leader-${Date.now()}`, createdAt: new Date().toISOString() };
      setLeaders(prev => [...prev, newLeader]);
      return;
    }

    setLeaders(prev => [...prev, dbToLeader(data)]);
  }, [isDemo, churchId]);

  const updateLeader = useCallback(async (id: string, updates: Partial<LeaderProfile>) => {
    setLeaders(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

    if (isDemo || !supabase) return;

    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.photo !== undefined) dbUpdates.photo_url = updates.photo;
    if (updates.expertiseAreas !== undefined) dbUpdates.expertise_areas = updates.expertiseAreas;
    if (updates.isAvailable !== undefined) dbUpdates.is_available = updates.isAvailable;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.personId !== undefined) dbUpdates.person_id = updates.personId;

    const { error } = await supabase.from('leader_profiles').update(dbUpdates).eq('id', id);
    if (error) console.error('Error updating leader:', error);
  }, [isDemo]);

  const removeLeader = useCallback(async (id: string) => {
    setLeaders(prev => prev.filter(l => l.id !== id));
    setPersonas(prev => prev.filter(p => p.leaderId !== id));

    if (isDemo || !supabase) return;

    const { error } = await supabase.from('leader_profiles').delete().eq('id', id);
    if (error) console.error('Error removing leader:', error);
  }, [isDemo]);

  // ---- Persona Management ----

  const updatePersona = useCallback(async (leaderId: string, updates: Partial<AIPersona>) => {
    let existingId: string | null = null;

    setPersonas(prev => {
      const existing = prev.find(p => p.leaderId === leaderId);
      if (existing) {
        existingId = existing.id;
        return prev.map(p => p.leaderId === leaderId ? { ...p, ...updates } : p);
      }
      return [...prev, {
        id: `persona-${Date.now()}`,
        leaderId,
        name: 'AI Assistant',
        systemPrompt: '',
        tone: { warmth: 7, formality: 4, directness: 5, faithLevel: 6 },
        boundaries: [],
        isActive: true,
        ...updates,
      }];
    });

    if (isDemo || !supabase) return;

    if (existingId) {
      const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.systemPrompt !== undefined) dbUpdates.system_prompt = updates.systemPrompt;
      if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
      if (updates.boundaries !== undefined) dbUpdates.boundaries = updates.boundaries;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase.from('ai_personas').update(dbUpdates).eq('id', existingId);
      if (error) console.error('Error updating persona:', error);
    } else {
      const { error } = await supabase.from('ai_personas').insert({
        church_id: churchId,
        leader_id: leaderId,
        name: updates.name || 'AI Assistant',
        system_prompt: updates.systemPrompt || '',
        tone: updates.tone || { warmth: 7, formality: 4, directness: 5, faithLevel: 6 },
        boundaries: updates.boundaries || [],
        is_active: updates.isActive ?? true,
      });
      if (error) console.error('Error creating persona:', error);
    }
  }, [isDemo, churchId]);

  // ---- Crisis Alerts ----

  const acknowledgeCrisisAlert = useCallback(async (alertId: string) => {
    const now = new Date().toISOString();
    setCrisisAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'acknowledged' as const, acknowledgedAt: now }
        : a
    ));

    if (isDemo || !supabase) return;

    const { error } = await supabase.from('crisis_alerts')
      .update({ status: 'acknowledged', acknowledged_at: now })
      .eq('id', alertId);
    if (error) console.error('Error acknowledging crisis alert:', error);
  }, [isDemo]);

  const dismissCrisisAlert = useCallback(async (alertId: string) => {
    const now = new Date().toISOString();
    setCrisisAlerts(prev => prev.map(a =>
      a.id === alertId
        ? { ...a, status: 'resolved' as const, resolvedAt: now }
        : a
    ));

    if (isDemo || !supabase) return;

    const { error } = await supabase.from('crisis_alerts')
      .update({ status: 'resolved', resolved_at: now })
      .eq('id', alertId);
    if (error) console.error('Error dismissing crisis alert:', error);
  }, [isDemo]);

  // ---- Help Requests & Conversations ----

  const createHelpRequest = useCallback(async (request: {
    category: HelpCategory;
    description?: string;
    isAnonymous: boolean;
  }) => {
    const leader = matchLeader(request.category, leaders);
    const persona = leader ? personas.find(p => p.leaderId === leader.id) : undefined;
    const anonymousId = request.isAnonymous ? generateAnonymousId() : undefined;
    const priority = getPriority(request.category);

    // Check description for crisis indicators
    let effectivePriority = priority;
    let crisisResult = request.description ? detectCrisis(request.description) : null;
    if (crisisResult?.isCrisis) {
      effectivePriority = crisisResult.severity === 'critical' ? 'crisis' : 'high';
    }

    const responses = AI_RESPONSES[request.category];

    if (isDemo || !supabase) {
      const conversationId = `conv-${Date.now()}`;

      const newRequest: HelpRequest = {
        id: `req-${Date.now()}`,
        category: request.category,
        description: request.description,
        isAnonymous: request.isAnonymous,
        anonymousId,
        assignedLeaderId: leader?.id,
        conversationId,
        status: 'active',
        priority: effectivePriority,
        createdAt: new Date().toISOString(),
      };

      const messages: PastoralMessage[] = [];
      if (request.description) {
        messages.push({
          id: `msg-${Date.now() - 1}`,
          conversationId,
          sender: 'user',
          senderName: request.isAnonymous ? anonymousId! : 'You',
          content: request.description,
          timestamp: new Date(Date.now() - 1000).toISOString(),
        });
      }
      messages.push({
        id: `msg-${Date.now()}`,
        conversationId,
        sender: 'ai',
        senderName: leader ? `AI (${leader.displayName}'s Assistant)` : 'AI Care Assistant',
        content: responses[0],
        timestamp: new Date().toISOString(),
        aiConfidence: 0.92,
      });

      const newConversation: PastoralConversation = {
        id: conversationId,
        helpRequestId: newRequest.id,
        personaId: persona?.id,
        leaderId: leader?.id,
        status: 'active',
        priority: effectivePriority,
        category: request.category,
        isAnonymous: request.isAnonymous,
        personId: undefined,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (crisisResult?.isCrisis) {
        setCrisisAlerts(prev => [...prev, {
          id: `alert-${Date.now()}`,
          conversationId,
          triggerType: crisisResult!.triggerType,
          triggerDetail: crisisResult!.matchedKeywords.slice(0, 3).join(', '),
          severity: crisisResult!.severity,
          status: 'active',
          createdAt: new Date().toISOString(),
        }]);
      }

      setHelpRequests(prev => [...prev, newRequest]);
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(conversationId);
      return;
    }

    // Supabase mode
    try {
      // 1. Insert help request
      const { data: reqData, error: reqError } = await supabase
        .from('help_requests')
        .insert({
          church_id: churchId,
          category: request.category,
          description: request.description || null,
          is_anonymous: request.isAnonymous,
          anonymous_id: anonymousId || null,
          assigned_leader_id: leader?.id || null,
          assigned_persona_id: persona?.id || null,
          status: 'active',
          priority: effectivePriority,
          source: 'web',
        })
        .select()
        .single();

      if (reqError) throw reqError;

      // 2. Insert conversation
      const { data: convData, error: convError } = await supabase
        .from('pastoral_conversations')
        .insert({
          church_id: churchId,
          help_request_id: reqData.id,
          persona_id: persona?.id || null,
          leader_id: leader?.id || null,
          status: 'active',
          priority: effectivePriority,
          category: request.category,
          is_anonymous: request.isAnonymous,
          anonymous_id: anonymousId || null,
        })
        .select()
        .single();

      if (convError) throw convError;

      // 3. Update help request with conversation_id
      await supabase.from('help_requests')
        .update({ conversation_id: convData.id })
        .eq('id', reqData.id);

      // 4. Insert messages
      const messagesToInsert: Record<string, unknown>[] = [];
      if (request.description) {
        messagesToInsert.push({
          church_id: churchId,
          conversation_id: convData.id,
          sender: 'user',
          sender_name: request.isAnonymous ? anonymousId : 'You',
          content: request.description,
        });
      }
      messagesToInsert.push({
        church_id: churchId,
        conversation_id: convData.id,
        sender: 'ai',
        sender_name: leader ? `AI (${leader.displayName}'s Assistant)` : 'AI Care Assistant',
        content: responses[0],
        ai_confidence: 0.92,
      });

      const { data: msgsData, error: msgsError } = await supabase
        .from('pastoral_messages')
        .insert(messagesToInsert)
        .select();

      if (msgsError) throw msgsError;

      // 5. Create crisis alert if needed
      if (crisisResult?.isCrisis) {
        const { data: alertData } = await supabase
          .from('crisis_alerts')
          .insert({
            church_id: churchId,
            conversation_id: convData.id,
            trigger_type: crisisResult.triggerType,
            trigger_detail: crisisResult.matchedKeywords.slice(0, 3).join(', '),
            severity: crisisResult.severity,
            status: 'active',
          })
          .select()
          .single();

        if (alertData) {
          setCrisisAlerts(prev => [...prev, dbToCrisisAlert(alertData)]);
        }
      }

      // Update local state with DB-generated records
      const newHelpRequest = dbToHelpRequest({ ...reqData, conversation_id: convData.id });
      const newMessages = (msgsData || []).map((r: DbRow) => dbToMessage(r));
      const newConversation = dbToConversation(convData, newMessages);

      setHelpRequests(prev => [...prev, newHelpRequest]);
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(convData.id as string);
    } catch (err) {
      console.error('Error creating help request in Supabase:', err);
      // Fall back to demo-style local creation
      const conversationId = `conv-${Date.now()}`;
      const newRequest: HelpRequest = {
        id: `req-${Date.now()}`, category: request.category, description: request.description,
        isAnonymous: request.isAnonymous, anonymousId, assignedLeaderId: leader?.id,
        conversationId, status: 'active', priority: effectivePriority, createdAt: new Date().toISOString(),
      };
      const messages: PastoralMessage[] = [];
      if (request.description) {
        messages.push({ id: `msg-${Date.now() - 1}`, conversationId, sender: 'user',
          senderName: request.isAnonymous ? anonymousId! : 'You', content: request.description,
          timestamp: new Date(Date.now() - 1000).toISOString() });
      }
      messages.push({ id: `msg-${Date.now()}`, conversationId, sender: 'ai',
        senderName: leader ? `AI (${leader.displayName}'s Assistant)` : 'AI Care Assistant',
        content: responses[0], timestamp: new Date().toISOString(), aiConfidence: 0.92 });
      const newConversation: PastoralConversation = {
        id: conversationId, helpRequestId: newRequest.id, personaId: persona?.id, leaderId: leader?.id,
        status: 'active', priority: effectivePriority, category: request.category,
        isAnonymous: request.isAnonymous, personId: undefined, messages,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setHelpRequests(prev => [...prev, newRequest]);
      setConversations(prev => [...prev, newConversation]);
      setActiveConversationId(conversationId);
    }
  }, [isDemo, churchId, leaders, personas]);

  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    const crisisResult = detectCrisis(content);
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const leader = conv.leaderId ? leaders.find(l => l.id === conv.leaderId) : undefined;

    // Determine AI response
    let aiContent: string;
    if (crisisResult.isCrisis && crisisResult.suggestedResponse) {
      aiContent = crisisResult.suggestedResponse;
    } else {
      const responses = AI_RESPONSES[conv.category];
      const responseIndex = Math.min(conv.messages.filter(m => m.sender === 'ai').length, responses.length - 1);
      aiContent = responses[responseIndex];
    }

    const newPriority = crisisResult.isCrisis && crisisResult.severity === 'critical'
      ? 'crisis' as ConversationPriority
      : crisisResult.isCrisis
      ? 'high' as ConversationPriority
      : conv.priority;

    if (isDemo || !supabase) {
      const userMessage: PastoralMessage = {
        id: `msg-${Date.now()}`,
        conversationId,
        sender: 'user',
        senderName: conv.isAnonymous ? 'Anonymous' : 'You',
        content,
        timestamp: new Date().toISOString(),
        flagged: crisisResult.isCrisis,
        flagReason: crisisResult.isCrisis ? `Crisis detected: ${crisisResult.matchedKeywords.join(', ')}` : undefined,
      };

      const aiMessage: PastoralMessage = {
        id: `msg-${Date.now() + 1}`,
        conversationId,
        sender: 'ai',
        senderName: leader
          ? `AI (${leader.displayName}'s Assistant)`
          : 'AI Care Assistant',
        content: aiContent,
        timestamp: new Date(Date.now() + 1500).toISOString(),
        aiConfidence: crisisResult.isCrisis ? 0.98 : 0.85 + Math.random() * 0.12,
      };

      if (crisisResult.isCrisis) {
        setCrisisAlerts(prev => [...prev, {
          id: `alert-${Date.now()}`,
          conversationId,
          triggerType: crisisResult.triggerType,
          triggerDetail: crisisResult.matchedKeywords.slice(0, 3).join(', '),
          severity: crisisResult.severity,
          status: 'active',
          createdAt: new Date().toISOString(),
        }]);
      }

      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [...c.messages, userMessage, aiMessage],
          priority: newPriority,
          status: crisisResult.severity === 'critical' ? 'escalated' as const : c.status,
          updatedAt: new Date().toISOString(),
        };
      }));
      return;
    }

    // Supabase mode
    try {
      const aiConfidence = crisisResult.isCrisis ? 0.98 : 0.85 + Math.random() * 0.12;

      const { data: msgsData, error: msgsError } = await supabase
        .from('pastoral_messages')
        .insert([
          {
            church_id: churchId,
            conversation_id: conversationId,
            sender: 'user',
            sender_name: conv.isAnonymous ? 'Anonymous' : 'You',
            content,
            flagged: crisisResult.isCrisis,
            flag_reason: crisisResult.isCrisis ? `Crisis detected: ${crisisResult.matchedKeywords.join(', ')}` : null,
          },
          {
            church_id: churchId,
            conversation_id: conversationId,
            sender: 'ai',
            sender_name: leader ? `AI (${leader.displayName}'s Assistant)` : 'AI Care Assistant',
            content: aiContent,
            ai_confidence: aiConfidence,
          },
        ])
        .select();

      if (msgsError) throw msgsError;

      // Update conversation priority/status
      const convUpdates: Record<string, unknown> = {
        priority: newPriority,
        updated_at: new Date().toISOString(),
      };
      if (crisisResult.severity === 'critical') {
        convUpdates.status = 'escalated';
      }

      await supabase.from('pastoral_conversations')
        .update(convUpdates)
        .eq('id', conversationId);

      // Create crisis alert if needed
      if (crisisResult.isCrisis) {
        const { data: alertData } = await supabase
          .from('crisis_alerts')
          .insert({
            church_id: churchId,
            conversation_id: conversationId,
            trigger_type: crisisResult.triggerType,
            trigger_detail: crisisResult.matchedKeywords.slice(0, 3).join(', '),
            severity: crisisResult.severity,
            status: 'active',
          })
          .select()
          .single();

        if (alertData) {
          setCrisisAlerts(prev => [...prev, dbToCrisisAlert(alertData)]);
        }
      }

      // Update local state
      const newMessages = (msgsData || []).map((r: DbRow) => dbToMessage(r));
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        return {
          ...c,
          messages: [...c.messages, ...newMessages],
          priority: newPriority,
          status: crisisResult.severity === 'critical' ? 'escalated' as const : c.status,
          updatedAt: new Date().toISOString(),
        };
      }));
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }, [isDemo, churchId, leaders, conversations]);

  const resolveConversation = useCallback(async (conversationId: string) => {
    const now = new Date().toISOString();

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, status: 'resolved' as const, resolvedAt: now }
        : conv
    ));
    setHelpRequests(prev => prev.map(req =>
      req.conversationId === conversationId
        ? { ...req, status: 'resolved' as const, resolvedAt: now }
        : req
    ));

    if (isDemo || !supabase) return;

    await supabase.from('pastoral_conversations')
      .update({ status: 'resolved', resolved_at: now, updated_at: now })
      .eq('id', conversationId);

    // Also update the help request
    const req = helpRequests.find(r => r.conversationId === conversationId);
    if (req) {
      await supabase.from('help_requests')
        .update({ status: 'resolved', resolved_at: now })
        .eq('id', req.id);
    }
  }, [isDemo, helpRequests]);

  const escalateConversation = useCallback(async (conversationId: string) => {
    const now = new Date().toISOString();

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, status: 'escalated' as const, updatedAt: now }
        : conv
    ));

    if (isDemo || !supabase) return;

    await supabase.from('pastoral_conversations')
      .update({ status: 'escalated', updated_at: now })
      .eq('id', conversationId);
  }, [isDemo]);

  // ---- Derived State ----

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const activeLeader = activeConversation?.leaderId
    ? leaders.find(l => l.id === activeConversation.leaderId)
    : undefined;

  return {
    leaders,
    personas,
    helpRequests,
    conversations,
    activeConversation,
    activeLeader,
    activeConversationId,
    crisisAlerts,
    setActiveConversationId,
    createHelpRequest,
    sendMessage,
    resolveConversation,
    escalateConversation,
    addLeader,
    updateLeader,
    removeLeader,
    updatePersona,
    acknowledgeCrisisAlert,
    dismissCrisisAlert,
  };
}
