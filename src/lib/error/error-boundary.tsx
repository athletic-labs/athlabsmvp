'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter();

  const handleGoHome = () => {
    router.push('/dashboard');
    resetErrorBoundary();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We apologize for the inconvenience. The error has been logged and our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-500 hover:text-gray-700">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                {error.message}
                {'\n\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function onError(error: Error, errorInfo: any) {
  console.error('Error Boundary caught an error:', error, errorInfo);
  
  // Log to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    // This would integrate with your monitoring service (Sentry, etc.)
    try {
      // Example: Sentry.captureException(error, { contexts: { errorBoundary: errorInfo } });
      console.error('Production error logged:', { error: error.message, stack: error.stack });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || ErrorFallback}
      onError={onError}
      onReset={() => {
        // Additional cleanup logic if needed
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Async error boundary for handling promises
export class AsyncErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<ErrorFallbackProps> },
  { error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    onError(error, errorInfo);
  }

  render() {
    if (this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ error: null })}
        />
      );
    }

    return this.props.children;
  }
}