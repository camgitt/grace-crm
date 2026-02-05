# Implementation Plan: AI Pastoral Care Characters

Ordered from easy to hard. Each step is self-contained — the app works after every step.

---

## Step 1: Add Types (Zero Risk)

**What:** Add pastoral care types to `src/types.ts` and `src/lib/agents/types.ts`
**Risk:** None — just adding new types, nothing references them yet
**Files touched:** `src/types.ts`, `src/lib/agents/types.ts`

```
Add to src/types.ts:
  - HelpCategory type (marriage, addiction, grief, etc.)
  - LeaderProfile interface (extends Person with expertise, bio, specialties)
  - AIPersona interface (system prompt, tone, boundaries)
  - PersonaTone interface (warmth, formality, directness, humor, faithLevel sliders)
  - HelpRequest interface (category, anonymous flag, assigned persona)
  - Conversation interface (messages, status, metadata)
  - ConversationMessage interface (sender, content, timestamp)
  - CrisisProtocol interface (keywords, resources, immediate response)

Add to src/lib/agents/types.ts:
  - PastoralCareConfig (extends AgentConfig)

Add to View type:
  - 'pastoral-care' | 'help-intake' | 'conversations' | 'leader-profiles'
```

**Why first:** Everything else depends on these types. Adding them changes zero behavior.

---

## Step 2: Sample Data & State (Zero Risk)

**What:** Create sample leader profiles and personas in a data file, add state to App.tsx
**Risk:** None — mock data file, state variables with no UI yet
**Files touched:** New file `src/data/pastoralCareData.ts`, `src/App.tsx` (add state)

```
Create src/data/pastoralCareData.ts:
  - 3-4 sample LeaderProfiles (Pastor Mike, Sarah J., etc.)
  - Matching AIPersonas with system prompts and tone configs
  - Sample HelpCategories with icons and descriptions
  - Sample CrisisProtocol with keywords and resources

Add to App.tsx:
  - useState for leaderProfiles, conversations, helpRequests
  - Initialize with sample data
  - Pass down as props (but nothing renders them yet)
```

**Why second:** We need data to test components. Mock data lets us build UI without a backend.

---

## Step 3: Leader Profile Cards (Low Risk)

**What:** Create LeaderProfileCard component + LeaderProfileList view
**Risk:** Low — new components, only wired in when we add the route
**Files touched:** New files only

```
Create src/components/pastoral/LeaderProfileCard.tsx:
  - Photo, name, title, expertise tags
  - Online/offline indicator (green dot vs gray)
  - "Chat Now" button
  - Specialties badges (Marriage, Recovery, Faith, etc.)
  - Uses existing UI patterns (StatusBadge, card styles)

Create src/components/pastoral/LeaderProfileList.tsx:
  - Grid of LeaderProfileCards
  - Filter by specialty
  - Search by name
  - Header: "Our Care Team" or "Talk to Someone"
```

**Pattern to follow:** Similar to how PeopleList renders Person cards.

---

## Step 4: Wire Into Sidebar + Router (Low Risk)

**What:** Add "Pastoral Care" to sidebar nav, wire views in ViewRenderer
**Risk:** Low — adding a menu item and switch cases, doesn't change existing views
**Files touched:** `src/components/Layout.tsx`, `src/components/ViewRenderer.tsx`

```
Layout.tsx:
  - Add to navItems: { view: 'pastoral-care', label: 'Care', icon: <Heart /> }
  - Add to viewLabels: 'pastoral-care': 'Pastoral Care', etc.
  - Add breadcrumb logic for sub-views

ViewRenderer.tsx:
  - Lazy import LeaderProfileList
  - Add case 'pastoral-care': render LeaderProfileList
  - Add case 'leader-profiles': render LeaderProfileList (same for now)
```

**Milestone: After this step, you can click "Care" in sidebar and see leader cards.**

---

## Step 5: Help Intake Form (Low Risk)

**What:** "Ask for Help" category selector + optional description
**Risk:** Low — new component, standalone
**Files touched:** New file `src/components/pastoral/HelpIntakeForm.tsx`

```
Create src/components/pastoral/HelpIntakeForm.tsx:
  - Category grid (6-8 cards with icons): Marriage, Addiction, Grief, etc.
  - Optional text area: "Tell us more (optional)"
  - Anonymous checkbox
  - "Start Conversation" button
  - Crisis category → immediate safety message with 988 hotline
  - On submit: creates HelpRequest → routes to matched AI persona
  - Clean, calming design (soft colors, no harsh UI)
```

**Wire in ViewRenderer:**
```
case 'help-intake': return <HelpIntakeForm onSubmit={...} onStartChat={...} />
```

**Milestone: User can select "I need help with marriage" and get routed.**

---

## Step 6: Character Chat Component (Medium Risk)

**What:** Persona-aware chat window — the core feature
**Risk:** Medium — adapts existing AIAssistant pattern, calls AI service with new prompts
**Files touched:** New file `src/components/pastoral/CharacterChat.tsx`, `src/lib/services/ai.ts`

```
Create src/components/pastoral/CharacterChat.tsx:
  - ADAPT (don't copy) the AIAssistant.tsx pattern
  - Header: persona photo, name, "AI Assistant for [Leader Name]"
  - Online indicator if real leader is available
  - Message bubbles (user on right, AI on left)
  - AI disclaimer footer: "This is an AI trained on [Leader]'s approach"
  - "Connect with real person" button always visible
  - Loading states, scroll-to-bottom, input with send button
  - On send: build persona-aware prompt → call generateAIText → display response

Add to src/lib/services/ai.ts:
  - generatePersonaResponse(persona, conversationHistory, userMessage)
  - Builds system prompt from persona config (tone, boundaries, knowledge)
  - Includes conversation history for context
  - Returns AI response with confidence score
```

**The prompt engineering is the key.** Example system prompt structure:
```
You are an AI assistant representing [Leader Name], a [title] at [Church].
Your tone is: [warm/formal/direct based on sliders]
Your expertise areas: [marriage counseling, addiction recovery, etc.]
Your approach: [sample responses from calibration]

RULES:
- You are transparent that you are AI, not the real person
- Never diagnose, prescribe, or act as a therapist
- If the person mentions [crisis keywords], immediately provide safety resources
- If you're unsure how [Leader Name] would respond, say so and offer to connect them
- Stay within these topics: [boundaries]
```

**Milestone: User can chat with "Pastor Mike's AI" and get persona-specific responses.**

---

## Step 7: Intake → Chat Flow (Medium Risk)

**What:** Connect the intake form to the chat — full user journey
**Risk:** Medium — wiring state across components, routing between views
**Files touched:** `src/App.tsx`, `src/components/ViewRenderer.tsx`, intake + chat components

```
Flow:
  1. User clicks "Care" in sidebar → sees LeaderProfileList
  2. User clicks "Ask for Help" or picks a leader → HelpIntakeForm
  3. User selects category → system picks best-matched persona
  4. Submit → creates HelpRequest + Conversation in state
  5. Redirects to CharacterChat with the matched persona
  6. Chat messages stored in conversation state
  7. "Back" button returns to leader list

Add to App.tsx:
  - handleStartHelpRequest(category, description, isAnonymous)
  - handleSendCareMessage(conversationId, content)
  - Wire these through ViewRenderer props

Routing logic:
  - Match category → leader with that expertise
  - If multiple matches, pick first available (or random for now)
  - Store active conversation ID in state
```

**Milestone: Full journey from "I need help" → category → AI chat works end-to-end.**

---

## Step 8: Conversation Persistence & List (Medium Risk)

**What:** Store conversations, show conversation history, let staff view all chats
**Risk:** Medium — state management, new list view
**Files touched:** New `src/components/pastoral/ConversationList.tsx`, App.tsx state

```
Create src/components/pastoral/ConversationList.tsx:
  - Table/list of all conversations
  - Columns: Status, Category, Persona, Messages, Created, Priority
  - Color-coded priority (crisis=red, high=orange, medium=blue, low=gray)
  - Click to view full conversation
  - Filters: status, category, persona, date range
  - Staff-only view (part of CRM dashboard, not public)

App.tsx:
  - Persist conversations in state (later: Supabase)
  - Add conversation to list when created
  - Update when messages added

Wire in ViewRenderer:
  case 'conversations': return <ConversationList conversations={...} />
```

**Milestone: Staff can see all pastoral care conversations and click into any of them.**

---

## Step 9: Crisis Detection (Medium Risk)

**What:** Keyword scanning on user messages, safety protocol trigger
**Risk:** Medium — must be reliable, affects user safety
**Files touched:** New `src/lib/services/crisisDetection.ts`, CharacterChat.tsx

```
Create src/lib/services/crisisDetection.ts:
  - scanForCrisis(message: string): { detected: boolean; severity: 'low'|'high'; keywords: string[] }
  - Keyword lists: suicide, self-harm, abuse, violence, overdose, etc.
  - Returns severity + matched keywords
  - NOT a replacement for professional assessment — just a flag

Update CharacterChat.tsx:
  - Before sending to AI: run crisis scan
  - If detected: inject safety resources into the AI response
  - Always include: 988 Suicide & Crisis Lifeline, domestic violence hotline
  - Flag conversation as priority: 'crisis'
  - Create staff notification (task) for immediate review
```

**This is safety-critical. Keep it simple and over-flag rather than under-flag.**

---

## Step 10: Persona Tone Calibration (Medium-Hard)

**What:** Interactive persona builder where leaders calibrate their AI's voice
**Risk:** Medium — complex form UI, but standalone component
**Files touched:** New `src/components/pastoral/PersonaBuilder.tsx`

```
Create src/components/pastoral/PersonaBuilder.tsx:
  - Step wizard (5 steps):
    1. Basic Info (name, photo, bio for the persona)
    2. Expertise (pick categories)
    3. Tone (sliders: warmth, formality, directness, humor, faith-level)
    4. Sample Responses (show scenarios, leader types how they'd respond)
    5. Test Chat (talk to your own AI, see if it sounds like you)
  - Each slider shows a preview label ("Warm & Casual" vs "Professional & Formal")
  - Sample scenarios: "Someone says their marriage is struggling" → leader types response
  - These responses become few-shot examples in the system prompt
  - Save updates the AIPersona in state
```

**Milestone: Leader can configure their AI persona and test-chat with it.**

---

## Step 11: Live Indicator + Connect Button (Hard)

**What:** Show when real leader is online, allow user to request live connection
**Risk:** Hard — requires some form of presence tracking
**Files touched:** LeaderProfileCard, CharacterChat, new presence utility

```
Simple approach (no WebSockets needed for v1):
  - LeaderProfile gets lastSeenAt timestamp
  - "Online" = lastSeenAt within last 5 minutes
  - Leader's CRM session updates lastSeenAt periodically
  - Green dot = online, gray = offline

"Connect with [Name]" button in chat:
  - If leader online: creates a Task assigned to them with conversation link
  - If offline: shows next available time (from availability schedule)
  - Either way: adds a note to the conversation "User requested live connection"
  - For v1: this is async (not real-time takeover)

Future (v2): Real-time takeover via WebSocket/polling where leader
  actually joins the chat window and the AI steps aside.
```

---

## Step 12: PastoralCareAgent (Hard)

**What:** Automated agent that handles follow-ups, escalations, summaries
**Risk:** Hard — extends agent system, runs background logic
**Files touched:** New `src/lib/agents/PastoralCareAgent.ts`, agent types

```
Create src/lib/agents/PastoralCareAgent.ts (extends BaseAgent):
  - Daily scan:
    - Open conversations with no response > 24h → create follow-up task
    - Crisis conversations not acknowledged → re-notify staff
    - Conversations resolved > 48h ago → send optional follow-up message
  - Weekly summary:
    - Total conversations, by category, by persona
    - Average response time
    - Unresolved conversations
    - Generate summary via AI
  - Register in agent dashboard alongside existing agents
```

---

## Step 13: Supabase Persistence (Hard)

**What:** Move from in-memory state to database
**Risk:** Hard — migration, RLS policies, API routes
**Files touched:** Supabase migrations, new API routes, data hooks

```
Create migration:
  - leader_profiles table
  - ai_personas table
  - help_requests table
  - conversations table
  - conversation_messages table
  - crisis_protocols table
  - RLS policies for all tables

Create API routes:
  - /api/pastoral/help-requests (CRUD)
  - /api/pastoral/conversations (CRUD + messages)
  - /api/pastoral/leaders (CRUD)
  - /api/pastoral/personas (CRUD)

Create hook:
  - usePastoralCare() — fetches and manages all pastoral care data
  - Replace useState in App.tsx with this hook
```

---

## Step 14: D-ID Video Integration (Future/Hard)

**What:** AI persona as a video avatar
**Risk:** High — third-party integration, streaming, cost
**Deferred — build chat-first, add video later**

---

## Summary: Build Order

| Step | What | Risk | Depends On |
|------|------|------|------------|
| 1 | Types | None | — |
| 2 | Sample data + state | None | Step 1 |
| 3 | Leader profile cards | Low | Steps 1-2 |
| 4 | Sidebar + routing | Low | Step 3 |
| 5 | Help intake form | Low | Steps 1-2 |
| 6 | Character chat | Medium | Steps 1-2, 5 |
| 7 | Intake → chat flow | Medium | Steps 4-6 |
| 8 | Conversation list | Medium | Step 7 |
| 9 | Crisis detection | Medium | Step 6 |
| 10 | Persona builder | Medium-Hard | Steps 1-2 |
| 11 | Live indicator | Hard | Steps 3, 6 |
| 12 | PastoralCare agent | Hard | Steps 7-9 |
| 13 | Supabase persistence | Hard | Steps 7-8 |
| 14 | D-ID video | Future | Step 13 |

**Steps 1-7 = Working MVP.** User can ask for help, get matched to an AI character, and chat.
**Steps 8-10 = Staff tools.** Conversation management, crisis safety, persona configuration.
**Steps 11-14 = Advanced.** Live presence, automation, database, video.
