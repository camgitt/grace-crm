-- GRACE CRM Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (for multi-tenant support)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  organization_id UUID REFERENCES organizations(id),
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff', 'volunteer')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- People (congregation members)
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'visitor' CHECK (status IN ('visitor', 'regular', 'member', 'leader', 'inactive')),
  photo TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  birth_date DATE,
  join_date DATE,
  first_visit DATE,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  small_groups TEXT[] DEFAULT '{}',
  family_id UUID,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks/Follow-ups
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  assigned_to UUID REFERENCES profiles(id),
  category TEXT DEFAULT 'follow-up' CHECK (category IN ('follow-up', 'care', 'admin', 'outreach')),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interactions (notes, calls, visits, etc.)
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('note', 'call', 'email', 'visit', 'text', 'prayer')),
  content TEXT NOT NULL,
  created_by TEXT NOT NULL,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Small Groups
CREATE TABLE small_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES people(id),
  meeting_day TEXT,
  meeting_time TEXT,
  location TEXT,
  members TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayer Requests
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  is_answered BOOLEAN DEFAULT FALSE,
  testimony TEXT,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communications (email/SMS log)
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
  subject TEXT,
  content TEXT NOT NULL,
  template_used TEXT,
  sent_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,
  location TEXT,
  category TEXT DEFAULT 'event' CHECK (category IN ('service', 'meeting', 'event', 'small-group', 'other')),
  attendees TEXT[] DEFAULT '{}',
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Giving/Donations
CREATE TABLE giving (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  fund TEXT DEFAULT 'tithe' CHECK (fund IN ('tithe', 'offering', 'missions', 'building', 'other')),
  date DATE NOT NULL,
  method TEXT DEFAULT 'cash' CHECK (method IN ('cash', 'check', 'card', 'online')),
  is_recurring BOOLEAN DEFAULT FALSE,
  note TEXT,
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Organization-scoped policies (users can only see data from their org)
CREATE POLICY "Users can view people in their org"
  ON people FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view tasks in their org"
  ON tasks FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view interactions in their org"
  ON interactions FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view groups in their org"
  ON small_groups FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view prayers in their org"
  ON prayer_requests FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view communications in their org"
  ON communications FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view events in their org"
  ON calendar_events FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view giving in their org"
  ON giving FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Indexes for better performance
CREATE INDEX idx_people_org ON people(organization_id);
CREATE INDEX idx_people_status ON people(status);
CREATE INDEX idx_tasks_org ON tasks(organization_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_interactions_person ON interactions(person_id);
CREATE INDEX idx_prayer_requests_person ON prayer_requests(person_id);
CREATE INDEX idx_communications_person ON communications(person_id);
