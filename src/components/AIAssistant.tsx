/**
 * AI Assistant - Simple, practical AI tools for church staff
 */

import { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Loader2,
  MessageSquare,
  Mail,
  Heart,
  Gift,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { aiService } from '../lib/services/ai';

type MessageType = 'welcome' | 'birthday' | 'thank-you' | 'prayer' | 'follow-up' | 'custom';

interface QuickAction {
  id: MessageType;
  label: string;
  icon: React.ReactNode;
  description: string;
  placeholder: string;
  gradient: string;
  lightBg: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'welcome',
    label: 'Welcome Message',
    icon: <UserPlus size={20} />,
    description: 'Generate a warm welcome for new visitors or members',
    placeholder: "Enter the person's name (e.g., John Smith)",
    gradient: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
  },
  {
    id: 'birthday',
    label: 'Birthday Greeting',
    icon: <Gift size={20} />,
    description: 'Create a personalized birthday message',
    placeholder: "Enter the person's name (e.g., Sarah Johnson)",
    gradient: 'from-pink-500 to-rose-500',
    lightBg: 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20',
  },
  {
    id: 'thank-you',
    label: 'Donation Thank You',
    icon: <Heart size={20} />,
    description: 'Write a heartfelt thank you for a donation',
    placeholder: 'Enter name and amount (e.g., Mike Brown, $100)',
    gradient: 'from-emerald-500 to-teal-500',
    lightBg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
  {
    id: 'prayer',
    label: 'Prayer Response',
    icon: <MessageSquare size={20} />,
    description: 'Respond to a prayer request with care',
    placeholder: 'Enter name and brief prayer topic',
    gradient: 'from-purple-500 to-violet-500',
    lightBg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20',
  },
  {
    id: 'follow-up',
    label: 'Follow-up Message',
    icon: <Mail size={20} />,
    description: 'Create a follow-up message for engagement',
    placeholder: 'Enter name and context (e.g., missed last Sunday)',
    gradient: 'from-orange-500 to-amber-500',
    lightBg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  },
  {
    id: 'custom',
    label: 'Custom Message',
    icon: <Sparkles size={20} />,
    description: 'Generate any type of church communication',
    placeholder: 'Describe what you need (e.g., event invitation for youth group)',
    gradient: 'from-fuchsia-500 to-purple-500',
    lightBg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10 border-fuchsia-200 dark:border-fuchsia-500/20',
  },
];

export function AIAssistant() {
  const [selectedAction, setSelectedAction] = useState<MessageType | null>(null);
  const [input, setInput] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = aiService.isConfigured();

  const handleGenerate = async () => {
    if (!selectedAction || !input.trim()) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedMessage('');

    try {
      let result;
      const churchName = 'Grace Community Church';

      switch (selectedAction) {
        case 'welcome':
          result = await aiService.generateWelcomeMessage(input.trim(), churchName);
          break;
        case 'birthday':
          result = await aiService.generateBirthdayMessage(input.trim(), churchName);
          break;
        case 'thank-you':
          result = await aiService.generateDonationThankYou(input.trim(), '100', churchName);
          break;
        case 'prayer':
          result = await aiService.generatePrayerSummary([
            { name: input.trim(), request: 'prayer request', date: new Date().toISOString() },
          ]);
          break;
        case 'follow-up':
          result = await aiService.generateFollowUpTalkingPoints(input.trim(), 'follow-up needed');
          break;
        case 'custom':
          result = await aiService.generateCustomMessage(input.trim());
          break;
      }

      if (result.success && result.message) {
        setGeneratedMessage(result.message);
      } else {
        setError(result.error || 'Failed to generate message');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGeneratedMessage('');
    setInput('');
    setError(null);
  };

  const selectedActionData = quickActions.find((a) => a.id === selectedAction);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Hero Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-violet-500 p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mt-3">AI Assistant</h1>
            <p className="text-white/80 mt-1 text-lg">Generate personalized messages with the power of AI</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <MessageSquare className="text-white" size={40} />
            </div>
          </div>
        </div>
      </div>

      {!isConfigured && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-400">
            AI features require the <code className="bg-amber-100 dark:bg-amber-500/20 px-1 rounded">GEMINI_API_KEY</code> environment variable to be configured.
          </p>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">Choose a message type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setSelectedAction(action.id);
                setGeneratedMessage('');
                setInput('');
                setError(null);
              }}
              disabled={!isConfigured}
              className={`relative p-5 rounded-2xl border text-left transition-all overflow-hidden group hover:scale-[1.02] ${
                selectedAction === action.id
                  ? `${action.lightBg} shadow-lg`
                  : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 bg-white dark:bg-dark-850 hover:shadow-md'
              } ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                selectedAction === action.id
                  ? `bg-gradient-to-br ${action.gradient} text-white shadow-lg`
                  : 'bg-gray-100 dark:bg-dark-700 text-gray-400 dark:text-dark-500 group-hover:bg-gradient-to-br group-hover:' + action.gradient + ' group-hover:text-white'
              }`}>
                {action.icon}
              </div>
              <h3 className={`font-semibold text-sm ${selectedAction === action.id ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-dark-100'}`}>
                {action.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1.5 line-clamp-2">{action.description}</p>
              {selectedAction === action.id && (
                <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${action.gradient} rounded-full opacity-20`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      {selectedAction && (
        <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 p-6 mb-6">
          <h3 className="font-medium text-gray-900 dark:text-dark-100 mb-4 flex items-center gap-2">
            {selectedActionData?.icon}
            {selectedActionData?.label}
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-dark-400 mb-2">
                {selectedActionData?.placeholder}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedActionData?.placeholder}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800 text-gray-900 dark:text-dark-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!input.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Message
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Generated Message */}
      {generatedMessage && (
        <div className="bg-white dark:bg-dark-850 rounded-2xl border border-gray-200 dark:border-dark-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Generated Message
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-dark-400 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
              >
                <RefreshCw size={14} />
                New
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 rounded-lg transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 dark:text-dark-300">{generatedMessage}</p>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-800/50 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
              <Mail size={16} />
              Send as Email
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-dark-700 text-gray-700 dark:text-dark-300 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
              <Send size={16} />
              Send as SMS
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      {!selectedAction && isConfigured && (
        <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/5 dark:to-purple-500/5 rounded-2xl border border-violet-100 dark:border-violet-500/10">
          <h3 className="font-medium text-violet-900 dark:text-violet-300 mb-2">Tips for great messages</h3>
          <ul className="text-sm text-violet-700 dark:text-violet-400 space-y-1">
            <li>Include specific details about the person for more personalized messages</li>
            <li>You can always edit the generated message before sending</li>
            <li>Use the Custom Message option for any unique communication needs</li>
          </ul>
        </div>
      )}
    </div>
  );
}
