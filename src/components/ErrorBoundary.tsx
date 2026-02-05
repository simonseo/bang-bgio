// Error boundary to catch and display React errors gracefully

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error Caught by Boundary:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ errorInfo });

    // Log to error tracking service (e.g., Sentry) in production
    if (process.env.NODE_ENV === 'production') {
      // window.errorTracker?.captureException(error, { extra: errorInfo });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-amber-900 to-red-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                🤠 Game Error!
              </h1>
              <p className="text-gray-600">
                Something went wrong during the game. This shouldn't happen!
              </p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Error Details:
              </h2>
              <p className="text-red-700 font-mono text-sm break-words">
                {this.state.error?.message || 'Unknown error'}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="bg-gray-100 p-4 rounded mb-6 cursor-pointer">
                <summary className="font-semibold text-gray-700 mb-2">
                  Stack Trace (Development Only)
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto max-h-64">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Restart Game
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Menu
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                If this error persists, please{' '}
                <a
                  href="https://github.com/your-repo/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  report it on GitHub
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component to wrap any component with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  onReset?: () => void
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary onReset={onReset}>
      <Component {...props} />
    </ErrorBoundary>
  );
}
