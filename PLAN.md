# Grace CRM Development Plan

## Project Overview

**Grace CRM** is an AI-first, all-in-one church management system targeting churches of all sizes. Built by a solo developer, it aims to be a more affordable, modern alternative to Planning Center and Breeze with superior AI capabilities.

**Target Launch:** 2 days (MVP for internal testing)

---

## 1. Vision & Goals

### Primary Purpose
- All-in-one ChMS replacing multiple tools (Planning Center's fragmented apps)
- AI-first approach to automate routine church communications
- Modern, fast UX on a modern tech stack
- Price leader in the ChMS market

### Target Users
- Churches of all sizes (optimized for up to 10K members initially)
- Solo developer building, internal testing first
- Will expand to pilot churches after validation

### Success Metrics
- [ ] Successful internal testing of all features
- [ ] AI agents reliably generating quality communications
- [ ] Member PWA working on mobile devices
- [ ] Check-in system handling Sunday morning load

### Competitive Differentiation
- AI-first approach (vs. traditional ChMS)
- Price leader (affordable for small churches)
- All-in-one simplicity (one tool, not multiple apps)
- Modern tech stack (better UX, faster, more customizable)

---

## 2. Technical Architecture

### Frontend Stack
- React 18 + TypeScript + Vite
- Tailwind CSS
- Lucide React icons
- PWA with service worker (offline support: nice-to-have)

### Backend/Services
- **Database/Auth:** Supabase (free tier currently)
- **Payments:** Stripe (tokenized storage for compliance)
- **SMS:** Twilio
- **Email:** Resend
- **AI:** Google Gemini Pro

### AI Agents
- `LifeEventAgent` - Birthday/anniversary greetings
- `DonationProcessingAgent` - Thank you messages
- `NewMemberAgent` - Welcome sequences

### AI Trigger Strategy
- **Event-driven** (webhooks/database triggers)
- Configurable personalization level per church
- Staff review workflow before sending (to be implemented)

### Deployment Strategy
- **Hybrid model:** Both self-hosted and managed SaaS options
- Data residency: US only
- Currently: Vercel + Supabase free tiers
- Production: Auto-scaling + edge caching for Sunday spikes

### Sunday Morning Load Strategy (Cost-Effective)
- Edge caching (CDN) for read-heavy operations (directory, event info)
- Pre-warm serverless functions before peak times
- Queue writes during spikes, process async
- Consider read replicas for check-in queries
- Rate limiting on non-critical endpoints during peak

---

## 3. Feature Roadmap

### Phase 1 - Core (Completed)
- [x] Member directory
- [x] Donation tracking
- [x] Groups management
- [x] Calendar/events
- [x] Check-in system (digital verification)
- [x] AI agents (3 agents)
- [x] Forms with instant-to-database processing

### Phase 2 - Recent Additions (Completed)
- [x] Integrations management UI
- [x] LifeApps (devotionals, Bible reading)
- [x] Fund accounting
- [x] PageHeader component with image support

### Phase 3 - v1.0 Launch (2 Days)
- [ ] **Member-facing PWA** (directory, giving, events, check-in, LifeApps)
- [ ] **AI polish** (better prompts, error handling, review workflow)
- [ ] End-to-end testing
- [ ] Documentation & onboarding guides
- [ ] Demo data for testing

### Phase 4 - Post-Launch
- [ ] Planning Center two-way sync
- [ ] Mailchimp/Constant Contact integration
- [ ] Multi-campus federated model
- [ ] Volunteer scheduling with shift signup
- [ ] QuickBooks/Xero API bridge
- [ ] AI sermon insights (transcription, summaries, clips)
- [ ] Smart scheduling (AI-suggested event times)
- [ ] Giving predictions & donor health scoring
- [ ] Member engagement scoring

---

## 4. UI/UX Decisions

### Design System
- Full white-label support (custom logos, colors, domains)
- Flat sidebar navigation (current structure maintained)
- Gradient page headers with optional background images

### Mobile Strategy
- **PWA-first approach** (works on all devices)
- Offline support: nice-to-have (basic viewing, sync when connected)
- Member app is critical differentiator

### Accessibility
- Target: **WCAG 2.1 AA** compliance
- Keyboard navigation
- Screen reader support
- Sufficient color contrast

### Communication Channels
- Email primary + SMS for urgent/time-sensitive
- Member chooses preferred channel (omnichannel future)

---

## 5. Data & Security

### Authentication
- Multiple options: Email/password, SSO (Google/Microsoft/Apple), phone lookup
- Church can configure which methods to enable

### Data Privacy
- Payment data: **Tokenized** (only Stripe stores card details)
- Audit logging: **Compliance-grade** (immutable logs, retention policies)
- Data residency: US only

### Permissions Model
- **Hybrid approach:** Preset roles + ability to customize
- Default roles: Admin, Staff, Volunteer, Member
- Granular per-feature permissions available

### Backup Strategy
- Supabase automatic backups
- Consider point-in-time recovery for production tier

---

## 6. Integration Strategy

### Current Integrations
| Service | Purpose | Status |
|---------|---------|--------|
| Supabase | Database, Auth | Active |
| Stripe | Payments | Active |
| Twilio | SMS | Active |
| Resend | Email | Active |
| Gemini Pro | AI Generation | Active |

### Priority Integrations (Post-Launch)
1. **Planning Center** - Two-way sync for churches already using it
2. **Mailchimp/Constant Contact** - Email marketing sync
3. **QuickBooks/Xero** - Accounting API bridge

### Future Integrations
- Background check services (Checkr) for volunteers
- Video platforms (YouTube/Vimeo) for sermon archives

---

## 7. Tradeoffs & Decisions Log

| Decision | Options Considered | Choice Made | Rationale |
|----------|-------------------|-------------|-----------|
| Deployment | Self-hosted, SaaS, Cloud marketplace | Hybrid | Flexibility for different church needs |
| Mobile | PWA, Native, Responsive web | PWA-first | Fastest to market, works everywhere |
| AI Model | Gemini Pro, Flash, Multiple | Gemini Pro | Best quality/cost balance |
| Navigation | Flat, Grouped, Role-based | Flat sidebar | Simplicity, all features visible |
| Data Storage | Local encryption, Tokenized, Minimal | Tokenized | PCI compliance, simpler architecture |
| Multi-campus | Unified, Separate, Federated | Federated | Shared data + campus customization |
| Audit Logs | Basic, Full, Compliance-grade | Compliance-grade | Future-proof for larger churches |

---

## 8. Open Questions

- [ ] **Pricing model** - Still deciding between freemium, per-seat, per-member, or flat tiers
- [ ] **Testing strategy** - No strong preference; suggest balanced approach (unit + E2E)
- [ ] **Scaling timeline** - When to invest in paid infrastructure tiers?
- [ ] **International expansion** - EU data residency needs if expanding globally

---

## 9. Two-Day Sprint Plan

### Day 1: Member PWA & AI Polish

**Morning:**
- [ ] Create member-facing routes/views (public directory, giving, events)
- [ ] Implement PWA manifest and service worker updates for member app
- [ ] Add member authentication flow (phone/email lookup)

**Afternoon:**
- [ ] Polish AI prompts for all three agents
- [ ] Add error handling and fallbacks for AI failures
- [ ] Implement staff review queue for AI-generated messages

### Day 2: Testing & Documentation

**Morning:**
- [ ] End-to-end testing of critical flows (check-in, giving, AI messages)
- [ ] Fix any bugs found during testing
- [ ] Create demo/seed data for testing

**Afternoon:**
- [ ] Write quick-start documentation
- [ ] Create onboarding guide for new churches
- [ ] Final review and internal "launch"

---

## Interview Summary (2026-01-21)

**Key Insights:**
- Solo developer, aggressive 2-day timeline
- AI-first is the main differentiator
- Member-facing app is critical for launch
- Currently on free tier infrastructure
- Internal testing only (no pilot church yet)
- Full white-label customization needed
- Compliance-grade audit logging required
- All AI features are priority (scheduling, predictions, sermon insights, engagement scoring)

**Immediate Blockers:**
1. Testing/QA needed
2. Documentation/onboarding missing
3. Member PWA not built yet
4. AI needs polish (prompts, errors, review workflow)

---

*Last updated: 2026-01-21*
