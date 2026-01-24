# Grace CRM User Manual

**Version 1.0** | **Last Updated: January 2026**

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Dashboard](#dashboard)
4. [People Management](#people-management)
5. [Visitor Pipeline](#visitor-pipeline)
6. [Follow-Up Tasks](#follow-up-tasks)
7. [Attendance Tracking](#attendance-tracking)
8. [Calendar & Events](#calendar--events)
9. [Small Groups](#small-groups)
10. [Prayer Requests](#prayer-requests)
11. [Giving Management](#giving-management)
12. [AI Agents & Automation](#ai-agents--automation)
13. [Communication (Email & SMS)](#communication-email--sms)
14. [Tags & Organization](#tags--organization)
15. [Reports](#reports)
16. [Settings & Configuration](#settings--configuration)
17. [Keyboard Shortcuts](#keyboard-shortcuts)
18. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is Grace CRM?

**GRACE** stands for **Growth, Relationships, Attendance, Community, Engagement**.

Grace CRM is a modern church management system designed specifically for small-to-midsize churches (50-500 members). Our mission is simple: **never lose a visitor**. Research shows that 82% of first-time church visitors never return. Grace CRM helps you change that statistic through intelligent follow-up, automated communications, and intuitive member management.

### Key Benefits

- **Simplified Visitor Follow-Up**: Track every visitor from first contact to membership
- **AI-Powered Communications**: Generate personalized messages automatically
- **Comprehensive Giving Management**: Track donations, pledges, and generate statements
- **Automated Workflows**: Set up agents to handle routine tasks
- **All-in-One Platform**: People, giving, attendance, groups, and more in one place

---

## Getting Started

### First-Time Setup

1. **Connect Your Database**
   - Navigate to **Settings** from the sidebar
   - Enter your Supabase URL and API key
   - Click "Save" to establish the connection

2. **Configure Your Church Profile**
   - Add your church name and contact information
   - Set your time zone
   - Configure service schedules

3. **Set Up Integrations** (Optional but Recommended)
   - **Email**: Add your Resend API key for email communications
   - **SMS**: Configure Twilio credentials for text messaging
   - **AI**: Add your Google Gemini API key for AI features
   - **Payments**: Set up Stripe for online giving

4. **Import Existing Data**
   - Use the CSV import feature to bring in your existing member list
   - Go to **People** → Click the import button → Upload your CSV file

### Navigation Overview

The main navigation sidebar includes:

| Section | Purpose |
|---------|---------|
| Dashboard | Overview of key metrics and quick actions |
| Pipeline | Visual Kanban board of visitor journey |
| People | Complete member directory and profiles |
| Follow-Ups | Task management for pastoral care |
| Attendance | Service and event check-in |
| Child Check-In | Nursery and children's ministry check-in |
| Calendar | Events and scheduling |
| Birthdays | Birthday tracking and greetings |
| Volunteers | Volunteer scheduling |
| Groups | Small group management |
| Prayer | Prayer request tracking |
| Giving | Donation and financial management |
| AI Agents | Automation configuration |
| Tags | Organize people with custom labels |
| Reports | Generate printable reports |
| Directory | Member directory view |
| Connect Card | QR code visitor cards |
| Forms | Custom form builder |
| Member Portal | Member-facing interface |

---

## Dashboard

The Dashboard is your command center, providing an at-a-glance view of your church's health and activity.

### Key Metrics Display

- **Total People**: Count of all records in your database
- **Active Visitors**: People in the visitor stage of your pipeline
- **Overdue Follow-Ups**: Tasks that need immediate attention
- **Monthly Giving**: Donation totals for the current month

### Widgets

#### Visitor Pipeline Summary
Shows the distribution of people across different stages:
- Visitor → Regular → Member → Leader

#### Upcoming Birthdays
Displays birthdays in the next 30 days with:
- Person's name and photo
- Birthday date
- Quick action to send AI-generated greeting

#### Recent Activity
Shows recent interactions, new members, and tasks completed.

### Quick Actions

Use the floating action button (+) or keyboard shortcuts to quickly:
- **Add Person** (Press `N`)
- **Add Task** (Press `T`)
- **Add Prayer Request** (Press `P`)
- **Add Note** (Press `M`)
- **Add Donation** (Press `D`)

---

## People Management

The People section is the heart of Grace CRM, where you manage all member and visitor information.

### Adding a New Person

1. Click the **+ Add Person** button or press `N`
2. Fill in the required fields:
   - First Name
   - Last Name
   - Status (Visitor, Regular, Member, Leader, Inactive)
3. Add optional information:
   - Email address
   - Phone number
   - Address
   - Birth date
   - Profile photo
   - Notes
4. Click **Save**

### Person Statuses

| Status | Description |
|--------|-------------|
| **Visitor** | First-time or new visitors to your church |
| **Regular** | Attending regularly but not yet members |
| **Member** | Official church members |
| **Leader** | Members in leadership roles |
| **Inactive** | People who have stopped attending |

### Profile Features

Each person's profile includes:

- **Contact Information**: Email, phone, address
- **Demographics**: Birth date, family connections
- **Church Journey**: Status history, join date
- **Tags**: Custom labels for organization
- **Small Groups**: Group memberships
- **Interactions**: Complete communication history
- **Giving**: Donation history (if applicable)
- **Attendance**: Service attendance records

### Interaction Logging

Record every touchpoint with a person:

1. Open their profile
2. Click **Add Interaction**
3. Select the type:
   - Note
   - Phone Call
   - Email
   - Visit
   - SMS
   - Prayer
4. Add details and save

### Bulk Operations

Select multiple people to perform batch actions:
- **Update Status**: Change status for multiple people at once
- **Add Tags**: Apply tags to selected people
- **Export**: Download selected records as CSV

---

## Visitor Pipeline

The Pipeline view provides a visual Kanban-style board to track your visitors' journey toward membership.

### Pipeline Stages

1. **Visitor**: First-time guests
2. **Regular**: Attending consistently
3. **Member**: Officially joined
4. **Leader**: In leadership roles

### Using the Pipeline

- Each card represents a person
- Click a card to view their full profile
- See conversion metrics at the top
- Filter by date range or tags

### Best Practices

1. **Review Weekly**: Check the pipeline every week for stale visitors
2. **Create Follow-Ups**: Add tasks for visitors who haven't progressed
3. **Celebrate Conversions**: Note when visitors become members

---

## Follow-Up Tasks

The Follow-Ups section helps you manage pastoral care tasks and ensure no one falls through the cracks.

### Creating a Task

1. Click **+ Add Task** or press `T`
2. Enter task details:
   - Title (what needs to be done)
   - Description (additional context)
   - Priority (Low, Medium, High)
   - Category (Follow-up, Care, Admin, Outreach)
   - Due Date
   - Assigned To (staff member)
   - Link to Person (optional)
3. Click **Save**

### Task Categories

| Category | Use For |
|----------|---------|
| **Follow-up** | Visitor and member follow-up calls/visits |
| **Care** | Pastoral care, hospital visits, support |
| **Admin** | Administrative tasks |
| **Outreach** | Community engagement activities |

### Recurring Tasks

Set up tasks that repeat automatically:
- Daily
- Weekly
- Biweekly
- Monthly
- Quarterly

### Managing Tasks

- **Complete**: Check the box when finished
- **Edit**: Click to modify details
- **Delete**: Remove unnecessary tasks
- **Filter**: View by category, priority, or assignee
- **Overdue**: Red indicator shows past-due tasks

---

## Attendance Tracking

Track who attends your services and events to identify engagement patterns.

### Recording Attendance

1. Go to **Attendance**
2. Select the event type:
   - Sunday Service
   - Wednesday Service
   - Small Group
   - Special Event
3. Choose the date
4. Check in attendees from your people list
5. Save the record

### Child Check-In

The dedicated Child Check-In section provides:
- Secure nursery and children's ministry check-in
- Guardian verification
- Special needs or allergy notes
- Printed name tags

### Attendance Reports

View attendance patterns:
- Individual attendance history
- Event attendance counts
- Absence alerts for inactive members

---

## Calendar & Events

Manage all church events and schedules in one place.

### Creating an Event

1. Go to **Calendar**
2. Click on a date or the **+ Add Event** button
3. Fill in event details:
   - Event name
   - Category (Service, Meeting, Event, Small Group, Holiday, Other)
   - Start and end date/time
   - Location
   - Description
   - All-day toggle
4. Click **Save**

### Event Categories

- **Service**: Regular worship services
- **Meeting**: Staff and committee meetings
- **Event**: Special church events
- **Small Group**: Group meetings
- **Holiday**: Church holidays and closures
- **Other**: Miscellaneous events

### Attendee Management

For each event:
- Add expected attendees
- Track RSVPs (Yes, No, Maybe)
- Send reminders via email or SMS
- Record actual attendance

---

## Small Groups

Manage your church's small group ministry.

### Creating a Group

1. Go to **Groups**
2. Click **+ Add Group**
3. Enter group information:
   - Group name
   - Description
   - Leader (select from people)
   - Meeting day and time
   - Location
   - Active/Inactive status
4. Click **Save**

### Managing Group Members

1. Open a group
2. Click **Add Member**
3. Select people from your directory
4. Save changes

### Group Features

- View all members in each group
- Track group attendance
- Link group meetings to the calendar
- Send group communications

---

## Prayer Requests

Track and manage prayer requests from your congregation.

### Adding a Prayer Request

1. Go to **Prayer** or press `P`
2. Click **+ Add Request**
3. Enter details:
   - Request description
   - Person (who submitted it)
   - Public/Private setting
   - Category (optional)
4. Click **Save**

### Managing Requests

- **Mark as Answered**: Celebrate answered prayers
- **Add Testimony**: Record how the prayer was answered
- **Archive**: Move old requests to archive
- **Share**: Display on prayer wall (if public)

### Prayer Digest

Use AI to generate a weekly prayer digest:
1. Go to **Prayer**
2. Click **Generate Digest**
3. Review and share with your team

---

## Giving Management

Grace CRM provides comprehensive tools for tracking and managing church finances.

### Giving Dashboard

The main Giving view shows:
- Total giving (month/year)
- Giving by fund
- Recurring gift summary
- Recent transactions

### Recording a Donation

1. Go to **Giving** or press `D`
2. Click **+ Add Donation**
3. Enter donation details:
   - Donor (select person)
   - Amount
   - Date
   - Fund (Tithe, Offering, Missions, Building, Benevolence, Other)
   - Method (Cash, Check, Card, Online, Bank Transfer)
   - Check number (if applicable)
   - Notes
4. Click **Save**

### Batch Entry

For processing multiple cash and check donations:

1. Go to **Giving** → **Batch Entry**
2. Click **Create New Batch**
3. Enter batch date and notes
4. Add individual items:
   - Donor name
   - Amount
   - Type (Cash/Check)
   - Check number
   - Fund
5. Review totals
6. Close batch when complete

### Pledges & Campaigns

Set up fundraising campaigns:

1. Go to **Giving** → **Pledges/Campaigns**
2. Click **Create Campaign**
3. Enter campaign details:
   - Campaign name
   - Goal amount
   - Start and end dates
   - Description
4. Collect pledges from members
5. Track pledge fulfillment

### Giving Statements

Generate annual giving statements:

1. Go to **Giving** → **Statements**
2. Select the year
3. Choose recipients (all or specific people)
4. Generate statements
5. Email or print for distribution

### Online Giving

Set up online donation form:

1. Go to **Giving** → **Online Form**
2. Configure Stripe integration in Settings
3. Customize form fields
4. Share the form link with members

### Charity Baskets

Manage community support baskets:

1. Go to **Giving** → **Charity Baskets**
2. Create baskets by type:
   - Food
   - Holiday
   - Emergency
   - School
   - Baby
   - Household
3. Track items and donations
4. Record distribution

---

## AI Agents & Automation

Grace CRM includes AI-powered agents that automate routine communications.

### Available Agents

#### New Member Integration Agent

Automatically welcomes new visitors and members:

- **Welcome Sequences**: Personalized welcome emails/SMS
- **Drip Campaigns**: Messages on days 1, 3, 7, 14, and 30
- **Follow-Up Tasks**: Creates tasks for staff to call new visitors
- **AI Personalization**: Uses context to personalize messages

#### Donation Processing Agent

Handles donation acknowledgments:

- **Automatic Receipts**: Sends receipt after each donation
- **First-Time Giver Detection**: Special welcome for new givers
- **Large Gift Alerts**: Notifies staff of significant donations
- **Thank-You Messages**: Personalized gratitude messages

### Configuring Agents

1. Go to **AI Agents**
2. Select an agent to configure
3. Toggle features on/off:
   - Enable/disable the agent
   - Configure message delivery (email, SMS, both)
   - Set thresholds and triggers
   - Customize templates
4. Save settings

### Testing Agents

Before going live:

1. Enable **Dry-Run Mode** in agent settings
2. Run the agent manually
3. Review what would have been sent
4. Disable dry-run when ready for production

### AI Message Generation

Grace CRM uses Google Gemini to generate:

- Personalized welcome messages
- Thank-you notes for donations
- Birthday greetings
- Follow-up talking points
- Prayer digest summaries

---

## Communication (Email & SMS)

Send personalized communications to your members.

### Sending an Email

1. Open a person's profile
2. Click **Send Email**
3. Select a template or write custom message
4. Review and send

#### Email Templates

- Welcome Visitor
- Follow-up
- Birthday Greeting
- Event Invitation
- Task Reminder
- Prayer Update
- Giving Receipt

### Sending an SMS

1. Open a person's profile (must have phone number)
2. Click **Send SMS**
3. Select a template or write custom message
4. Review and send

#### SMS Templates

- Welcome Visitor
- Follow-up
- Birthday Greeting
- Event Reminder
- Task Reminder
- Prayer Request
- Attendance Check-in
- Giving Thanks

### Bulk Communications

Send to multiple people:

1. Go to **People**
2. Select recipients
3. Click **Bulk Actions** → **Send Email** or **Send SMS**
4. Compose message
5. Review and send

---

## Tags & Organization

Use tags to organize and filter your people database.

### Creating Tags

1. Go to **Tags**
2. Click **+ Add Tag**
3. Enter tag name
4. Choose a color (optional)
5. Save

### Default Tags

- first-time
- volunteer
- greeter
- elder
- small-group-leader
- choir
- worship-team
- youth
- children

### Applying Tags

1. Open a person's profile
2. Click **Add Tag**
3. Select from existing tags
4. Save

### Filtering by Tags

1. Go to **People**
2. Click the **Filter** button
3. Select tags to filter by
4. View filtered results

---

## Reports

Generate printable reports for various needs.

### Available Reports

- **Member Directory**: List of all members with contact info
- **Attendance Report**: Attendance by date range
- **Giving Report**: Donations by date range and fund
- **Birthday List**: Upcoming birthdays
- **Anniversary List**: Upcoming anniversaries
- **Visitor Report**: New visitors and follow-up status
- **Small Group Report**: Groups and membership

### Generating a Report

1. Go to **Reports**
2. Select report type
3. Configure filters (date range, status, etc.)
4. Click **Generate**
5. Print or export to PDF

---

## Settings & Configuration

Customize Grace CRM for your church's needs.

### Church Settings

- Church name and contact information
- Time zone
- Service schedules
- Small group templates

### Integration Settings

#### Supabase (Database)
- URL and API key for your database

#### Clerk (Authentication)
- User authentication configuration

#### Resend (Email)
- API key for sending emails
- From address configuration

#### Twilio (SMS)
- Account SID and Auth Token
- Phone number configuration

#### Google Gemini (AI)
- API key for AI features

#### Stripe (Payments)
- API keys for online giving

### Agent Settings

Configure each AI agent:
- Enable/disable
- Message delivery preferences
- Thresholds and triggers

### User Preferences

- **Theme**: Toggle between Light and Dark mode
- **Sidebar**: Collapse or expand
- **Notifications**: Configure alert preferences

---

## Keyboard Shortcuts

Speed up your workflow with these shortcuts:

| Shortcut | Action |
|----------|--------|
| `N` | Add new person |
| `T` | Add new task |
| `P` | Add prayer request |
| `M` | Add note/memo |
| `D` | Add donation |
| `/` | Open global search |
| `Esc` | Close modal/dialog |

---

## Troubleshooting

### Common Issues

#### "Database connection failed"
- Check your Supabase URL and API key in Settings
- Ensure your internet connection is stable
- Verify your Supabase project is active

#### "Email not sending"
- Verify your Resend API key in Settings
- Check that the recipient has a valid email address
- Review the email service logs

#### "SMS not sending"
- Verify Twilio credentials in Settings
- Ensure the phone number is in valid format
- Check Twilio account balance

#### "AI features not working"
- Verify Google Gemini API key in Settings
- Check API usage limits
- Ensure the feature is enabled

### Getting Help

- **Documentation**: Review this manual
- **Support**: Contact your administrator
- **Updates**: Check for the latest version

---

## Best Practices

### For Visitor Follow-Up

1. **Enter visitors immediately** after service
2. **Create follow-up tasks** within 24 hours
3. **Make contact** within 48 hours
4. **Track all interactions** in the system
5. **Review pipeline weekly** for stale visitors

### For Giving Management

1. **Record donations promptly** after each service
2. **Use batch entry** for efficiency
3. **Reconcile batches** before closing
4. **Generate statements** annually
5. **Thank donors** personally for significant gifts

### For Communication

1. **Personalize messages** when possible
2. **Use templates** for consistency
3. **Track interaction history** before reaching out
4. **Follow up on unanswered messages**
5. **Respect communication preferences**

### For Data Quality

1. **Keep profiles updated** with current information
2. **Merge duplicate records** when found
3. **Archive inactive records** rather than delete
4. **Use tags consistently** across the team
5. **Review data regularly** for accuracy

---

## Glossary

| Term | Definition |
|------|------------|
| **Pipeline** | The visual journey from visitor to member |
| **Interaction** | Any recorded contact with a person |
| **Agent** | Automated workflow that performs tasks |
| **Batch** | Group of donations processed together |
| **Pledge** | Commitment to give over time |
| **Tag** | Label used to categorize people |
| **Drip Campaign** | Automated series of messages over time |

---

## Contact & Support

For additional help or to report issues:

- **GitHub Issues**: [https://github.com/anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
- **Documentation**: Review the README.md file

---

*Grace CRM - Never lose a visitor*

**Thank you for using Grace CRM to serve your church community!**
