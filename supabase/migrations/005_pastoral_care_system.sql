-- Pastoral Care System
-- AI-assisted pastoral support with leader management, crisis detection, and conversation tracking

-- ============================================
-- LEADER PROFILES
-- ============================================
CREATE TABLE leader_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES people(id) NOT NULL,
  display_name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  photo_url TEXT,
  expertise_areas TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leader_profiles_church ON leader_profiles(church_id);
CREATE INDEX idx_leader_profiles_person ON leader_profiles(person_id);
CREATE INDEX idx_leader_profiles_active ON leader_profiles(is_active, is_available);

-- ============================================
-- AI PERSONAS
-- ============================================
CREATE TABLE ai_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  leader_id UUID REFERENCES leader_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT '',
  tone JSONB NOT NULL DEFAULT '{"warmth": 7, "formality": 4, "directness": 5, "faithLevel": 6}',
  boundaries TEXT[] NOT NULL DEFAULT '{}',
  escalation_rules JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_personas_church ON ai_personas(church_id);
CREATE INDEX idx_ai_personas_leader ON ai_personas(leader_id);

-- ============================================
-- HELP REQUESTS (intake)
-- ============================================
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'marriage', 'addiction', 'grief', 'faith-questions',
    'crisis', 'financial', 'anxiety-depression', 'parenting', 'general'
  )),
  description TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  anonymous_id TEXT,
  person_id UUID REFERENCES people(id),
  assigned_leader_id UUID REFERENCES leader_profiles(id),
  assigned_persona_id UUID REFERENCES ai_personas(id),
  conversation_id UUID,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'crisis')),
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'sms', 'app', 'kiosk')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_help_requests_church ON help_requests(church_id);
CREATE INDEX idx_help_requests_status ON help_requests(status);
CREATE INDEX idx_help_requests_category ON help_requests(category);
CREATE INDEX idx_help_requests_priority ON help_requests(priority);
CREATE INDEX idx_help_requests_anonymous_id ON help_requests(anonymous_id);

-- ============================================
-- PASTORAL CONVERSATIONS
-- ============================================
CREATE TABLE pastoral_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  help_request_id UUID REFERENCES help_requests(id) ON DELETE CASCADE NOT NULL,
  persona_id UUID REFERENCES ai_personas(id),
  leader_id UUID REFERENCES leader_profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'escalated', 'resolved', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'crisis')),
  category TEXT NOT NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  anonymous_id TEXT,
  person_id UUID REFERENCES people(id),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_pastoral_conversations_church ON pastoral_conversations(church_id);
CREATE INDEX idx_pastoral_conversations_status ON pastoral_conversations(status);
CREATE INDEX idx_pastoral_conversations_priority ON pastoral_conversations(priority);
CREATE INDEX idx_pastoral_conversations_leader ON pastoral_conversations(leader_id);
CREATE INDEX idx_pastoral_conversations_persona ON pastoral_conversations(persona_id);

-- ============================================
-- CONVERSATION MESSAGES
-- ============================================
CREATE TABLE pastoral_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES pastoral_conversations(id) ON DELETE CASCADE NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai', 'leader')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  ai_confidence DECIMAL(3,2),
  flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastoral_messages_conversation ON pastoral_messages(conversation_id);
CREATE INDEX idx_pastoral_messages_created ON pastoral_messages(created_at);
CREATE INDEX idx_pastoral_messages_flagged ON pastoral_messages(flagged) WHERE flagged = true;

-- ============================================
-- CRISIS PROTOCOLS
-- ============================================
CREATE TABLE crisis_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  trigger_sentiment_threshold DECIMAL(3,2) DEFAULT 0.3,
  immediate_response TEXT NOT NULL DEFAULT '',
  resources JSONB NOT NULL DEFAULT '[]',
  notify_staff BOOLEAN NOT NULL DEFAULT true,
  notify_leader BOOLEAN NOT NULL DEFAULT true,
  escalate_immediately BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crisis_protocols_church ON crisis_protocols(church_id);
CREATE INDEX idx_crisis_protocols_active ON crisis_protocols(is_active);

-- ============================================
-- CRISIS ALERTS (logged incidents)
-- ============================================
CREATE TABLE crisis_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES pastoral_conversations(id) ON DELETE CASCADE NOT NULL,
  protocol_id UUID REFERENCES crisis_protocols(id),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'sentiment', 'manual', 'auto-detect')),
  trigger_detail TEXT,
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('medium', 'high', 'critical')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'false-positive')),
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crisis_alerts_church ON crisis_alerts(church_id);
CREATE INDEX idx_crisis_alerts_status ON crisis_alerts(status);
CREATE INDEX idx_crisis_alerts_severity ON crisis_alerts(severity);
CREATE INDEX idx_crisis_alerts_conversation ON crisis_alerts(conversation_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE leader_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoral_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_alerts ENABLE ROW LEVEL SECURITY;

-- Church isolation policies
CREATE POLICY leader_profiles_church_isolation ON leader_profiles
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY ai_personas_church_isolation ON ai_personas
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY help_requests_church_isolation ON help_requests
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY pastoral_conversations_church_isolation ON pastoral_conversations
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY pastoral_messages_church_isolation ON pastoral_messages
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY crisis_protocols_church_isolation ON crisis_protocols
  USING (church_id = current_setting('app.church_id')::UUID);

CREATE POLICY crisis_alerts_church_isolation ON crisis_alerts
  USING (church_id = current_setting('app.church_id')::UUID);
