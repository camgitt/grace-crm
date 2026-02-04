# Grace CRM - Dashboard & Counseling System Plan

## Overview

Building a competitive church CRM feature set that provides:
1. **"Ask for Help"** - Intake flow routing people to the right counseling
2. **Verified Leaders** - Staff profiles with AI personas
3. **Character AI Chat** - Each leader has an AI that represents them
4. **Dashboard Automation** - Visibility into what AI handles daily

### Core Concept
> "Real people are behind the AI model" - The AI is an *extension* of real church leaders, not a replacement. It provides 24/7 availability while the human provides periodic live connection.

---

## Phase 1: Data Models & Database Schema

### New Types (`src/types.ts`)

```typescript
// Counseling/Help Categories
export type CounselingCategory =
  | 'marriage_family'      // Pre-marital, marriage issues, divorce recovery, parenting
  | 'addiction_recovery'   // Celebrate Recovery, AA, substance abuse
  | 'grief_loss'           // Bereavement, terminal illness support
  | 'mental_health'        // Anxiety, depression, wellness
  | 'financial'            // Stewardship, debt, budgeting
  | 'spiritual_growth'     // New believer, faith questions, discipleship
  | 'life_transitions'     // Retirement, career change, relocation
  | 'crisis'               // Emergency pastoral care
  | 'youth_young_adult';   // Mentoring, identity, relationships

// Verified Leader Profile
export interface VerifiedLeader {
  id: string;
  person_id: string;           // Links to existing Person
  person?: Person;             // Populated relation

  // Profile
  display_name: string;        // "Pastor Mike" or "Counselor Sarah"
  title: string;               // "Senior Pastor", "Recovery Minister"
  bio: string;                 // Their story and background
  credentials: string[];       // Certifications, training
  specialties: CounselingCategory[];

  // AI Configuration
  ai_persona_prompt: string;   // System prompt for their AI persona
  ai_knowledge_base: string;   // Specific guidance/teachings they provide
  ai_greeting: string;         // How their AI introduces itself

  // Availability
  availability_schedule: AvailabilitySlot[];
  is_available_live: boolean;  // Currently online for live chat
  max_active_cases: number;    // Capacity management
  current_case_count: number;

  // Media (future D-ID)
  avatar_url: string;
  video_avatar_id?: string;    // D-ID agent ID

  // Meta
  church_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlot {
  day_of_week: number;         // 0-6 (Sunday-Saturday)
  start_time: string;          // "09:00"
  end_time: string;            // "17:00"
  is_available: boolean;
}

// Help Request (Intake)
export interface HelpRequest {
  id: string;

  // Requester (anonymous or linked)
  is_anonymous: boolean;
  person_id?: string;          // If authenticated
  person?: Person;
  anonymous_name?: string;     // If anonymous
  anonymous_email?: string;
  anonymous_phone?: string;

  // Intake Data
  category: CounselingCategory;
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  intake_answers: IntakeAnswer[];
  summary: string;             // AI-generated summary

  // Routing
  assigned_leader_id?: string;
  assigned_leader?: VerifiedLeader;
  status: 'new' | 'in_review' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

  // Scheduling
  preferred_contact_method: 'chat' | 'phone' | 'video' | 'in_person';
  appointment_scheduled?: string;

  // Meta
  church_id: string;
  created_at: string;
  updated_at: string;
}

export interface IntakeAnswer {
  question_id: string;
  question_text: string;
  answer: string;
}

// Chat Session with Leader AI
export interface CounselingChat {
  id: string;
  help_request_id: string;
  leader_id: string;
  leader?: VerifiedLeader;

  // Participants
  person_id?: string;
  is_anonymous: boolean;

  // Chat State
  messages: ChatMessage[];
  is_live_person: boolean;     // Currently human vs AI
  started_at: string;
  last_message_at: string;
  ended_at?: string;

  // Meta
  church_id: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  is_from_live_person: boolean;  // True if human typed this
  timestamp: string;
  metadata?: {
    ai_model?: string;
    tokens_used?: number;
  };
}
```

### Database Tables (Supabase)

```sql
-- Verified Leaders
CREATE TABLE verified_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id),
  church_id UUID REFERENCES churches(id),

  display_name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  credentials TEXT[],
  specialties TEXT[],

  ai_persona_prompt TEXT,
  ai_knowledge_base TEXT,
  ai_greeting TEXT,

  availability_schedule JSONB DEFAULT '[]',
  is_available_live BOOLEAN DEFAULT false,
  max_active_cases INTEGER DEFAULT 10,
  current_case_count INTEGER DEFAULT 0,

  avatar_url TEXT,
  video_avatar_id TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Help Requests
CREATE TABLE help_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id),

  is_anonymous BOOLEAN DEFAULT false,
  person_id UUID REFERENCES people(id),
  anonymous_name TEXT,
  anonymous_email TEXT,
  anonymous_phone TEXT,

  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'medium',
  intake_answers JSONB DEFAULT '[]',
  summary TEXT,

  assigned_leader_id UUID REFERENCES verified_leaders(id),
  status TEXT DEFAULT 'new',

  preferred_contact_method TEXT DEFAULT 'chat',
  appointment_scheduled TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counseling Chats
CREATE TABLE counseling_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id),
  help_request_id UUID REFERENCES help_requests(id),
  leader_id UUID REFERENCES verified_leaders(id),

  person_id UUID REFERENCES people(id),
  is_anonymous BOOLEAN DEFAULT false,

  messages JSONB DEFAULT '[]',
  is_live_person BOOLEAN DEFAULT false,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Intake Questions (configurable per church)
CREATE TABLE intake_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID REFERENCES churches(id),
  category TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'text', -- text, select, multiselect, scale
  options JSONB, -- for select/multiselect
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);
```

---

## Phase 2: Ask for Help - Intake Flow

### Components to Build

```
/src/components/help/
  ├── AskForHelp.tsx           # Main entry point / landing
  ├── IntakeWizard.tsx         # Multi-step intake form
  ├── CategorySelector.tsx     # Visual category picker
  ├── IntakeQuestions.tsx      # Dynamic questions per category
  ├── UrgencySelector.tsx      # How urgent is this?
  ├── LeaderMatcher.tsx        # Shows matched leader(s)
  ├── ContactPreferences.tsx   # How to reach them
  └── HelpConfirmation.tsx     # Success + next steps
```

### Intake Flow UX

```
┌─────────────────────────────────────────────────────────┐
│                    ASK FOR HELP                         │
│                                                         │
│   "We're here for you. Let us connect you with         │
│    someone who can help."                               │
│                                                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │ 💒      │ │ 💔      │ │ 🩺      │ │ 💰      │      │
│   │Marriage │ │Recovery │ │ Grief   │ │Financial│      │
│   │& Family │ │         │ │ & Loss  │ │         │      │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│   │ 🧠      │ │ ✝️      │ │ 🔄      │ │ 🚨      │      │
│   │ Mental  │ │Spiritual│ │  Life   │ │ Crisis  │      │
│   │ Health  │ │ Growth  │ │Transit. │ │         │      │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│   [ ] I'd like to remain anonymous                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              TELL US A BIT MORE                         │
│                                                         │
│   Category: Marriage & Family                           │
│                                                         │
│   What best describes your situation?                   │
│   ○ Pre-marital counseling                              │
│   ○ Marriage difficulties                               │
│   ○ Divorce / separation                                │
│   ○ Parenting challenges                                │
│   ○ Blended family                                      │
│   ○ Other                                               │
│                                                         │
│   How long have you been dealing with this?             │
│   [________________________________]                    │
│                                                         │
│   Is there anything else you'd like us to know?         │
│   [________________________________]                    │
│                                                         │
│                              [Continue →]               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│              HOW URGENT IS THIS?                        │
│                                                         │
│   ┌─────────────────────────────────────────────┐      │
│   │ ○ Just exploring / not urgent               │      │
│   │   I'm looking for guidance when available   │      │
│   ├─────────────────────────────────────────────┤      │
│   │ ○ Moderate - would like help soon           │      │
│   │   Within the next week or two               │      │
│   ├─────────────────────────────────────────────┤      │
│   │ ○ High - need help quickly                  │      │
│   │   As soon as possible                       │      │
│   ├─────────────────────────────────────────────┤      │
│   │ ○ Crisis - need immediate support           │      │
│   │   I need to talk to someone now             │      │
│   └─────────────────────────────────────────────┘      │
│                                                         │
│   🚨 If you are in immediate danger, call 911          │
│   📞 National Crisis Hotline: 988                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│           WE FOUND SOMEONE FOR YOU                      │
│                                                         │
│   Based on your needs, we recommend:                    │
│                                                         │
│   ┌─────────────────────────────────────────────┐      │
│   │  [Photo]  Pastor Mike Thompson              │      │
│   │           Marriage & Family Minister        │      │
│   │           ● Available Now (AI)              │      │
│   │                                             │      │
│   │  "I've been helping couples for 15 years.  │      │
│   │   Let's work through this together."        │      │
│   │                                             │      │
│   │  Specialties: Marriage, Pre-marital,        │      │
│   │               Blended Families              │      │
│   │                                             │      │
│   │  [💬 Start Chat]  [📅 Book Appointment]    │      │
│   └─────────────────────────────────────────────┘      │
│                                                         │
│   ○ Show other available counselors                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Access Points

1. **Public Page**: `/help` - No login required, anonymous option
2. **Member Portal**: Dashboard widget "Need to talk?"
3. **Main Dashboard**: Quick action for staff to create on behalf of someone
4. **Kiosk Mode**: Simplified touch-friendly version for church terminals

---

## Phase 3: Verified Leader Profiles

### Components to Build

```
/src/components/leaders/
  ├── LeaderDirectory.tsx      # List of all verified leaders
  ├── LeaderCard.tsx           # Summary card with availability
  ├── LeaderProfile.tsx        # Full profile view
  ├── LeaderForm.tsx           # Create/edit leader profile
  ├── LeaderAvailability.tsx   # Schedule management
  ├── LeaderCaseload.tsx       # Active cases dashboard
  ├── LiveIndicator.tsx        # "Live Now" vs "AI Available"
  └── AIPersonaEditor.tsx      # Configure AI personality
```

### Leader Profile View

```
┌─────────────────────────────────────────────────────────┐
│  ← Back to Directory                                    │
│                                                         │
│  ┌──────────┐                                          │
│  │          │  Pastor Mike Thompson                     │
│  │  [Photo] │  Marriage & Family Minister               │
│  │          │  ● Live Now (in office until 5pm)        │
│  └──────────┘                                          │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  ABOUT                                                  │
│  Mike has served at Grace Church for 15 years,         │
│  specializing in marriage counseling and family        │
│  dynamics. He and his wife Sarah have been married     │
│  for 22 years and have 3 children.                     │
│                                                         │
│  CREDENTIALS                                            │
│  • Licensed Marriage & Family Therapist (LMFT)         │
│  • Prepare/Enrich Certified Facilitator                │
│  • 15 years pastoral counseling experience             │
│                                                         │
│  SPECIALTIES                                            │
│  [Marriage & Family] [Pre-marital] [Blended Families]  │
│                                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                         │
│  AVAILABILITY                                           │
│  Mon-Thu: 9am - 5pm                                    │
│  Friday: 9am - 12pm                                    │
│  Sunday: After services                                │
│                                                         │
│  [💬 Chat with Pastor Mike]  [📅 Book Appointment]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### AI Persona Configuration

For each leader, staff can configure:

```
┌─────────────────────────────────────────────────────────┐
│  AI PERSONA SETTINGS - Pastor Mike                      │
│                                                         │
│  Greeting Message:                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Hi, I'm Pastor Mike's AI assistant. While       │   │
│  │ Pastor Mike isn't available right now, I've     │   │
│  │ been trained on his approach and teachings to   │   │
│  │ help you. How can I support you today?          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Personality & Tone:                                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Warm, empathetic, direct but gentle. Uses       │   │
│  │ scripture thoughtfully. Asks clarifying         │   │
│  │ questions. Validates feelings before offering   │   │
│  │ guidance. Draws from 15 years of marriage       │   │
│  │ counseling experience.                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Knowledge Base / Teachings:                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Key principles Pastor Mike teaches:              │   │
│  │ - Communication is 80% of marriage success      │   │
│  │ - "Fight fair" rules: no name-calling, take     │   │
│  │   breaks when heated, always end with "I love   │   │
│  │   you"                                          │   │
│  │ - Weekly date nights are non-negotiable         │   │
│  │ - Pray together daily, even if briefly          │   │
│  │ ...                                             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Escalation Rules:                                      │
│  [x] Offer to schedule appointment after 10 messages   │
│  [x] Immediately escalate crisis/safety concerns       │
│  [x] Notify Pastor Mike of new conversations daily     │
│                                                         │
│  [Save AI Configuration]                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 4: AI Character Chat

### Components to Build

```
/src/components/chat/
  ├── CounselingChat.tsx       # Main chat interface
  ├── ChatWindow.tsx           # Message display area
  ├── ChatInput.tsx            # Message input with attachments
  ├── ChatMessage.tsx          # Individual message bubble
  ├── LivePersonBadge.tsx      # "AI" vs "Live" indicator
  ├── ChatHeader.tsx           # Leader info + status
  └── ChatActions.tsx          # Book appointment, end chat, etc.
```

### Chat Interface

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────┐  Pastor Mike Thompson                        │
│  │[img] │  Marriage & Family Minister                  │
│  └──────┘  🤖 AI Assistant Active                      │
│            ● Pastor Mike available live: Tue 2-5pm     │
│─────────────────────────────────────────────────────────│
│                                                         │
│        ┌────────────────────────────────────┐          │
│        │ Hi! I'm Pastor Mike's AI assistant.│          │
│        │ I've been trained on his approach  │          │
│        │ to help you. What's on your mind?  │          │
│        └────────────────────────────────────┘          │
│                                              🤖 2:30pm │
│                                                         │
│  ┌────────────────────────────────────┐                │
│  │ My wife and I have been arguing    │                │
│  │ a lot lately about finances...     │                │
│  └────────────────────────────────────┘                │
│  2:31pm                                                 │
│                                                         │
│        ┌────────────────────────────────────┐          │
│        │ I'm sorry to hear that. Financial │          │
│        │ stress is one of the most common  │          │
│        │ sources of conflict in marriages. │          │
│        │                                    │          │
│        │ Can you tell me more about what   │          │
│        │ specifically triggers these       │          │
│        │ arguments?                        │          │
│        └────────────────────────────────────┘          │
│                                              🤖 2:31pm │
│                                                         │
│─────────────────────────────────────────────────────────│
│  [Type a message...]                         [Send →]  │
│                                                         │
│  [📅 Book with Pastor Mike]  [📞 Request Call]        │
└─────────────────────────────────────────────────────────┘
```

### Live Person Takeover

When the real leader comes online:

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────┐  Pastor Mike Thompson                        │
│  │[img] │  Marriage & Family Minister                  │
│  └──────┘  👤 LIVE - Pastor Mike is here               │
│─────────────────────────────────────────────────────────│
│                                                         │
│  ════════════════════════════════════════════════════  │
│       👤 Pastor Mike has joined the conversation        │
│  ════════════════════════════════════════════════════  │
│                                                         │
│        ┌────────────────────────────────────┐          │
│        │ Hi there! I've been reading through│          │
│        │ your conversation. I'm glad you    │          │
│        │ reached out. Let me share some     │          │
│        │ thoughts on what you've described..│          │
│        └────────────────────────────────────┘          │
│                                              👤 3:15pm │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 5: Dashboard Automation Display

### New Dashboard Widget: "AI Automation Today"

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI AUTOMATION TODAY                    [View All →] │
│─────────────────────────────────────────────────────────│
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ 3 Birthday messages sent                     │   │
│  │    → John Smith, Mary Jones, Bob Wilson         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✅ 2 Donation thank-yous sent                   │   │
│  │    → $500 from The Smiths, $100 from Anonymous  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 💬 5 Counseling chats handled                   │   │
│  │    → 2 Marriage, 2 Spiritual, 1 Recovery        │   │
│  │    → 1 escalated to Pastor Mike                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📋 1 New help request routed                    │   │
│  │    → Anonymous → Addiction Recovery → Sarah J.  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Today's AI Stats:                                      │
│  Messages: 47  |  Chats: 5  |  Escalations: 1          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Agent Dashboard Enhancement

Add to existing `AgentDashboard.tsx`:
- Counseling chat agent status
- Help request routing stats
- Leader availability overview
- Escalation queue

---

## Phase 6: D-ID Video Integration (Future)

### Data Model Ready

The `video_avatar_id` field is ready for D-ID agent IDs.

### Future Implementation

```typescript
interface DIDConfig {
  agent_id: string;           // D-ID agent identifier
  voice_id: string;           // Selected voice
  idle_video_url: string;     // Video when not speaking
  knowledge_id?: string;      // D-ID knowledge base
}
```

### Integration Points

1. Replace chat avatar with video element
2. D-ID API for real-time video responses
3. Fallback to text if video unavailable
4. Cost management (video is expensive)

---

## Implementation Priority

### Sprint 1 (Foundation)
- [ ] Create database tables
- [ ] Add types to `types.ts`
- [ ] Create basic CRUD for verified leaders
- [ ] Create help request submission

### Sprint 2 (Intake Flow)
- [ ] Build `AskForHelp.tsx` landing
- [ ] Build `IntakeWizard.tsx` multi-step form
- [ ] Build `CategorySelector.tsx`
- [ ] Build leader matching algorithm
- [ ] Public route `/help`

### Sprint 3 (Leader Profiles)
- [ ] Build `LeaderDirectory.tsx`
- [ ] Build `LeaderProfile.tsx`
- [ ] Build `LeaderForm.tsx`
- [ ] Build `AIPersonaEditor.tsx`
- [ ] Build `LiveIndicator.tsx`

### Sprint 4 (AI Chat)
- [ ] Build `CounselingChat.tsx`
- [ ] Integrate Gemini with persona prompts
- [ ] Build live person takeover flow
- [ ] Build appointment booking from chat

### Sprint 5 (Dashboard & Polish)
- [ ] Build automation widget
- [ ] Enhance AgentDashboard
- [ ] Add analytics/reporting
- [ ] Mobile optimization

### Sprint 6+ (Future)
- [ ] D-ID video integration
- [ ] SMS chat support
- [ ] Group counseling chats
- [ ] AI-assisted case notes

---

## File Structure

```
/src
  /components
    /help
      AskForHelp.tsx
      IntakeWizard.tsx
      CategorySelector.tsx
      IntakeQuestions.tsx
      UrgencySelector.tsx
      LeaderMatcher.tsx
      ContactPreferences.tsx
      HelpConfirmation.tsx
    /leaders
      LeaderDirectory.tsx
      LeaderCard.tsx
      LeaderProfile.tsx
      LeaderForm.tsx
      LeaderAvailability.tsx
      LeaderCaseload.tsx
      LiveIndicator.tsx
      AIPersonaEditor.tsx
    /chat
      CounselingChat.tsx
      ChatWindow.tsx
      ChatInput.tsx
      ChatMessage.tsx
      LivePersonBadge.tsx
      ChatHeader.tsx
      ChatActions.tsx
  /lib
    /services
      counseling.ts          # Help request CRUD
      leaders.ts             # Leader CRUD
      counseling-chat.ts     # Chat management
    /agents
      CounselingAgent.ts     # AI chat agent
  /hooks
    useLeaders.ts
    useHelpRequests.ts
    useCounselingChat.ts
```

---

## Success Metrics

1. **Help Request Volume**: # of people using Ask for Help
2. **AI Resolution Rate**: % of chats resolved without human
3. **Escalation Rate**: % that need human intervention
4. **Response Time**: Time from request to first response
5. **Satisfaction**: Post-chat rating
6. **Appointment Conversion**: % that book with real person
7. **Leader Utilization**: Cases per leader capacity

---

## Competitive Differentiators

1. **24/7 AI availability** with human backup - no other church CRM
2. **Anonymous access** for sensitive topics
3. **Personalized AI personas** representing real leaders
4. **Intelligent routing** based on intake
5. **Live person indicators** showing when humans are available
6. **Future video avatars** via D-ID integration

This positions Grace CRM as the first church CRM with true AI-powered pastoral care.
