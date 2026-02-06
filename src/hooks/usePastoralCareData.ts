import { useState, useEffect, useCallback, useRef } from 'react';
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
  PastoralKnowledgeBaseEntry,
  PastoralPersonaCorrection,
  PastoralConversationRating,
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
        // Load leaders, personas, conversations, and crisis events first
        const [leadersRes, personasRes, convsRes, crisisRes] = await Promise.all([
          supabase.from('pastoral_leaders').select('*').eq('church_id', effectiveChurchId).order('display_name'),
          supabase.from('pastoral_personas').select('*').eq('church_id', effectiveChurchId),
          supabase.from('pastoral_conversations').select('*').eq('church_id', effectiveChurchId).order('updated_at', { ascending: false }),
          supabase.from('pastoral_crisis_events').select('*').eq('church_id', effectiveChurchId).order('created_at', { ascending: false }),
        ]);

        if (leadersRes.error) throw leadersRes.error;
        if (personasRes.error) throw personasRes.error;
        if (convsRes.error) throw convsRes.error;
        if (crisisRes.error) throw crisisRes.error;

        const dbLeaders = (leadersRes.data || []) as PastoralLeader[];
        const dbPersonas = (personasRes.data || []) as PastoralPersona[];
        const dbConvs = (convsRes.data || []) as PastoralConversation[];
        const dbCrisis = (crisisRes.data || []) as PastoralCrisisEvent[];

        // Load messages filtered by conversation IDs (avoid loading all messages globally)
        const convIds = dbConvs.map(c => c.id);
        let dbMsgs: PastoralMessage[] = [];
        if (convIds.length > 0) {
          const msgsRes = await supabase
            .from('pastoral_messages')
            .select('*')
            .in('conversation_id', convIds)
            .order('created_at');
          if (msgsRes.error) throw msgsRes.error;
          dbMsgs = (msgsRes.data || []) as PastoralMessage[];
        }

        // Join messages to conversations
        const convsWithMsgs: ConversationWithMessages[] = dbConvs.map(conv => ({
          ...conv,
          messages: dbMsgs.filter(m => m.conversation_id === conv.id),
        }));

        setLeaders(dbLeaders);
        setPersonas(dbPersonas);
        setConversations(convsWithMsgs);
        setCrisisEvents(dbCrisis);

        // If no leaders exist yet, seed with sample data and persist to Supabase
        if (dbLeaders.length === 0) {
          const sampleDbLeaders = sampleLeaderProfiles.map(l => leaderToDb(l, effectiveChurchId));
          const sampleDbPersonas = samplePersonas.map(p => personaToDb(p, effectiveChurchId));
          setLeaders(sampleDbLeaders);
          setPersonas(sampleDbPersonas);

          // Persist seed data to Supabase so it's available on next load
          if (supabase) {
            await supabase.from('pastoral_leaders').insert(sampleDbLeaders).select();
            await supabase.from('pastoral_personas').insert(sampleDbPersonas).select();
          }
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

  // ==========================================
  // POLLING — Real-time conversation updates
  // ==========================================
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pollingEnabled, setPollingEnabled] = useState(false);
  const [pollingConversationId, setPollingConversationId] = useState<string | null>(null);

  // Poll a specific conversation for new messages (from leader takeover)
  const pollConversation = useCallback(async (conversationId: string) => {
    if (isDemo || !supabase) return;

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const lastMsgTime = conv.messages.length > 0
      ? conv.messages[conv.messages.length - 1].created_at
      : conv.created_at;

    const { data: newMsgs } = await supabase
      .from('pastoral_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .gt('created_at', lastMsgTime)
      .order('created_at');

    if (newMsgs && newMsgs.length > 0) {
      const typedMsgs = newMsgs as PastoralMessage[];
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        // Deduplicate by message ID
        const existingIds = new Set(c.messages.map(m => m.id));
        const genuinelyNew = typedMsgs.filter(m => !existingIds.has(m.id));
        if (genuinelyNew.length === 0) return c;
        return { ...c, messages: [...c.messages, ...genuinelyNew], updated_at: new Date().toISOString() };
      }));
    }

    // Also check for status changes
    const { data: convData } = await supabase
      .from('pastoral_conversations')
      .select('status, priority')
      .eq('id', conversationId)
      .single();

    if (convData) {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        if (c.status !== convData.status || c.priority !== convData.priority) {
          return { ...c, status: convData.status, priority: convData.priority };
        }
        return c;
      }));
    }
  }, [conversations, isDemo]);

  // Start/stop polling for a conversation
  const startPolling = useCallback((conversationId: string, intervalMs: number = 5000) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setPollingConversationId(conversationId);
    setPollingEnabled(true);
    pollingRef.current = setInterval(() => {
      pollConversation(conversationId);
    }, intervalMs);
  }, [pollConversation]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setPollingEnabled(false);
    setPollingConversationId(null);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // ==========================================
  // LEADER TAKEOVER — Leader joins AI conversation
  // ==========================================
  const leaderTakeover = useCallback(async (
    conversationId: string,
    leaderId: string
  ) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;

    const leaderName = leader.display_name;

    // Add system message announcing the leader
    await addMessage(
      conversationId,
      'leader',
      leaderName,
      `Hi, this is ${leaderName}. I've joined this conversation and I'm here to help you personally. Feel free to continue sharing — I've reviewed the conversation so far.`
    );

    // Update status to escalated
    await updateConversationStatus(conversationId, 'escalated');

    // Start polling so the user sees leader messages in real-time
    startPolling(conversationId, 3000);
  }, [leaders, addMessage, updateConversationStatus, startPolling]);

  // Leader sends a message in a takeover
  const leaderSendMessage = useCallback(async (
    conversationId: string,
    leaderId: string,
    content: string
  ) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return null;
    return addMessage(conversationId, 'leader', leader.display_name, content);
  }, [leaders, addMessage]);

  // ==========================================
  // FOLLOW-UP SYSTEM — Automated check-in
  // ==========================================
  const scheduleFollowUp = useCallback(async (
    conversationId: string,
    delayHours: number = 24,
    message?: string
  ) => {
    const now = new Date();
    const followUpAt = new Date(now.getTime() + delayHours * 60 * 60 * 1000);

    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const persona = personas.find(p => p.id === conv.persona_id);
    const personaName = persona ? persona.name : 'Your Care Team';
    const followUpMsg = message || `Hi, this is ${personaName} checking in. It's been a little while since we talked, and I wanted to see how you're doing. Is there anything you'd like to talk about?`;

    // In demo mode, just add the message immediately (simulated)
    if (isDemo || !supabase) {
      await addMessage(conversationId, 'ai', personaName, followUpMsg);
      return { scheduledFor: followUpAt.toISOString(), conversationId };
    }

    // In production, store the follow-up in conversation metadata
    // For now, add the message (a real implementation would use a job queue)
    await addMessage(conversationId, 'ai', personaName, followUpMsg);
    return { scheduledFor: followUpAt.toISOString(), conversationId };
  }, [conversations, personas, isDemo, addMessage]);

  // ==========================================
  // SCHEDULE APPOINTMENT from chat
  // ==========================================
  const scheduleAppointment = useCallback(async (
    conversationId: string,
    leaderId: string,
    dateTime: string,
    notes?: string
  ) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;

    const leaderName = leader.display_name;
    const formattedDate = new Date(dateTime).toLocaleString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const confirmMsg = `An appointment has been scheduled with ${leaderName} for ${formattedDate}.${notes ? ` Note: ${notes}` : ''}\n\nYou'll receive a reminder before the appointment. ${leaderName} is looking forward to connecting with you.`;

    await addMessage(conversationId, 'ai', 'System', confirmMsg);

    // In a full implementation, this would create a calendar event
    // and send notifications. For now, it's a confirmation message.
    return {
      conversationId,
      leaderId,
      dateTime,
      notes,
      confirmed: true,
    };
  }, [leaders, addMessage]);

  // ==========================================
  // PHASE 4 — CONVERSATION RATINGS
  // ==========================================
  const [ratings, setRatings] = useState<PastoralConversationRating[]>([]);

  const submitRating = useCallback(async (
    conversationId: string,
    rating: number,
    feedback: string = '',
    wouldRecommend: boolean = true
  ) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newRating: PastoralConversationRating = {
        id: `rating-${Date.now()}`,
        church_id: DEMO_CHURCH_ID,
        conversation_id: conversationId,
        rating,
        feedback: feedback || null,
        would_recommend: wouldRecommend,
        created_at: now,
      };
      setRatings(prev => [...prev, newRating]);
      // Also update conversation's inline rating
      setConversations(prev => prev.map(c =>
        c.id === conversationId ? { ...c, rating, feedback: feedback || null } : c
      ));
      return newRating;
    }

    const { data, error: err } = await supabase
      .from('pastoral_conversation_ratings')
      .insert({
        church_id: effectiveChurchId,
        conversation_id: conversationId,
        rating,
        feedback: feedback || null,
        would_recommend: wouldRecommend,
      })
      .select()
      .single();

    if (err) throw err;
    const dbRating = data as PastoralConversationRating;
    setRatings(prev => [...prev, dbRating]);

    // Update conversation inline
    await supabase
      .from('pastoral_conversations')
      .update({ rating, feedback: feedback || null })
      .eq('id', conversationId);

    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, rating, feedback: feedback || null } : c
    ));

    return dbRating;
  }, [effectiveChurchId, isDemo]);

  // ==========================================
  // PHASE 4 — KNOWLEDGE BASE CRUD
  // ==========================================
  const [knowledgeBase, setKnowledgeBase] = useState<PastoralKnowledgeBaseEntry[]>([]);

  const loadKnowledgeBase = useCallback(async () => {
    if (isDemo || !supabase) return;
    const { data } = await supabase
      .from('pastoral_knowledge_base')
      .select('*')
      .eq('church_id', effectiveChurchId)
      .order('updated_at', { ascending: false });
    if (data) setKnowledgeBase(data as PastoralKnowledgeBaseEntry[]);
  }, [effectiveChurchId, isDemo]);

  const addKnowledgeEntry = useCallback(async (entry: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    sourceType?: string;
    sourceUrl?: string;
    leaderId?: string | null;
  }) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newEntry: PastoralKnowledgeBaseEntry = {
        id: `kb-${Date.now()}`,
        church_id: DEMO_CHURCH_ID,
        leader_id: entry.leaderId || null,
        title: entry.title,
        content: entry.content,
        category: entry.category || 'general',
        tags: entry.tags || [],
        source_type: (entry.sourceType || 'text') as PastoralKnowledgeBaseEntry['source_type'],
        source_url: entry.sourceUrl || null,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      setKnowledgeBase(prev => [newEntry, ...prev]);
      return newEntry;
    }

    const { data, error: err } = await supabase
      .from('pastoral_knowledge_base')
      .insert({
        church_id: effectiveChurchId,
        leader_id: entry.leaderId || null,
        title: entry.title,
        content: entry.content,
        category: entry.category || 'general',
        tags: entry.tags || [],
        source_type: entry.sourceType || 'text',
        source_url: entry.sourceUrl || null,
      })
      .select()
      .single();

    if (err) throw err;
    const dbEntry = data as PastoralKnowledgeBaseEntry;
    setKnowledgeBase(prev => [dbEntry, ...prev]);
    return dbEntry;
  }, [effectiveChurchId, isDemo]);

  const updateKnowledgeEntry = useCallback(async (id: string, updates: Partial<PastoralKnowledgeBaseEntry>) => {
    if (isDemo || !supabase) {
      setKnowledgeBase(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_knowledge_base')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (err) throw err;
    setKnowledgeBase(prev => prev.map(e => e.id === id ? { ...e, ...updates, updated_at: new Date().toISOString() } : e));
  }, [isDemo]);

  const deleteKnowledgeEntry = useCallback(async (id: string) => {
    if (isDemo || !supabase) {
      setKnowledgeBase(prev => prev.filter(e => e.id !== id));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_knowledge_base')
      .delete()
      .eq('id', id);

    if (err) throw err;
    setKnowledgeBase(prev => prev.filter(e => e.id !== id));
  }, [isDemo]);

  // ==========================================
  // PHASE 4 — PERSONA CORRECTIONS
  // ==========================================
  const [corrections, setCorrections] = useState<PastoralPersonaCorrection[]>([]);

  const submitCorrection = useCallback(async (
    personaId: string,
    messageId: string,
    conversationId: string,
    originalResponse: string,
    correctedResponse: string,
    correctionNote?: string
  ) => {
    const now = new Date().toISOString();

    if (isDemo || !supabase) {
      const newCorrection: PastoralPersonaCorrection = {
        id: `corr-${Date.now()}`,
        church_id: DEMO_CHURCH_ID,
        persona_id: personaId,
        message_id: messageId,
        conversation_id: conversationId,
        original_response: originalResponse,
        corrected_response: correctedResponse,
        correction_note: correctionNote || null,
        status: 'pending',
        reviewed_by: null,
        created_at: now,
      };
      setCorrections(prev => [newCorrection, ...prev]);
      return newCorrection;
    }

    const { data, error: err } = await supabase
      .from('pastoral_persona_corrections')
      .insert({
        church_id: effectiveChurchId,
        persona_id: personaId,
        message_id: messageId,
        conversation_id: conversationId,
        original_response: originalResponse,
        corrected_response: correctedResponse,
        correction_note: correctionNote || null,
      })
      .select()
      .single();

    if (err) throw err;
    const dbCorr = data as PastoralPersonaCorrection;
    setCorrections(prev => [dbCorr, ...prev]);
    return dbCorr;
  }, [effectiveChurchId, isDemo]);

  const updateCorrectionStatus = useCallback(async (
    correctionId: string,
    status: 'applied' | 'dismissed',
    reviewedBy?: string
  ) => {
    if (isDemo || !supabase) {
      setCorrections(prev => prev.map(c =>
        c.id === correctionId ? { ...c, status, reviewed_by: reviewedBy || null } : c
      ));
      return;
    }

    const { error: err } = await supabase
      .from('pastoral_persona_corrections')
      .update({ status, reviewed_by: reviewedBy || null })
      .eq('id', correctionId);

    if (err) throw err;
    setCorrections(prev => prev.map(c =>
      c.id === correctionId ? { ...c, status, reviewed_by: reviewedBy || null } : c
    ));
  }, [isDemo]);

  // ==========================================
  // PHASE 4 — SMART ROUTING
  // ==========================================
  const smartRouteConversation = useCallback((
    category: PastoralHelpCategory
  ): { leaderId: string; personaId: string; score: number; reason: string } | null => {
    const leaderProfiles = leaders.map(dbToLeader);
    const aiPersonas = personas.map(dbToPersona);

    // Score each leader based on expertise, availability, workload
    const candidates = leaderProfiles
      .filter(l => l.isActive)
      .map(leader => {
        let score = 0;
        const reasons: string[] = [];

        // Expertise match (0-40 points)
        if (leader.expertiseAreas.includes(category)) {
          score += 40;
          reasons.push('expertise match');
        }

        // Online status (0-30 points)
        if (leader.isOnline) {
          score += 30;
          reasons.push('currently online');
        } else if (leader.lastSeenAt) {
          const hoursSinceSeen = (Date.now() - new Date(leader.lastSeenAt).getTime()) / (1000 * 60 * 60);
          if (hoursSinceSeen < 1) { score += 20; reasons.push('recently active'); }
          else if (hoursSinceSeen < 4) { score += 10; reasons.push('active today'); }
        }

        // Workload (0-20 points — fewer active convos = higher score)
        const activeConvs = conversations.filter(c =>
          c.leader_id === leader.id && (c.status === 'active' || c.status === 'escalated')
        ).length;
        const workloadScore = Math.max(0, 20 - activeConvs * 5);
        score += workloadScore;
        if (activeConvs === 0) reasons.push('no active conversations');
        else reasons.push(`${activeConvs} active conversations`);

        // Has active persona (required)
        const persona = aiPersonas.find(p => p.leaderId === leader.id && p.isActive);
        if (!persona) return null;

        return {
          leaderId: leader.id,
          personaId: persona.id,
          score,
          reason: reasons.join(', '),
        };
      })
      .filter(Boolean) as { leaderId: string; personaId: string; score: number; reason: string }[];

    if (candidates.length === 0) return null;

    // Sort by score desc
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }, [leaders, personas, conversations]);

  // ==========================================
  // PHASE 4 — NOTIFICATION SYSTEM
  // ==========================================
  const sendLeaderNotification = useCallback(async (
    leaderId: string,
    type: 'escalation' | 'crisis' | 'new_conversation',
    conversationId: string,
    message: string
  ) => {
    const leader = leaders.find(l => l.id === leaderId);
    if (!leader) return;

    // In demo mode, just log
    if (isDemo || !supabase) {
      console.log(`[Notification] ${type} to ${leader.display_name}: ${message}`);
      return { sent: true, type, leaderId };
    }

    // Check leader notification preferences
    const { data: leaderData } = await supabase
      .from('pastoral_leaders')
      .select('notification_email, notification_phone, notify_on_escalation, notify_on_crisis, notify_on_new_conversation')
      .eq('id', leaderId)
      .single();

    if (!leaderData) return { sent: false, reason: 'leader not found' };

    const shouldNotify =
      (type === 'escalation' && leaderData.notify_on_escalation) ||
      (type === 'crisis' && leaderData.notify_on_crisis) ||
      (type === 'new_conversation' && leaderData.notify_on_new_conversation);

    if (!shouldNotify) return { sent: false, reason: 'notifications disabled for this type' };

    // Send email notification via existing email API
    if (leaderData.notification_email) {
      try {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: leaderData.notification_email,
            subject: type === 'crisis'
              ? '🚨 Crisis Alert — Pastoral Care'
              : type === 'escalation'
                ? 'Conversation Escalated — Pastoral Care'
                : 'New Conversation — Pastoral Care',
            body: message,
            metadata: { conversationId, type },
          }),
        });
      } catch (err) {
        console.error('Failed to send email notification:', err);
      }
    }

    // Send SMS notification via existing SMS API
    if (leaderData.notification_phone) {
      try {
        await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: leaderData.notification_phone,
            message: `[Grace CRM] ${message}`,
          }),
        });
      } catch (err) {
        console.error('Failed to send SMS notification:', err);
      }
    }

    return { sent: true, type, leaderId };
  }, [leaders, isDemo]);

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
    ratings,
    knowledgeBase,
    corrections,

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

    // Phase 3 — Live Experience
    startPolling,
    stopPolling,
    pollingEnabled,
    pollingConversationId,
    leaderTakeover,
    leaderSendMessage,
    scheduleFollowUp,
    scheduleAppointment,

    // Phase 4 — Ratings
    submitRating,

    // Phase 4 — Knowledge Base
    loadKnowledgeBase,
    addKnowledgeEntry,
    updateKnowledgeEntry,
    deleteKnowledgeEntry,

    // Phase 4 — Persona Corrections
    submitCorrection,
    updateCorrectionStatus,

    // Phase 4 — Smart Routing
    smartRouteConversation,

    // Phase 4 — Notifications
    sendLeaderNotification,
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
