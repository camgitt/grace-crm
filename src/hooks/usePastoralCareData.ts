import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type {
  PastoralLeader,
  PastoralPersona,
  PastoralConversation,
  PastoralMessage,
  PastoralCrisisEvent,
  PastoralConversationInsert,
  PastoralMessageInsert,
  PastoralHelpCategory,
  PastoralConversationStatus,
  PastoralConversationPriority,
  PastoralCrisisSeverity,
} from '../lib/database.types';
import { sampleLeaderProfiles, samplePersonas, matchLeaderToCategory } from '../data/pastoralCareData';
import type { LeaderProfile, AIPersona } from '../types';

// Convert frontend LeaderProfile → DB PastoralLeader
function leaderToDb(l: LeaderProfile, churchId: string): PastoralLeader {
  return {
    id: l.id,
    church_id: churchId,
    person_id: l.personId || null,
    display_name: l.displayName,
    title: l.title || null,
    bio: l.bio || null,
    photo: l.photo || null,
    expertise_areas: l.expertiseAreas,
    is_online: l.isOnline,
    last_seen_at: l.lastSeenAt || null,
    is_active: l.isActive,
    created_at: l.createdAt,
    updated_at: l.createdAt,
  };
}

// Convert DB PastoralLeader → frontend LeaderProfile
function dbToLeader(l: PastoralLeader): LeaderProfile {
  return {
    id: l.id,
    personId: l.person_id || undefined,
    displayName: l.display_name,
    title: l.title || '',
    bio: l.bio || '',
    photo: l.photo || undefined,
    expertiseAreas: l.expertise_areas as LeaderProfile['expertiseAreas'],
    isOnline: l.is_online,
    lastSeenAt: l.last_seen_at || undefined,
    isActive: l.is_active,
    createdAt: l.created_at,
  };
}

// Convert frontend AIPersona → DB PastoralPersona
function personaToDb(p: AIPersona, churchId: string): PastoralPersona {
  return {
    id: p.id,
    church_id: churchId,
    leader_id: p.leaderId,
    name: p.name,
    tone: p.tone,
    system_prompt: p.systemPrompt,
    boundaries: p.boundaries,
    sample_responses: p.sampleResponses,
    is_active: p.isActive,
    created_at: p.createdAt,
    updated_at: p.createdAt,
  };
}

// Convert DB PastoralPersona → frontend AIPersona
function dbToPersona(p: PastoralPersona): AIPersona {
  return {
    id: p.id,
    leaderId: p.leader_id,
    name: p.name,
    tone: p.tone,
    systemPrompt: p.system_prompt,
    boundaries: p.boundaries,
    sampleResponses: p.sample_responses,
    isActive: p.is_active,
    createdAt: p.created_at,
  };
}

// Conversation with messages joined
export interface ConversationWithMessages extends PastoralConversation {
  messages: PastoralMessage[];
}

// Stats interface
export interface PastoralStats {
  activeCount: number;
  crisisCount: number;
  waitingCount: number;
  resolvedCount: number;
  totalConversations: number;
  unresolvedCrisisEvents: number;
}

const DEMO_CHURCH_ID = 'demo-church';

export function usePastoralCareData(churchId?: string) {
  const effectiveChurchId = churchId || DEMO_CHURCH_ID;
  const isDemo = !isSupabaseConfigured();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [leaders, setLeaders] = useState<PastoralLeader[]>([]);
  const [personas, setPersonas] = useState<PastoralPersona[]>([]);
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [crisisEvents, setCrisisEvents] = useState<PastoralCrisisEvent[]>([]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      if (isDemo || !supabase) {
        // Demo mode — use sample data
        setLeaders(sampleLeaderProfiles.map(l => leaderToDb(l, DEMO_CHURCH_ID)));
        setPersonas(samplePersonas.map(p => personaToDb(p, DEMO_CHURCH_ID)));
        setConversations([]);
        setCrisisEvents([]);
        setIsLoading(false);
        return;
      }

      try {
        const [leadersRes, personasRes, convsRes, msgsRes, crisisRes] = await Promise.all([
          supabase.from('pastoral_leaders').select('*').eq('church_id', effectiveChurchId).order('display_name'),
          supabase.from('pastoral_personas').select('*').eq('church_id', effectiveChurchId),
          supabase.from('pastoral_conversations').select('*').eq('church_id', effectiveChurchId).order('updated_at', { ascending: false }),
          supabase.from('pastoral_messages').select('*').order('created_at'),
          supabase.from('pastoral_crisis_events').select('*').eq('church_id', effectiveChurchId).order('created_at', { ascending: false }),
        ]);

        if (leadersRes.error) throw leadersRes.error;
        if (personasRes.error) throw personasRes.error;
        if (convsRes.error) throw convsRes.error;
        if (msgsRes.error) throw msgsRes.error;
        if (crisisRes.error) throw crisisRes.error;

        const dbLeaders = (leadersRes.data || []) as PastoralLeader[];
        const dbPersonas = (personasRes.data || []) as PastoralPersona[];
        const dbConvs = (convsRes.data || []) as PastoralConversation[];
        const dbMsgs = (msgsRes.data || []) as PastoralMessage[];
        const dbCrisis = (crisisRes.data || []) as PastoralCrisisEvent[];

        // Join messages to conversations
        const convsWithMsgs: ConversationWithMessages[] = dbConvs.map(conv => ({
          ...conv,
          messages: dbMsgs.filter(m => m.conversation_id === conv.id),
        }));

        setLeaders(dbLeaders);
        setPersonas(dbPersonas);
        setConversations(convsWithMsgs);
        setCrisisEvents(dbCrisis);

        // If no leaders exist yet, seed with sample data
        if (dbLeaders.length === 0) {
          const sampleDbLeaders = sampleLeaderProfiles.map(l => leaderToDb(l, effectiveChurchId));
          const sampleDbPersonas = samplePersonas.map(p => personaToDb(p, effectiveChurchId));
          setLeaders(sampleDbLeaders);
          setPersonas(sampleDbPersonas);
        }
      } catch (err) {
        console.error('Error loading pastoral care data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load pastoral care data');
        // Fall back to demo data
        setLeaders(sampleLeaderProfiles.map(l => leaderToDb(l, DEMO_CHURCH_ID)));
        setPersonas(samplePersonas.map(p => personaToDb(p, DEMO_CHURCH_ID)));
        setConversations([]);
        setCrisisEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [effectiveChurchId, isDemo]);

  // ==========================================
  // COMPUTED STATS
  // ==========================================
  const stats: PastoralStats = {
    activeCount: conversations.filter(c => c.status === 'active').length,
    crisisCount: conversations.filter(c => c.priority === 'crisis').length,
    waitingCount: conversations.filter(c => c.status === 'waiting').length,
    resolvedCount: conversations.filter(c => c.status === 'resolved').length,
    totalConversations: conversations.length,
    unresolvedCrisisEvents: crisisEvents.filter(c => !c.resolved).length,
  };

  // ==========================================
  // FRONTEND TYPE GETTERS
  // ==========================================
  const getLeaderProfiles = useCallback((): LeaderProfile[] => {
    return leaders.map(dbToLeader);
  }, [leaders]);

  const getAIPersonas = useCallback((): AIPersona[] => {
    return personas.map(dbToPersona);
  }, [personas]);

  // ==========================================
  // CREATE CONVERSATION
  // ==========================================
  const createConversation = useCallback(async (
    category: PastoralHelpCategory,
    description: string,
    isAnonymous: boolean,
    specificLeaderId?: string
  ): Promise<ConversationWithMessages | null> => {
    const leaderProfiles = leaders.map(dbToLeader);
    const aiPersonas = personas.map(dbToPersona);

    let leader: LeaderProfile | undefined;
    let persona: AIPersona | undefined;

    if (specificLeaderId) {
      leader = leaderProfiles.find(l => l.id === specificLeaderId);
      persona = aiPersonas.find(p => p.leaderId === specificLeaderId && p.isActive);
    } else {
      const match = matchLeaderToCategory(category, leaderProfiles, aiPersonas);
      if (!match) return null;
      leader = match.leader;
      persona = match.persona;
    }

    if (!leader || !persona) return null;

    const convId = `conv-${Date.now()}`;
    const anonymousId = isAnonymous ? `Helper-${Math.random().toString(36).slice(2, 6).toUpperCase()}` : null;

    const introMessage = description
      ? `Hi, I'm ${persona.name}. I see you'd like to talk about ${getCategoryLabel(category)}. Thank you for sharing that — "${description.slice(0, 100)}${description.length > 100 ? '...' : ''}"\n\nI'm here to listen. Let's start wherever feels right for you.`
      : `Hi, I'm ${persona.name}. I see you'd like to talk about ${getCategoryLabel(category)}.\n\nI'm here to listen and help however I can. What's on your mind?`;

    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newConv: ConversationWithMessages = {
        id: convId,
        church_id: DEMO_CHURCH_ID,
        persona_id: persona.id,
        leader_id: leader.id,
        category,
        description: description || null,
        status: 'active',
        priority: category === 'crisis' ? 'crisis' : 'medium',
        is_anonymous: isAnonymous,
        anonymous_id: anonymousId,
        person_id: null,
        created_at: now,
        updated_at: now,
        messages: [
          {
            id: `msg-${Date.now()}`,
            conversation_id: convId,
            sender: 'ai',
            sender_name: persona.name,
            content: introMessage,
            flagged: false,
            flag_reason: null,
            created_at: now,
          },
        ],
      };
      setConversations(prev => [newConv, ...prev]);
      return newConv;
    }

    // Supabase mode
    const convInsert: PastoralConversationInsert = {
      church_id: effectiveChurchId,
      persona_id: persona.id,
      leader_id: leader.id,
      category,
      description: description || null,
      status: 'active',
      priority: category === 'crisis' ? 'crisis' : 'medium',
      is_anonymous: isAnonymous,
      anonymous_id: anonymousId,
    };

    const { data: convData, error: convErr } = await supabase
      .from('pastoral_conversations')
      .insert(convInsert)
      .select()
      .single();

    if (convErr) throw convErr;
    const dbConv = convData as PastoralConversation;

    // Insert intro message
    const msgInsert: PastoralMessageInsert = {
      conversation_id: dbConv.id,
      sender: 'ai',
      sender_name: persona.name,
      content: introMessage,
    };

    const { data: msgData, error: msgErr } = await supabase
      .from('pastoral_messages')
      .insert(msgInsert)
      .select()
      .single();

    if (msgErr) throw msgErr;
    const dbMsg = msgData as PastoralMessage;

    const newConv: ConversationWithMessages = { ...dbConv, messages: [dbMsg] };
    setConversations(prev => [newConv, ...prev]);
    return newConv;
  }, [leaders, personas, effectiveChurchId, isDemo]);

  // ==========================================
  // ADD MESSAGE TO CONVERSATION
  // ==========================================
  const addMessage = useCallback(async (
    conversationId: string,
    sender: 'user' | 'ai' | 'leader',
    senderName: string,
    content: string,
    flagged: boolean = false,
    flagReason: string | null = null
  ): Promise<PastoralMessage | null> => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newMsg: PastoralMessage = {
        id: `msg-${Date.now()}-${sender}`,
        conversation_id: conversationId,
        sender,
        sender_name: senderName,
        content,
        flagged,
        flag_reason: flagReason,
        created_at: now,
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id !== conversationId) return conv;
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          priority: flagged ? 'crisis' as PastoralConversationPriority : conv.priority,
          updated_at: now,
        };
      }));

      return newMsg;
    }

    // Supabase mode
    const msgInsert: PastoralMessageInsert = {
      conversation_id: conversationId,
      sender,
      sender_name: senderName,
      content,
      flagged,
      flag_reason: flagReason,
    };

    const { data, error: err } = await supabase
      .from('pastoral_messages')
      .insert(msgInsert)
      .select()
      .single();

    if (err) throw err;
    const dbMsg = data as PastoralMessage;

    // Update conversation priority if crisis
    if (flagged) {
      await supabase
        .from('pastoral_conversations')
        .update({ priority: 'crisis', updated_at: now })
        .eq('id', conversationId);
    } else {
      await supabase
        .from('pastoral_conversations')
        .update({ updated_at: now })
        .eq('id', conversationId);
    }

    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;
      return {
        ...conv,
        messages: [...conv.messages, dbMsg],
        priority: flagged ? 'crisis' as PastoralConversationPriority : conv.priority,
        updated_at: now,
      };
    }));

    return dbMsg;
  }, [isDemo]);

  // ==========================================
  // UPDATE CONVERSATION STATUS
  // ==========================================
  const updateConversationStatus = useCallback(async (
    conversationId: string,
    status: PastoralConversationStatus
  ) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, status, updated_at: now } : conv
      ));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_conversations')
      .update({ status, updated_at: now })
      .eq('id', conversationId);

    if (err) throw err;

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, status, updated_at: now } : conv
    ));
  }, [isDemo]);

  // ==========================================
  // UPDATE CONVERSATION PRIORITY
  // ==========================================
  const updateConversationPriority = useCallback(async (
    conversationId: string,
    priority: PastoralConversationPriority
  ) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, priority, updated_at: now } : conv
      ));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_conversations')
      .update({ priority, updated_at: now })
      .eq('id', conversationId);

    if (err) throw err;

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, priority, updated_at: now } : conv
    ));
  }, [isDemo]);

  // ==========================================
  // LOG CRISIS EVENT
  // ==========================================
  const logCrisisEvent = useCallback(async (
    conversationId: string,
    messageId: string | null,
    severity: PastoralCrisisSeverity,
    matchedKeywords: string[]
  ) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newEvent: PastoralCrisisEvent = {
        id: `crisis-${Date.now()}`,
        church_id: DEMO_CHURCH_ID,
        conversation_id: conversationId,
        message_id: messageId,
        severity,
        matched_keywords: matchedKeywords,
        resolved: false,
        resolved_by: null,
        resolved_at: null,
        notes: null,
        created_at: now,
      };
      setCrisisEvents(prev => [newEvent, ...prev]);
      return newEvent;
    }

    const { data, error: err } = await supabase
      .from('pastoral_crisis_events')
      .insert({
        church_id: effectiveChurchId,
        conversation_id: conversationId,
        message_id: messageId,
        severity,
        matched_keywords: matchedKeywords,
      })
      .select()
      .single();

    if (err) throw err;
    const dbEvent = data as PastoralCrisisEvent;
    setCrisisEvents(prev => [dbEvent, ...prev]);
    return dbEvent;
  }, [effectiveChurchId, isDemo]);

  // ==========================================
  // RESOLVE CRISIS EVENT
  // ==========================================
  const resolveCrisisEvent = useCallback(async (
    eventId: string,
    notes?: string
  ) => {
    const now = new Date().toISOString();
    const updates = {
      resolved: true,
      resolved_at: now,
      notes: notes || null,
    };

    if (isDemo || !supabase) {
      setCrisisEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, ...updates } : e
      ));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_crisis_events')
      .update(updates)
      .eq('id', eventId);

    if (err) throw err;

    setCrisisEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, ...updates } : e
    ));
  }, [isDemo]);

  // ==========================================
  // REQUEST LIVE CONNECT
  // ==========================================
  const requestLiveConnect = useCallback(async (
    conversationId: string,
    leaderId: string
  ) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;

    const leaderName = leader.display_name;
    const systemMessage = leader.is_online
      ? `Great news — ${leaderName} is available right now! I've notified them about your conversation. They may join shortly. In the meantime, I'm still here if you'd like to keep talking.`
      : `${leaderName} is currently offline. I've sent them a notification, and they'll reach out as soon as they're available. Would you like to continue our conversation in the meantime?`;

    await addMessage(conversationId, 'ai', 'System', systemMessage);
    await updateConversationStatus(conversationId, 'waiting');
  }, [leaders, addMessage, updateConversationStatus]);

  // ==========================================
  // GET ANONYMOUS SESSION
  // ==========================================
  const getOrCreateAnonymousSession = useCallback(async (): Promise<{ anonymousId: string; sessionToken: string }> => {
    // Check for existing session in localStorage
    const existingToken = localStorage.getItem('pastoral_anonymous_session');
    if (existingToken) {
      if (!isDemo && supabase) {
        const { data } = await supabase
          .from('pastoral_anonymous_sessions')
          .select('*')
          .eq('session_token', existingToken)
          .single();

        if (data) {
          // Update last active
          await supabase
            .from('pastoral_anonymous_sessions')
            .update({ last_active_at: new Date().toISOString() })
            .eq('id', data.id);
          return { anonymousId: data.anonymous_id, sessionToken: existingToken };
        }
      } else {
        // Demo mode — extract from stored value
        const storedId = localStorage.getItem('pastoral_anonymous_id');
        if (storedId) return { anonymousId: storedId, sessionToken: existingToken };
      }
    }

    // Create new session
    const anonymousId = `Helper-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const sessionToken = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem('pastoral_anonymous_session', sessionToken);
    localStorage.setItem('pastoral_anonymous_id', anonymousId);

    if (!isDemo && supabase) {
      await supabase.from('pastoral_anonymous_sessions').insert({
        church_id: effectiveChurchId,
        anonymous_id: anonymousId,
        session_token: sessionToken,
      });
    }

    return { anonymousId, sessionToken };
  }, [effectiveChurchId, isDemo]);

  return {
    // State
    isLoading,
    error,
    isDemo,

    // Data
    leaders,
    personas,
    conversations,
    crisisEvents,
    stats,

    // Frontend type getters
    getLeaderProfiles,
    getAIPersonas,

    // Actions
    createConversation,
    addMessage,
    updateConversationStatus,
    updateConversationPriority,
    logCrisisEvent,
    resolveCrisisEvent,
    requestLiveConnect,
    getOrCreateAnonymousSession,
  };
}

// Helper
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'marriage': 'Marriage & Relationships',
    'addiction': 'Addiction & Recovery',
    'grief': 'Grief & Loss',
    'faith-questions': 'Faith & Questions',
    'anxiety-depression': 'Anxiety & Depression',
    'financial': 'Financial Struggles',
    'parenting': 'Parenting',
    'crisis': 'Crisis',
    'general': 'General Support',
  };
  return labels[category] || category;
}
