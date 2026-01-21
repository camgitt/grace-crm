/**
 * Integrations Management Component
 *
 * Allows users to view and configure all third-party integrations
 * including Stripe, Twilio, Resend, Supabase, and Gemini AI.
 */

import { useState, useEffect } from 'react';
import {
  Plug,
  CreditCard,
  MessageSquare,
  Mail,
  Database,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

interface IntegrationStatus {
  stripe: boolean;
  twilio: boolean;
  resend: boolean;
  supabase: boolean;
  gemini: boolean;
}

interface IntegrationConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  docsUrl: string;
  setupUrl: string;
  envVars: { key: string; label: string; secret?: boolean }[];
  features: string[];
}

const INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database, authentication, and real-time subscriptions',
    icon: <Database className="w-6 h-6" />,
    color: 'bg-emerald-500',
    docsUrl: 'https://supabase.com/docs',
    setupUrl: 'https://supabase.com/dashboard',
    envVars: [
      { key: 'VITE_SUPABASE_URL', label: 'Project URL' },
      { key: 'VITE_SUPABASE_ANON_KEY', label: 'Anon Key', secret: true },
      { key: 'SUPABASE_SERVICE_KEY', label: 'Service Key (Backend)', secret: true },
    ],
    features: ['Database storage', 'Row Level Security', 'Real-time updates', 'Authentication'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing for online giving and donations',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'bg-purple-500',
    docsUrl: 'https://stripe.com/docs',
    setupUrl: 'https://dashboard.stripe.com/apikeys',
    envVars: [
      { key: 'VITE_STRIPE_PUBLISHABLE_KEY', label: 'Publishable Key' },
      { key: 'STRIPE_SECRET_KEY', label: 'Secret Key (Backend)', secret: true },
      { key: 'STRIPE_WEBHOOK_SECRET', label: 'Webhook Secret', secret: true },
    ],
    features: ['Online giving', 'Recurring donations', 'Payment processing', 'Tax receipts'],
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Email delivery for notifications and communications',
    icon: <Mail className="w-6 h-6" />,
    color: 'bg-blue-500',
    docsUrl: 'https://resend.com/docs',
    setupUrl: 'https://resend.com/api-keys',
    envVars: [
      { key: 'RESEND_API_KEY', label: 'API Key', secret: true },
      { key: 'VITE_EMAIL_FROM_ADDRESS', label: 'From Address' },
      { key: 'VITE_EMAIL_FROM_NAME', label: 'From Name' },
    ],
    features: ['Welcome emails', 'Birthday greetings', 'Donation receipts', 'Event reminders'],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS messaging for notifications and reminders',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'bg-red-500',
    docsUrl: 'https://www.twilio.com/docs',
    setupUrl: 'https://console.twilio.com',
    envVars: [
      { key: 'TWILIO_ACCOUNT_SID', label: 'Account SID' },
      { key: 'TWILIO_AUTH_TOKEN', label: 'Auth Token', secret: true },
      { key: 'TWILIO_FROM_NUMBER', label: 'Phone Number' },
    ],
    features: ['SMS notifications', 'Event reminders', 'Birthday texts', 'Two-way messaging'],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'AI-powered message generation and content creation',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'bg-amber-500',
    docsUrl: 'https://ai.google.dev/docs',
    setupUrl: 'https://ai.google.dev/',
    envVars: [
      { key: 'GEMINI_API_KEY', label: 'API Key', secret: true },
    ],
    features: ['Personalized messages', 'Content suggestions', 'Prayer summaries', 'Welcome messages'],
  },
];

function IntegrationCard({
  config,
  isConnected,
  onTest,
  isTesting,
}: {
  config: IntegrationConfig;
  isConnected: boolean;
  onTest: () => void;
  isTesting: boolean;
}) {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${config.color} rounded-lg text-white`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {config.name}
                {isConnected ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-gray-400" />
                )}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {config.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={config.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Documentation"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onTest}
              disabled={isTesting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
              title="Test Connection"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status
          </span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              isConnected
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {isConnected ? 'Connected' : 'Not Configured'}
          </span>
        </div>
      </div>

      {/* Environment Variables */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Required Environment Variables
        </h4>
        <div className="space-y-2">
          {config.envVars.map((env) => (
            <div
              key={env.key}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm"
            >
              <div className="flex-1">
                <code className="text-xs text-gray-600 dark:text-gray-400">
                  {env.key}
                </code>
                <p className="text-xs text-gray-500">{env.label}</p>
              </div>
              <div className="flex items-center gap-1">
                {env.secret && (
                  <button
                    onClick={() => toggleSecret(env.key)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title={showSecrets[env.key] ? 'Hide' : 'Show'}
                  >
                    {showSecrets[env.key] ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                )}
                <button
                  onClick={() => copyToClipboard(env.key)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                  title="Copy variable name"
                >
                  {copied === env.key ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        <a
          href={config.setupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Get API Keys <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Features */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Features Enabled
        </h4>
        <div className="flex flex-wrap gap-2">
          {config.features.map((feature) => (
            <span
              key={feature}
              className={`px-2 py-1 text-xs rounded-full ${
                isConnected
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Integrations() {
  const [status, setStatus] = useState<IntegrationStatus>({
    stripe: false,
    twilio: false,
    resend: false,
    supabase: false,
    gemini: false,
  });
  const [testing, setTesting] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAllStatus = async () => {
    try {
      // Check backend health endpoint
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setStatus({
          stripe: data.stripe || false,
          twilio: data.twilio || false,
          resend: data.resend || false,
          supabase: data.supabase || false,
          gemini: data.gemini || false,
        });
      }
    } catch {
      // If health check fails, check individual env vars
      setStatus({
        stripe: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        twilio: !!import.meta.env.VITE_TWILIO_ACCOUNT_SID,
        resend: !!import.meta.env.VITE_RESEND_API_KEY,
        supabase: !!import.meta.env.VITE_SUPABASE_URL,
        gemini: false, // Backend only
      });
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkAllStatus();
  }, []);

  const testConnection = async (integrationId: string) => {
    setTesting(integrationId);
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, you'd call specific test endpoints
      // For now, just refresh the status
      await checkAllStatus();
    } finally {
      setTesting(null);
    }
  };

  const connectedCount = Object.values(status).filter(Boolean).length;
  const totalCount = Object.keys(status).length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Plug className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Integrations
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage your third-party service connections
              </p>
            </div>
          </div>
          <button
            onClick={checkAllStatus}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {connectedCount === totalCount ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : connectedCount > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium text-gray-900 dark:text-white">
                  {connectedCount} of {totalCount} integrations connected
                </span>
              </div>
              <div className="h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${(connectedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
            {lastChecked && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {INTEGRATIONS.map((integration) => (
          <IntegrationCard
            key={integration.id}
            config={integration}
            isConnected={status[integration.id as keyof IntegrationStatus]}
            onTest={() => testConnection(integration.id)}
            isTesting={testing === integration.id}
          />
        ))}
      </div>

      {/* Setup Instructions */}
      <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Setup Instructions
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
          <li>Create accounts on each service using the "Get API Keys" links above</li>
          <li>Copy the required environment variables to your <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env</code> file</li>
          <li>Restart the development server after adding new variables</li>
          <li>Click "Refresh Status" to verify connections</li>
        </ol>
        <p className="mt-4 text-sm text-blue-700 dark:text-blue-300">
          For production deployments, add these variables to your hosting platform's environment settings (Vercel, Netlify, etc.)
        </p>
      </div>
    </div>
  );
}

export default Integrations;
