/**
 * Pastoral Care Routes
 *
 * API endpoints for the AI pastoral care system:
 * - Conversation management
 * - Message CRUD
 * - Crisis event tracking
 * - Anonymous session management
 * - Staff dashboard data
 */

import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// ============================================
// CONVERSATIONS
// ============================================

// GET /api/pastoral/conversations?church_id=xxx&status=active
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { church_id, status, priority, category, limit: limitParam } = req.query;

    if (!church_id) {
      return res.status(400).json({ error: 'church_id is required' });
    }

    let query = supabase
      .from('pastoral_conversations')
      .select('*')
      .eq('church_id', church_id)
      .order('updated_at', { ascending: false });

    if (status) query = query.eq('status', status as string);
    if (priority) query = query.eq('priority', priority as string);
    if (category) query = query.eq('category', category as string);
    if (limitParam) query = query.limit(parseInt(limitParam as string, 10));

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// POST /api/pastoral/conversations
router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { church_id, persona_id, leader_id, category, description, is_anonymous, anonymous_id, person_id } = req.body;

    if (!church_id || !category) {
      return res.status(400).json({ error: 'church_id and category are required' });
    }

    const { data, error } = await supabase
      .from('pastoral_conversations')
      .insert({
        church_id,
        persona_id,
        leader_id,
        category,
        description,
        status: 'active',
        priority: category === 'crisis' ? 'crisis' : 'medium',
        is_anonymous: is_anonymous || false,
        anonymous_id,
        person_id,
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// PATCH /api/pastoral/conversations/:id
router.patch('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('pastoral_conversations')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error updating conversation:', err);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
});

// ============================================
// MESSAGES
// ============================================

// GET /api/pastoral/conversations/:id/messages
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('pastoral_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at');

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/pastoral/conversations/:id/messages
router.post('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const { id: conversation_id } = req.params;
    const { sender, sender_name, content, flagged, flag_reason } = req.body;

    if (!sender || !sender_name || !content) {
      return res.status(400).json({ error: 'sender, sender_name, and content are required' });
    }

    const { data, error } = await supabase
      .from('pastoral_messages')
      .insert({
        conversation_id,
        sender,
        sender_name,
        content,
        flagged: flagged || false,
        flag_reason: flag_reason || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation timestamp
    await supabase
      .from('pastoral_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation_id);

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error creating message:', err);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// ============================================
// CRISIS EVENTS
// ============================================

// GET /api/pastoral/crisis-events?church_id=xxx&resolved=false
router.get('/crisis-events', async (req: Request, res: Response) => {
  try {
    const { church_id, resolved } = req.query;

    if (!church_id) {
      return res.status(400).json({ error: 'church_id is required' });
    }

    let query = supabase
      .from('pastoral_crisis_events')
      .select('*')
      .eq('church_id', church_id)
      .order('created_at', { ascending: false });

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching crisis events:', err);
    res.status(500).json({ error: 'Failed to fetch crisis events' });
  }
});

// POST /api/pastoral/crisis-events
router.post('/crisis-events', async (req: Request, res: Response) => {
  try {
    const { church_id, conversation_id, message_id, severity, matched_keywords } = req.body;

    if (!church_id || !conversation_id || !severity) {
      return res.status(400).json({ error: 'church_id, conversation_id, and severity are required' });
    }

    const { data, error } = await supabase
      .from('pastoral_crisis_events')
      .insert({
        church_id,
        conversation_id,
        message_id,
        severity,
        matched_keywords: matched_keywords || [],
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error creating crisis event:', err);
    res.status(500).json({ error: 'Failed to create crisis event' });
  }
});

// PATCH /api/pastoral/crisis-events/:id/resolve
router.patch('/crisis-events/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const { data, error } = await supabase
      .from('pastoral_crisis_events')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        notes: notes || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error resolving crisis event:', err);
    res.status(500).json({ error: 'Failed to resolve crisis event' });
  }
});

// ============================================
// STAFF DASHBOARD STATS
// ============================================

// GET /api/pastoral/stats?church_id=xxx
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { church_id } = req.query;

    if (!church_id) {
      return res.status(400).json({ error: 'church_id is required' });
    }

    const [activeRes, crisisRes, waitingRes, resolvedRes, totalRes, unresolvedCrisisRes] = await Promise.all([
      supabase.from('pastoral_conversations').select('id', { count: 'exact', head: true }).eq('church_id', church_id).eq('status', 'active'),
      supabase.from('pastoral_conversations').select('id', { count: 'exact', head: true }).eq('church_id', church_id).eq('priority', 'crisis'),
      supabase.from('pastoral_conversations').select('id', { count: 'exact', head: true }).eq('church_id', church_id).eq('status', 'waiting'),
      supabase.from('pastoral_conversations').select('id', { count: 'exact', head: true }).eq('church_id', church_id).eq('status', 'resolved'),
      supabase.from('pastoral_conversations').select('id', { count: 'exact', head: true }).eq('church_id', church_id),
      supabase.from('pastoral_crisis_events').select('id', { count: 'exact', head: true }).eq('church_id', church_id).eq('resolved', false),
    ]);

    res.json({
      success: true,
      data: {
        activeCount: activeRes.count || 0,
        crisisCount: crisisRes.count || 0,
        waitingCount: waitingRes.count || 0,
        resolvedCount: resolvedRes.count || 0,
        totalConversations: totalRes.count || 0,
        unresolvedCrisisEvents: unresolvedCrisisRes.count || 0,
      },
    });
  } catch (err) {
    console.error('Error fetching pastoral stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ============================================
// ANONYMOUS SESSIONS
// ============================================

// POST /api/pastoral/anonymous-sessions
router.post('/anonymous-sessions', async (req: Request, res: Response) => {
  try {
    const { church_id, anonymous_id, session_token } = req.body;

    if (!church_id || !anonymous_id || !session_token) {
      return res.status(400).json({ error: 'church_id, anonymous_id, and session_token are required' });
    }

    const { data, error } = await supabase
      .from('pastoral_anonymous_sessions')
      .insert({ church_id, anonymous_id, session_token })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error creating anonymous session:', err);
    res.status(500).json({ error: 'Failed to create anonymous session' });
  }
});

// GET /api/pastoral/anonymous-sessions/:token
router.get('/anonymous-sessions/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const { data, error } = await supabase
      .from('pastoral_anonymous_sessions')
      .select('*')
      .eq('session_token', token)
      .single();

    if (error) throw error;

    if (data) {
      // Update last active
      await supabase
        .from('pastoral_anonymous_sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', data.id);
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching anonymous session:', err);
    res.status(500).json({ error: 'Failed to fetch anonymous session' });
  }
});

export default router;
