import { useState } from 'react';
import {
  HelpCircle,
  ChevronRight,
  Search,
  Users,
  TrendingUp,
  CheckSquare,
  Calendar,
  Heart,
  DollarSign,
  Bot,
  Smartphone,
  UserCheck,
  Baby,
  Keyboard,
} from 'lucide-react';

interface HelpCenterProps {
  onBack?: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <HelpCircle size={20} />,
    content: (
      <div className="space-y-4">
        <p>Welcome to Grace CRM! This guide will help you get started with managing your church community.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Quick Overview</h4>
        <p>Grace CRM helps you:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Track visitors and convert them to members</li>
          <li>Manage follow-up tasks and communication</li>
          <li>Record attendance and giving</li>
          <li>Organize small groups and prayer requests</li>
          <li>Generate AI-powered personalized messages</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">First Steps</h4>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li><strong>Add your first person:</strong> Click the "Add Person" button on the People page</li>
          <li><strong>Create a follow-up task:</strong> After adding someone, create a task to follow up</li>
          <li><strong>Set up small groups:</strong> Navigate to Groups to organize your congregation</li>
          <li><strong>Track attendance:</strong> Use the Attendance page for services</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'pipeline',
    title: 'Visitor Pipeline',
    icon: <TrendingUp size={20} />,
    content: (
      <div className="space-y-4">
        <p>The Visitor Pipeline helps you track where each person is in their journey from first-time visitor to active member.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Status Stages</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Visitor:</strong> First-time or infrequent guests</li>
          <li><strong>Regular:</strong> Attending consistently but not yet a member</li>
          <li><strong>Member:</strong> Officially joined the church</li>
          <li><strong>Leader:</strong> Active in ministry leadership</li>
          <li><strong>Inactive:</strong> No longer attending</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Pipeline View</h4>
        <p>The Pipeline page shows a Kanban-style board where you can:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>See how many people are in each stage</li>
          <li>Identify visitors who need follow-up</li>
          <li>Track engagement patterns</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'people',
    title: 'Managing People',
    icon: <Users size={20} />,
    content: (
      <div className="space-y-4">
        <p>The People section is your central hub for managing congregation information.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Adding People</h4>
        <p>Click "Add Person" to create a new record. Required fields:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>First and last name</li>
          <li>Status (visitor, regular, member, etc.)</li>
        </ul>
        <p className="text-sm text-gray-600 dark:text-dark-400 mt-2">Tip: Add email and phone for communication features.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Tags</h4>
        <p>Use tags to organize people by interests, ministries, or groups:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>youth-ministry, worship-team, volunteer</li>
          <li>first-time-visitor, new-member</li>
          <li>prayer-team, greeter</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Bulk Actions</h4>
        <p>Select multiple people to:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Change status in bulk</li>
          <li>Add tags to multiple records</li>
          <li>Export for mail merge</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'tasks',
    title: 'Follow-Up Tasks',
    icon: <CheckSquare size={20} />,
    content: (
      <div className="space-y-4">
        <p>Never lose track of follow-ups with the task management system.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Task Categories</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Follow-up:</strong> First contact, check-ins, invitations</li>
          <li><strong>Care:</strong> Pastoral visits, hospital calls, meals</li>
          <li><strong>Admin:</strong> Paperwork, scheduling, organization</li>
          <li><strong>Outreach:</strong> Evangelism, community events</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Priority Levels</h4>
        <ul className="space-y-1 ml-4">
          <li><span className="text-red-600">High:</span> Urgent, needs immediate attention</li>
          <li><span className="text-yellow-600">Medium:</span> Important but not urgent</li>
          <li><span className="text-green-600">Low:</span> Can wait, nice to do</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Tips</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Link tasks to people for context</li>
          <li>Use due dates to stay organized</li>
          <li>Check off completed tasks promptly</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'attendance',
    title: 'Attendance Tracking',
    icon: <UserCheck size={20} />,
    content: (
      <div className="space-y-4">
        <p>Track who attends services and events to identify engagement patterns.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Event Types</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Sunday Service:</strong> Main weekly worship</li>
          <li><strong>Wednesday Service:</strong> Midweek gatherings</li>
          <li><strong>Small Group:</strong> Home groups, Bible studies</li>
          <li><strong>Special Event:</strong> Conferences, retreats</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Check-In Methods</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Quick check-in from the attendance page</li>
          <li>Child Check-In for kids ministry</li>
          <li>Member self check-in via Member Portal</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'child-checkin',
    title: 'Child Check-In',
    icon: <Baby size={20} />,
    content: (
      <div className="space-y-4">
        <p>Securely check in children for nursery, Sunday school, and kids programs.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Features</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Security code generation for pick-up</li>
          <li>Allergy and medical alerts</li>
          <li>Parent contact information</li>
          <li>Printable name tags</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">How It Works</h4>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Select the child from the list</li>
          <li>Confirm parent/guardian information</li>
          <li>Print name tag with security code</li>
          <li>Give matching code to parent</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'calendar',
    title: 'Calendar & Events',
    icon: <Calendar size={20} />,
    content: (
      <div className="space-y-4">
        <p>Manage church events, services, and special occasions.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Event Categories</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Service:</strong> Sunday, Wednesday, special services</li>
          <li><strong>Meeting:</strong> Leadership, committees, planning</li>
          <li><strong>Event:</strong> Conferences, dinners, outreach</li>
          <li><strong>Small Group:</strong> Weekly home groups</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">RSVP Tracking</h4>
        <p>Track responses for events that need headcounts:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Yes / No / Maybe responses</li>
          <li>Guest counts for meal planning</li>
          <li>Email reminders before events</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'prayer',
    title: 'Prayer Requests',
    icon: <Heart size={20} />,
    content: (
      <div className="space-y-4">
        <p>Track and manage prayer requests from your congregation.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Request Types</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Public:</strong> Can be shared with prayer team</li>
          <li><strong>Private:</strong> Only visible to staff</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Answered Prayers</h4>
        <p>When God answers a prayer:</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Mark the request as answered</li>
          <li>Optionally add a testimony</li>
          <li>Celebrate with the congregation!</li>
        </ol>
      </div>
    ),
  },
  {
    id: 'giving',
    title: 'Giving & Donations',
    icon: <DollarSign size={20} />,
    content: (
      <div className="space-y-4">
        <p>Track donations, pledges, and generate giving statements.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Fund Types</h4>
        <ul className="space-y-2 ml-4">
          <li><strong>Tithe:</strong> Regular tithes and offerings</li>
          <li><strong>Offering:</strong> General offerings</li>
          <li><strong>Missions:</strong> Mission support funds</li>
          <li><strong>Building:</strong> Building fund contributions</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Features</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Batch entry for Sunday collections</li>
          <li>Online giving integration (Stripe)</li>
          <li>Pledge tracking and campaigns</li>
          <li>Year-end giving statements</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Online Giving</h4>
        <p>Members can give online via credit card using our secure Stripe integration.</p>
      </div>
    ),
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    icon: <Bot size={20} />,
    content: (
      <div className="space-y-4">
        <p>AI-powered automation helps you never miss an opportunity to connect.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Available Agents</h4>
        <ul className="space-y-3 ml-4">
          <li>
            <strong>Life Events Agent:</strong> Sends personalized messages for birthdays, anniversaries, and other milestones
          </li>
          <li>
            <strong>Donation Agent:</strong> Generates thank-you messages for donations
          </li>
          <li>
            <strong>New Member Agent:</strong> Creates welcome messages for new visitors and members
          </li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">How It Works</h4>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>AI generates a personalized message draft</li>
          <li>Messages go to the Review Queue</li>
          <li>Staff reviews and approves/edits</li>
          <li>Approved messages are sent via email or SMS</li>
        </ol>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Staff Review Queue</h4>
        <p>All AI-generated messages require staff approval before sending, ensuring quality and personal touch.</p>
      </div>
    ),
  },
  {
    id: 'member-portal',
    title: 'Member Portal (PWA)',
    icon: <Smartphone size={20} />,
    content: (
      <div className="space-y-4">
        <p>The Member Portal is a Progressive Web App (PWA) for congregation members.</p>

        <h4 className="font-semibold text-gray-900 dark:text-white">Features</h4>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Member directory with photos</li>
          <li>View upcoming events and RSVP</li>
          <li>Self check-in for services</li>
          <li>Online giving</li>
        </ul>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Member Authentication</h4>
        <p>Members log in using their phone number or email:</p>
        <ol className="list-decimal list-inside space-y-1 ml-4">
          <li>Enter phone or email</li>
          <li>Receive a 6-digit code via SMS/email</li>
          <li>Enter code to verify identity</li>
          <li>Access member features</li>
        </ol>

        <h4 className="font-semibold text-gray-900 dark:text-white mt-4">Installing the PWA</h4>
        <p>Members can install the portal on their home screen for app-like access.</p>
      </div>
    ),
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    icon: <Keyboard size={20} />,
    content: (
      <div className="space-y-4">
        <p>Use keyboard shortcuts to navigate quickly.</p>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">Navigation</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Global Search</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-xs">Cmd/Ctrl + K</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toggle Sidebar</span>
                <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-dark-700 rounded text-xs">Cmd/Ctrl + B</kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function HelpCenter({ onBack }: HelpCenterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const filteredSections = searchQuery
    ? helpSections.filter(
        section =>
          section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof section.content === 'string' && section.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : helpSections;

  const currentSection = selectedSection
    ? helpSections.find(s => s.id === selectedSection)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <HelpCircle className="text-indigo-600" size={28} />
              Help Center
            </h1>
            <p className="text-gray-500 dark:text-dark-400 mt-1">
              Learn how to use Grace CRM effectively
            </p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedSection(null);
            }}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-850 border border-gray-200 dark:border-dark-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {currentSection ? (
          /* Section Detail View */
          <div className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
            <button
              onClick={() => setSelectedSection(null)}
              className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-6 hover:underline"
            >
              <ChevronRight className="rotate-180" size={16} />
              Back to all topics
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {currentSection.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentSection.title}
              </h2>
            </div>

            <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-dark-300">
              {currentSection.content}
            </div>
          </div>
        ) : (
          /* Topic Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSections.map(section => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className="bg-white dark:bg-dark-850 rounded-xl border border-gray-200 dark:border-dark-700 p-5 text-left hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-dark-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-dark-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {section.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-dark-400">
                  <span>Read more</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        )}

        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-dark-400">
              No help topics found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Quick Links */}
        {!currentSection && !searchQuery && (
          <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
              Need More Help?
            </h3>
            <p className="text-indigo-700 dark:text-indigo-400 text-sm">
              Can't find what you're looking for? Reach out to your church administrator
              or check out the setup guide for detailed configuration instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
