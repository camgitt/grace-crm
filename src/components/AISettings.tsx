import { useState, useEffect } from 'react';
import {
  Bot,
  Key,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  getAIConfig,
  saveAIConfig,
  testAIConnection,
  type AIConfig,
} from '../services/aiService';

export function AISettings() {
  const [config, setConfig] = useState<AIConfig>(getAIConfig());
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadedConfig = getAIConfig();
    setConfig(loadedConfig);
    setApiKey(loadedConfig.apiKey);
  }, []);

  const handleSave = () => {
    const newConfig = {
      ...config,
      apiKey,
    };
    saveAIConfig(newConfig);
    setConfig(newConfig);
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleToggleEnabled = () => {
    const newConfig = {
      ...config,
      enabled: !config.enabled,
    };
    saveAIConfig(newConfig);
    setConfig(newConfig);
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Save current key first
    saveAIConfig({ ...config, apiKey });

    const result = await testAIConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center">
          <Sparkles className="text-indigo-600 dark:text-indigo-400" size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
            AI Integration
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-400">
            Connect AI to power intelligent agent features
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-850 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <Bot size={20} className="text-gray-500 dark:text-dark-400" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
              Enable AI Features
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-400">
              Use AI to generate personalized messages and insights
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleEnabled}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            config.enabled
              ? 'bg-indigo-600'
              : 'bg-gray-300 dark:bg-dark-600'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
              config.enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Provider Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          AI Provider
        </label>
        <select
          value={config.provider}
          onChange={(e) => setConfig({ ...config, provider: e.target.value as AIConfig['provider'] })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
        >
          <option value="gemini">Google Gemini (Recommended - Free tier available)</option>
          <option value="openai" disabled>OpenAI GPT (Coming soon)</option>
          <option value="anthropic" disabled>Anthropic Claude (Coming soon)</option>
        </select>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          Model
        </label>
        <select
          value={config.model}
          onChange={(e) => setConfig({ ...config, model: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100"
        >
          <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast, cost-effective)</option>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro (More capable)</option>
          <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash (Experimental)</option>
        </select>
      </div>

      {/* API Key Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-2">
          <div className="flex items-center gap-2">
            <Key size={14} />
            API Key
          </div>
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Gemini API key"
          className="w-full px-3 py-2 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-dark-100 placeholder-gray-400"
        />
        <div className="mt-2 flex items-center gap-4">
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            Get a free API key from Google AI Studio
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/5 rounded-lg border border-amber-200 dark:border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300">
            <p className="font-medium mb-1">Privacy Note</p>
            <p>
              When AI is enabled, member data (names, status, giving amounts) may be sent to Google's
              servers to generate personalized messages. Your API key is stored locally in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          {saved ? (
            <>
              <CheckCircle size={16} />
              Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </button>
        <button
          onClick={handleTest}
          disabled={!apiKey || isTesting}
          className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-dark-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isTesting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Bot size={16} />
              Test Connection
            </>
          )}
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            testResult.success
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20'
              : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'
          }`}
        >
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  testResult.success
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-red-800 dark:text-red-300'
                }`}
              >
                {testResult.success ? 'Connection Successful!' : 'Connection Failed'}
              </p>
              <p
                className={`text-xs mt-1 ${
                  testResult.success
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-red-700 dark:text-red-400'
                }`}
              >
                {testResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Capabilities Info */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-dark-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100 mb-3">
          AI-Powered Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: 'Personalized Messages', desc: 'Birthday greetings, thank-you notes tailored to each member' },
            { title: 'Smart Insights', desc: 'AI analyzes patterns and suggests pastoral actions' },
            { title: 'Follow-up Suggestions', desc: 'Intelligent recommendations for member care' },
            { title: 'Content Generation', desc: 'Draft emails, notes, and communications' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-3 bg-gray-50 dark:bg-dark-850 rounded-lg"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                {feature.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-0.5">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
