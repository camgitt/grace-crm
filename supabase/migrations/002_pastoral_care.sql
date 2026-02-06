-- PASTORAL CARE MODULE - Database Schema
-- Extends the Grace CRM schema with tables for AI-powered pastoral care

-- ============================================
-- PASTORAL LEADERS (Care team profiles)
-- ============================================
CREATE TABLE pastoral_leaders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL, -- Optional link to people table
  display_name VARCHAR(200) NOT NULL,
  title VARCHAR(200),
  bio TEXT,
  photo TEXT,
  expertise_areas TEXT[] DEFAULT '{}', -- HelpCategory values
  is_online BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_leaders_church ON pastoral_leaders(church_id);
CREATE INDEX idx_pastoral_leaders_active ON pastoral_leaders(church_id, is_active);

-- ============================================
-- PASTORAL PERSONAS (AI persona configurations)
-- ============================================
CREATE TABLE pastoral_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  leader_id UUID REFERENCES pastoral_leaders(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(200) NOT NULL,
  tone JSONB DEFAULT '{"warmth": 8, "formality": 3, "directness": 6, "humor": 4, "faithLevel": 7}',
  system_prompt TEXT NOT NULL,
  boundaries TEXT[] DEFAULT '{}',
  sample_responses JSONB DEFAULT '[]', -- Array of {scenario, response}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_personas_church ON pastoral_personas(church_id);
CREATE INDEX idx_pastoral_personas_leader ON pastoral_personas(leader_id);

-- ============================================
-- PASTORAL CONVERSATIONS
-- ============================================
CREATE TABLE pastoral_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  persona_id UUID REFERENCES pastoral_personas(id) ON DELETE SET NULL,
  leader_id UUID REFERENCES pastoral_leaders(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT, -- Initial description from intake
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, waiting, escalated, resolved, archived
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, crisis
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_id VARCHAR(100), -- e.g. "Helper-ABC123"
  person_id UUID REFERENCES people(id) ON DELETE SET NULL, -- If authenticated user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_conversations_church ON pastoral_conversations(church_id);
CREATE INDEX idx_pastoral_conversations_status ON pastoral_conversations(church_id, status);
CREATE INDEX idx_pastoral_conversations_priority ON pastoral_conversations(church_id, priority);
CREATE INDEX idx_pastoral_conversations_leader ON pastoral_conversations(leader_id);
CREATE INDEX idx_pastoral_conversations_category ON pastoral_conversations(church_id, category);

-- ============================================
-- PASTORAL MESSAGES (Individual chat messages)
-- ============================================
CREATE TABLE pastoral_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES pastoral_conversations(id) ON DELETE CASCADE NOT NULL,
  sender VARCHAR(20) NOT NULL, -- 'user', 'ai', 'leader'
  sender_name VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_messages_conversation ON pastoral_messages(conversation_id);
CREATE INDEX idx_pastoral_messages_flagged ON pastoral_messages(conversation_id, flagged) WHERE flagged = true;

-- ============================================
-- PASTORAL CRISIS EVENTS (Audit trail)
-- ============================================
CREATE TABLE pastoral_crisis_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES pastoral_conversations(id) ON DELETE CASCADE NOT NULL,
  message_id UUID REFERENCES pastoral_messages(id) ON DELETE SET NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'low', -- low, high
  matched_keywords TEXT[] DEFAULT '{}',
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_crisis_church ON pastoral_crisis_events(church_id);
CREATE INDEX idx_pastoral_crisis_unresolved ON pastoral_crisis_events(church_id, resolved) WHERE resolved = false;

-- ============================================
-- ANONYMOUS SESSIONS (For anonymous help seekers)
-- ============================================
CREATE TABLE pastoral_anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  anonymous_id VARCHAR(100) NOT NULL, -- Display ID like "Helper-ABC123"
  session_token VARCHAR(255) NOT NULL UNIQUE, -- Browser session token
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_pastoral_anon_session_token ON pastoral_anonymous_sessions(session_token);
CREATE INDEX idx_pastoral_anon_church ON pastoral_anonymous_sessions(church_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE pastoral_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Staff can manage their church's pastoral data
CREATE POLICY "Staff can manage pastoral leaders" ON pastoral_leaders
  FOR ALL USING (church_id = get_user_church_id());

CREATE POLICY "Staff can manage pastoral personas" ON pastoral_personas
  FOR ALL USING (church_id = get_user_church_id());

CREATE POLICY "Staff can manage pastoral conversations" ON pastoral_conversations
  FOR ALL USING (church_id = get_user_church_id());

CREATE POLICY "Staff can view pastoral messages" ON pastoral_messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM pastoral_conversations WHERE church_id = get_user_church_id()
    )
  );

CREATE POLICY "Staff can manage crisis events" ON pastoral_crisis_events
  FOR ALL USING (church_id = get_user_church_id());

CREATE POLICY "Staff can manage anonymous sessions" ON pastoral_anonymous_sessions
  FOR ALL USING (church_id = get_user_church_id());

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER update_pastoral_leaders_updated_at BEFORE UPDATE ON pastoral_leaders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pastoral_personas_updated_at BEFORE UPDATE ON pastoral_personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pastoral_conversations_updated_at BEFORE UPDATE ON pastoral_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
