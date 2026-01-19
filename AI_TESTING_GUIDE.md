# AI Features Testing Guide

This guide covers how to test the AI-powered messaging features in Grace CRM.

## Prerequisites

1. **Gemini API Key**: Set `VITE_GEMINI_API_KEY` in your `.env` file
   ```bash
   VITE_GEMINI_API_KEY=your-api-key-here
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```

3. **Open the app**: Navigate to `http://localhost:3000`

---

## Feature 1: Daily Digest (Dashboard)

### What It Does
- Generates a personalized daily overview with AI-powered insights
- Shows tasks, contacts to reach, celebrations, and scheduled messages
- Provides AI recommendations based on your data

### How to Test

1. **Navigate to Dashboard** (default view)
2. **View the Daily Digest Panel** - appears below the stats cards
3. **Check greeting** - Changes based on time of day (morning/afternoon/evening)
4. **Review stats cards** - Shows Tasks, Overdue, Contacts, Messages counts

### Testing AI Summary Generation

1. **Click the refresh button** (circular arrow icon) in the digest header
2. **Wait for AI to generate** - Takes 2-5 seconds
3. **Check for**:
   - AI Insights section with summary text
   - 2-3 actionable recommendations
   - Relevant suggestions based on your data

### Testing Interactions

| Action | Expected Behavior |
|--------|-------------------|
| Click person name | Navigate to person profile |
| Click task checkbox | Mark task as complete |
| Click email icon | Navigate to person profile (or open email) |
| Click SMS icon | Navigate to person profile (or open SMS) |
| Click "View all" on tasks | Navigate to Tasks view |
| Click "View calendar" | Navigate to Content Calendar |

---

## Feature 2: Content Calendar

### What It Does
- Visual calendar for scheduling messages
- AI-powered message generation
- Supports email, SMS, or both channels

### How to Test

1. **Navigate to Content Calendar** (sidebar)
2. **View the calendar grid** - Shows scheduled messages on dates

### Creating a Scheduled Message

1. **Click "Schedule Message"** button (top right)
2. **Fill the form**:
   - Select a recipient (optional)
   - Choose channel (Email, SMS, Both)
   - Set date/time
   - Select message type (Manual, Birthday, Follow Up, etc.)
3. **Click "Schedule"**

### Testing AI Message Generation

1. **Create new message** (click Schedule Message)
2. **Select a recipient** (required for AI)
3. **Select message type** (e.g., "Birthday", "Follow Up")
4. **Click "Generate with AI"** (sparkles icon)
5. **Wait for generation** - AI creates personalized message
6. **Review and edit** if needed
7. **Schedule the message**

### Calendar Interactions

| Action | Expected Behavior |
|--------|-------------------|
| Click on date | Select date, show messages panel |
| Click on message pill | Open message detail |
| Use filters | Filter by channel/type |
| Navigate months | Arrows to change month |
| "Today" button | Jump to current month |

---

## Feature 3: Message Inbox

### What It Does
- Shows incoming messages (email/SMS)
- AI classifies messages by category and sentiment
- AI generates reply suggestions

### How to Test

1. **Navigate to Message Inbox** (sidebar)
2. **View demo messages** - 3 sample messages preloaded

### Understanding AI Classification

Messages are automatically classified:

**Categories**:
- `question` - Someone asking a question
- `thanks` - Gratitude/appreciation
- `concern` - Worry or issue
- `prayer_request` - Request for prayer
- `event_rsvp` - Event response
- `unsubscribe` - Opt-out request
- `spam` - Junk mail

**Sentiments**:
- `positive` - Happy, thankful
- `neutral` - Informational
- `negative` - Sad, worried
- `urgent` - Needs immediate attention

### Testing AI Reply Generation

1. **Click on a message** to expand it
2. **Click "Generate AI Reply"** button
3. **Wait for AI** - Generates contextual response
4. **Review the draft** - Appears in reply text area
5. **Edit if needed**
6. **Click "Send Reply"**

### Inbox Interactions

| Action | Expected Behavior |
|--------|-------------------|
| Click message | Expand to show details |
| Flag icon | Toggle flagged status |
| Archive icon | Move to archived |
| "Generate AI Reply" | Create AI response |
| Send Reply | Mark as replied |
| View person | Navigate to profile |

---

## Testing Scenarios

### Scenario 1: Birthday Workflow

1. **Dashboard**: See birthday celebrations in Daily Digest
2. **Click email icon** on birthday person
3. **Or go to Content Calendar**
4. **Create new message** for birthday person
5. **Select "Birthday" type**
6. **Generate AI message**
7. **Schedule for their birthday**

### Scenario 2: Follow-up Workflow

1. **Dashboard**: Check "People to Contact" section
2. **See contacts needing follow-up** (inactive 14+ days)
3. **Click to view person profile**
4. **Or schedule a follow-up message** via Content Calendar

### Scenario 3: Inbound Message Response

1. **Go to Message Inbox**
2. **Click on a message**
3. **Review AI classification** (category, sentiment)
4. **Click "Generate AI Reply"**
5. **Edit response if needed**
6. **Send reply**

---

## Demo Data Setup

The app includes demo data for testing:

### Demo Inbound Messages
- Sarah Johnson - Question about small groups (positive)
- Michael Chen - Thank you for prayers (positive)
- Lisa Martinez - Prayer request for mother (negative/concern)

### To Add More Test Data

**Add a person with birthday today**:
1. Go to People
2. Add New Person
3. Set birthdate to today's date
4. Save

**Add tasks**:
1. Press 'T' or use Quick Actions
2. Create task with due date today
3. Set priority to High

---

## Troubleshooting

### AI Not Generating

1. **Check API key** - Ensure `VITE_GEMINI_API_KEY` is set
2. **Check console** - Look for API errors
3. **Check network** - Ensure internet connection

### No Digest Showing

1. **Click refresh button** to generate
2. **Wait for loading** to complete
3. **Check for errors** in browser console

### Messages Not Appearing

1. **Check filters** - Reset to "All Channels" and "All Types"
2. **Check date range** - Navigate to correct month
3. **Refresh page** if needed

---

## API Endpoints Used

The AI features use Gemini 2.0 Flash via `src/lib/services/ai.ts`:

| Function | Purpose |
|----------|---------|
| `generateAIText` | General text generation |
| `classifyInboundMessage` | Categorize incoming messages |
| `generateReplyDraft` | Create response suggestions |
| `generateScheduledMessage` | Create outbound messages |
| `generateContactTalkingPoints` | Create talking points |

---

## Production Considerations

For production deployment:

1. **Database**: Run `003_ai_messaging_system.sql` migration
2. **Email**: Configure Resend API key
3. **SMS**: Configure Twilio credentials
4. **Webhooks**: Set up inbound message handlers
5. **Cron Jobs**: Schedule digest generation

See `AI_MESSAGING_IMPLEMENTATION_PLAN.md` for full details.
