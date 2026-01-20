import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in child components.
 * Prevents the entire app from crashing when one component fails.
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you could send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 max-w-md text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-gray-600 dark:text-dark-300 mb-4">
              We encountered an error loading this section. This has been logged and we'll look into it.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-500 dark:text-dark-400 mb-4 font-mono bg-gray-100 dark:bg-dark-800 p-2 rounded">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
