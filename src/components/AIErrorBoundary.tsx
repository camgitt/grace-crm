import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { getCircuitBreakerStatus } from '../lib/services/ai';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for AI-related components.
 * Catches errors and displays user-friendly error states.
 */
export class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[AIErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const circuitStatus = getCircuitBreakerStatus();

      return (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                AI Feature Temporarily Unavailable
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {circuitStatus.isOpen
                  ? `AI service is recovering. Try again in ${Math.ceil((circuitStatus.resetIn || 0) / 1000)} seconds.`
                  : 'There was an issue with the AI feature. Using default templates instead.'}
              </p>
              {this.props.onRetry && (
                <button
                  onClick={this.handleRetry}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Inline error state for AI message generation failures.
 * Use this when you want to show an error without breaking the entire UI.
 */
interface AIErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function AIErrorState({ message, onRetry, compact = false }: AIErrorStateProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
        <AlertTriangle size={14} />
        <span>{message || 'AI unavailable'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:underline"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
      <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
        <AlertTriangle size={16} />
        <span className="text-sm">{message || 'AI feature temporarily unavailable'}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex items-center gap-1 text-xs font-medium hover:underline"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading state for AI operations.
 */
interface AILoadingStateProps {
  message?: string;
}

export function AILoadingState({ message = 'Generating message...' }: AILoadingStateProps) {
  return (
    <div className="flex items-center gap-3 text-gray-500 dark:text-dark-400">
      <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

/**
 * Offline indicator for AI features.
 */
interface AIOfflineIndicatorProps {
  className?: string;
}

export function AIOfflineIndicator({ className = '' }: AIOfflineIndicatorProps) {
  const circuitStatus = getCircuitBreakerStatus();

  if (!circuitStatus.isOpen) return null;

  return (
    <div className={`flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs ${className}`}>
      <WifiOff size={12} />
      <span>AI offline</span>
    </div>
  );
}

/**
 * Success indicator when AI generates a message.
 */
interface AISuccessIndicatorProps {
  show: boolean;
  className?: string;
}

export function AISuccessIndicator({ show, className = '' }: AISuccessIndicatorProps) {
  if (!show) return null;

  return (
    <span className={`text-xs text-green-600 dark:text-green-400 ${className}`}>
      AI generated
    </span>
  );
}

/**
 * Fallback indicator when using template instead of AI.
 */
interface AIFallbackIndicatorProps {
  show: boolean;
  reason?: string;
  className?: string;
}

export function AIFallbackIndicator({ show, reason, className = '' }: AIFallbackIndicatorProps) {
  if (!show) return null;

  return (
    <span
      className={`text-xs text-gray-500 dark:text-dark-400 ${className}`}
      title={reason || 'AI was unavailable, using template'}
    >
      Using template
    </span>
  );
}
