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
}

const quickActions: QuickAction[] = [
  {
    id: 'welcome',
    label: 'Welcome Message',
    icon: <UserPlus size={18} />,
    description: 'Generate a warm welcome for new visitors or members',
    placeholder: "Enter the person's name (e.g., John Smith)",
  },
  {
    id: 'birthday',
    label: 'Birthday Greeting',
    icon: <Gift size={18} />,
    description: 'Create a personalized birthday message',
    placeholder: "Enter the person's name (e.g., Sarah Johnson)",
  },
  {
    id: 'thank-you',
    label: 'Donation Thank You',
    icon: <Heart size={18} />,
    description: 'Write a heartfelt thank you for a donation',
    placeholder: 'Enter name and amount (e.g., Mike Brown, $100)',
  },
  {
    id: 'prayer',
    label: 'Prayer Response',
    icon: <MessageSquare size={18} />,
    description: 'Respond to a prayer request with care',
    placeholder: 'Enter name and brief prayer topic',
  },
  {
    id: 'follow-up',
    label: 'Follow-up Message',
    icon: <Mail size={18} />,
    description: 'Create a follow-up message for engagement',
    placeholder: 'Enter name and context (e.g., missed last Sunday)',
  },
  {
    id: 'custom',
    label: 'Custom Message',
    icon: <Sparkles size={18} />,
    description: 'Generate any type of church communication',
    placeholder: 'Describe what you need (e.g., event invitation for youth group)',
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-100">AI Assistant</h1>
            <p className="text-gray-500 dark:text-dark-400">Generate personalized messages with AI</p>
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
        <h2 className="text-sm font-medium text-gray-700 dark:text-dark-300 mb-3">Choose a message type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedAction === action.id
                  ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10'
                  : 'border-gray-200 dark:border-dark-700 hover:border-gray-300 dark:hover:border-dark-600 bg-white dark:bg-dark-850'
              } ${!isConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`mb-2 ${selectedAction === action.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-400 dark:text-dark-500'}`}>
                {action.icon}
              </div>
              <h3 className={`font-medium text-sm ${selectedAction === action.id ? 'text-violet-900 dark:text-violet-300' : 'text-gray-900 dark:text-dark-100'}`}>
                {action.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">{action.description}</p>
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
