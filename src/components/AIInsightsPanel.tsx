import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Heart,
  Info,
  RefreshCw,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { generateInsights, isAIEnabled, type AIInsight } from '../services/aiService';
import type { Person, Giving } from '../types';

interface AIInsightsPanelProps {
  people: Person[];
  giving: Giving[];
  onViewPerson?: (personId: string) => void;
  onConfigureAI?: () => void;
}

const insightIcons: Record<AIInsight['type'], React.ReactNode> = {
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  opportunity: <TrendingUp size={14} className="text-emerald-500" />,
  celebration: <Heart size={14} className="text-pink-500" />,
  info: <Info size={14} className="text-blue-500" />,
};

const insightColors: Record<AIInsight['type'], string> = {
  warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  opportunity: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  celebration: 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20',
  info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
};

export function AIInsightsPanel({ people, giving, onViewPerson, onConfigureAI }: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aiEnabled = isAIEnabled();

  const fetchInsights = async () => {
    if (!aiEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const newInsights = await generateInsights(people, giving);
      setInsights(newInsights);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to generate insights');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch on mount if AI is enabled
    if (aiEnabled && insights.length === 0) {
      fetchInsights();
    }
  }, [aiEnabled]);

  if (!aiEnabled) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-500" />
            AI Insights
          </h2>
        </div>
        <div className="text-center py-6">
          <Sparkles className="mx-auto text-gray-300 dark:text-dark-600 mb-3" size={32} />
          <p className="text-sm text-gray-500 dark:text-dark-400 mb-2">
            AI insights are not enabled
          </p>
          <p className="text-xs text-gray-400 dark:text-dark-500 mb-4">
            Configure your AI API key in settings to get intelligent insights about your congregation.
          </p>
          {onConfigureAI && (
            <button
              onClick={onConfigureAI}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
            >
              <Settings size={14} />
              Configure AI
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-gray-200 dark:border-dark-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-900 dark:text-dark-100 flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500" />
          AI Insights
        </h2>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-gray-400 dark:text-dark-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh insights"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading && insights.length === 0 ? (
        <div className="py-8 text-center">
          <RefreshCw className="mx-auto text-indigo-500 animate-spin mb-3" size={24} />
          <p className="text-sm text-gray-500 dark:text-dark-400">Analyzing your data...</p>
        </div>
      ) : insights.length === 0 ? (
        <div className="py-6 text-center">
          <Sparkles className="mx-auto text-gray-300 dark:text-dark-600 mb-2" size={24} />
          <p className="text-sm text-gray-500 dark:text-dark-400">No insights yet</p>
          <button
            onClick={fetchInsights}
            className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Generate insights
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${insightColors[insight.type]}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{insightIcons[insight.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {insight.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-dark-400 mt-0.5">
                    {insight.description}
                  </p>
                  {insight.actionSuggestion && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                      <ChevronRight size={10} />
                      {insight.actionSuggestion}
                    </p>
                  )}
                  {insight.personId && onViewPerson && (
                    <button
                      onClick={() => onViewPerson(insight.personId!)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                    >
                      View {insight.personName}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark-700">
        <p className="text-[10px] text-gray-400 dark:text-dark-500 flex items-center gap-1">
          <Sparkles size={10} />
          Powered by AI • Insights generated from your CRM data
        </p>
      </div>
    </div>
  );
}
