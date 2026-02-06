-- ============================================
-- Phase 4: Pastoral Care — Ratings, Knowledge Base, Persona Refinement
-- ============================================

-- 1. Conversation Ratings & Feedback
CREATE TABLE IF NOT EXISTS pastoral_conversation_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id),
  conversation_id UUID NOT NULL REFERENCES pastoral_conversations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id)  -- one rating per conversation
);

ALTER TABLE pastoral_conversation_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Church isolation" ON pastoral_conversation_ratings
  USING (church_id = get_user_church_id());

CREATE INDEX idx_ratings_church ON pastoral_conversation_ratings(church_id);
CREATE INDEX idx_ratings_conversation ON pastoral_conversation_ratings(conversation_id);
CREATE INDEX idx_ratings_rating ON pastoral_conversation_ratings(rating);

-- 2. Knowledge Base — Documents/resources linked to personas
CREATE TABLE IF NOT EXISTS pastoral_knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id),
  leader_id UUID REFERENCES pastoral_leaders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  source_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'document', 'url', 'sermon'
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pastoral_knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Church isolation" ON pastoral_knowledge_base
  USING (church_id = get_user_church_id());

CREATE INDEX idx_kb_church ON pastoral_knowledge_base(church_id);
CREATE INDEX idx_kb_leader ON pastoral_knowledge_base(leader_id);
CREATE INDEX idx_kb_category ON pastoral_knowledge_base(category);
CREATE INDEX idx_kb_active ON pastoral_knowledge_base(is_active);

CREATE TRIGGER set_updated_at_kb
  BEFORE UPDATE ON pastoral_knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. Persona Corrections — Leader reviews/corrects AI responses
CREATE TABLE IF NOT EXISTS pastoral_persona_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id),
  persona_id UUID NOT NULL REFERENCES pastoral_personas(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES pastoral_messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES pastoral_conversations(id) ON DELETE CASCADE,
  original_response TEXT NOT NULL,
  corrected_response TEXT NOT NULL,
  correction_note TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'applied', 'dismissed'
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pastoral_persona_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Church isolation" ON pastoral_persona_corrections
  USING (church_id = get_user_church_id());

CREATE INDEX idx_corrections_church ON pastoral_persona_corrections(church_id);
CREATE INDEX idx_corrections_persona ON pastoral_persona_corrections(persona_id);
CREATE INDEX idx_corrections_status ON pastoral_persona_corrections(status);

-- 4. Smart Routing Log — Track routing decisions
CREATE TABLE IF NOT EXISTS pastoral_routing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id),
  conversation_id UUID NOT NULL REFERENCES pastoral_conversations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  selected_leader_id UUID REFERENCES pastoral_leaders(id),
  routing_reason TEXT,
  score NUMERIC,
  candidates JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE pastoral_routing_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Church isolation" ON pastoral_routing_log
  USING (church_id = get_user_church_id());

CREATE INDEX idx_routing_church ON pastoral_routing_log(church_id);
CREATE INDEX idx_routing_conversation ON pastoral_routing_log(conversation_id);

-- 5. Add average_rating to conversations for quick lookups
ALTER TABLE pastoral_conversations
  ADD COLUMN IF NOT EXISTS rating INTEGER,
  ADD COLUMN IF NOT EXISTS feedback TEXT;

-- 6. Notification preferences for leaders
ALTER TABLE pastoral_leaders
  ADD COLUMN IF NOT EXISTS notification_email TEXT,
  ADD COLUMN IF NOT EXISTS notification_phone TEXT,
  ADD COLUMN IF NOT EXISTS notify_on_escalation BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_on_crisis BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_on_new_conversation BOOLEAN DEFAULT false;
