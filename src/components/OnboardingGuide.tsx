import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Church,
  Users,
  CreditCard,
  Mail,
  MessageSquare,
  Bot,
  Smartphone,
  Database,
  ArrowRight,
} from 'lucide-react';

interface OnboardingGuideProps {
  onBack?: () => void;
  onNavigate?: (view: string) => void;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming';
  content: React.ReactNode;
}

export function OnboardingGuide({ onBack, onNavigate }: OnboardingGuideProps) {
  const [expandedStep, setExpandedStep] = useState<string | null>('step-1');

  const steps: OnboardingStep[] = [
    {
      id: 'step-1',
      title: 'Set Up Your Church Profile',
      description: 'Configure basic church information',
      icon: <Church size={20} />,
      status: 'current',
      content: (
        <div className="space-y-4">
          <p>Start by setting up your church profile in the Settings page:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Navigate to <strong>Settings</strong> from the sidebar</li>
            <li>Enter your church name and contact information</li>
            <li>Upload your church logo (recommended: 256x256px)</li>
            <li>Set your timezone for accurate scheduling</li>
          </ol>
          <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Your church name will appear in emails, the member portal, and connect cards.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'step-2',
      title: 'Connect Your Database',
      description: 'Set up Supabase for data storage',
      icon: <Database size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Grace CRM uses Supabase as its database. To set it up:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Create an account at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">supabase.com</a></li>
            <li>Create a new project</li>
            <li>Run the database migrations (found in <code className="bg-gray-100 dark:bg-dark-700 px-1 rounded">supabase/migrations/</code>)</li>
            <li>Copy your project URL and anon key to your environment variables:
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li><code>VITE_SUPABASE_URL</code></li>
                <li><code>VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'step-3',
      title: 'Add Staff Users',
      description: 'Invite your team to the CRM',
      icon: <Users size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Set up authentication and invite your staff:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Configure Clerk authentication (see Settings)</li>
            <li>Invite staff members via email</li>
            <li>Assign appropriate roles:
              <ul className="list-disc list-inside ml-4 mt-2">
                <li><strong>Admin:</strong> Full access to all features</li>
                <li><strong>Pastor:</strong> Full access to church data</li>
                <li><strong>Staff:</strong> Access to people, tasks, giving</li>
                <li><strong>Volunteer:</strong> Limited access</li>
              </ul>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'step-4',
      title: 'Import Your People',
      description: 'Add congregation members to the system',
      icon: <Users size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Import your existing congregation data:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Go to <strong>People</strong> from the sidebar</li>
            <li>Click <strong>Import</strong> to upload a CSV file</li>
            <li>Map your columns to Grace CRM fields</li>
            <li>Review and confirm the import</li>
          </ol>
          <div className="bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-xl">
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>CSV Format:</strong> Required columns are First Name and Last Name. Optional columns include Email, Phone, Status, Birth Date, and Tags.
            </p>
          </div>
          <p className="text-sm text-gray-600 dark:text-dark-400">
            Alternatively, add people one at a time using the "Add Person" button.
          </p>
        </div>
      ),
    },
    {
      id: 'step-5',
      title: 'Set Up Email Integration',
      description: 'Configure Resend for email communications',
      icon: <Mail size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Enable email sending through Resend:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">resend.com</a></li>
            <li>Verify your church's domain</li>
            <li>Create an API key</li>
            <li>Add to your environment:
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li><code>VITE_RESEND_API_KEY</code></li>
                <li><code>VITE_EMAIL_FROM_ADDRESS</code></li>
              </ul>
            </li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-dark-400">
            Email integration enables welcome emails, follow-up reminders, and AI-generated messages.
          </p>
        </div>
      ),
    },
    {
      id: 'step-6',
      title: 'Set Up SMS Integration',
      description: 'Configure Twilio for text messages',
      icon: <MessageSquare size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Enable SMS sending through Twilio:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Create an account at <a href="https://twilio.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">twilio.com</a></li>
            <li>Get a phone number for sending messages</li>
            <li>Find your Account SID and Auth Token</li>
            <li>Add to your environment:
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li><code>VITE_TWILIO_ACCOUNT_SID</code></li>
                <li><code>VITE_TWILIO_AUTH_TOKEN</code></li>
                <li><code>VITE_TWILIO_PHONE_NUMBER</code></li>
              </ul>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'step-7',
      title: 'Configure Online Giving',
      description: 'Set up Stripe for donations',
      icon: <CreditCard size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Accept online donations through Stripe:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Create a Stripe account at <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">stripe.com</a></li>
            <li>Complete identity verification</li>
            <li>Get your publishable and secret keys</li>
            <li>Add to your environment:
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li><code>VITE_STRIPE_PUBLISHABLE_KEY</code></li>
              </ul>
            </li>
          </ol>
          <div className="bg-green-50 dark:bg-green-500/10 p-4 rounded-xl">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Security:</strong> Never expose your Stripe secret key in frontend code. Use it only on your backend server.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'step-8',
      title: 'Enable AI Features',
      description: 'Set up Google Gemini for AI-powered messages',
      icon: <Bot size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>Enable AI-generated personalized messages:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Get an API key from <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline">Google AI Studio</a></li>
            <li>Add to your environment:
              <ul className="list-disc list-inside ml-4 mt-2 text-sm">
                <li><code>GEMINI_API_KEY</code> (server-side only)</li>
              </ul>
            </li>
            <li>Configure AI agents in Settings</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-dark-400">
            AI agents generate birthday greetings, thank-you notes, and welcome messages - all reviewed by staff before sending.
          </p>
        </div>
      ),
    },
    {
      id: 'step-9',
      title: 'Set Up Member Portal',
      description: 'Enable the member-facing PWA',
      icon: <Smartphone size={20} />,
      status: 'upcoming',
      content: (
        <div className="space-y-4">
          <p>The Member Portal lets congregation members:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>View the member directory</li>
            <li>RSVP to events</li>
            <li>Self check-in for services</li>
            <li>Give online</li>
          </ul>
          <h4 className="font-semibold text-gray-900 dark:text-white mt-4">To enable:</h4>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Ensure Email or SMS is configured (for verification codes)</li>
            <li>Navigate to Member Portal from the sidebar</li>
            <li>Share the portal URL with members</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-dark-400">
            Members log in using their phone number or email - no password needed!
          </p>
        </div>
      ),
    },
  ];

  const toggleStep = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-300 mb-4"
            >
              <ChevronLeft size={16} />
              Back to Dashboard
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Church Onboarding Guide
          </h1>
          <p className="text-gray-500 dark:text-dark-400 mt-1">
            Follow these steps to get your church set up on Grace CRM
          </p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-dark-300">
              Setup Progress
            </span>
            <span className="text-sm text-gray-500 dark:text-dark-400">
              {completedCount} of {steps.length} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Quick Start Checklist */}
        <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-4">
            Quick Start Essentials
          </h2>
          <p className="text-indigo-700 dark:text-indigo-400 text-sm mb-4">
            These are the minimum requirements to start using Grace CRM:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
              <Circle size={16} className="text-indigo-400" />
              Database (Supabase)
            </div>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
              <Circle size={16} className="text-indigo-400" />
              Authentication (Clerk)
            </div>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
              <Circle size={16} className="text-indigo-400" />
              At least one person added
            </div>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm">
              <Circle size={16} className="text-indigo-400" />
              Email integration (optional but recommended)
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden"
            >
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 dark:hover:bg-dark-800 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  step.status === 'completed'
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                    : step.status === 'current'
                    ? 'bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'bg-gray-100 dark:bg-dark-800 text-gray-400 dark:text-dark-500'
                }`}>
                  {step.status === 'completed' ? <CheckCircle2 size={20} /> : step.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-dark-400">
                      Step {index + 1}
                    </span>
                    {step.status === 'current' && (
                      <span className="text-xs bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-dark-400">
                    {step.description}
                  </p>
                </div>

                {expandedStep === step.id ? (
                  <ChevronDown className="text-gray-400" size={20} />
                ) : (
                  <ChevronRight className="text-gray-400" size={20} />
                )}
              </button>

              {expandedStep === step.id && (
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-dark-700">
                  <div className="pt-4 text-gray-600 dark:text-dark-300">
                    {step.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-dark-400 mb-4">
            Need help with setup? Check out the Help Center for detailed documentation.
          </p>
          <button
            onClick={() => onNavigate?.('help')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            View Help Center
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
