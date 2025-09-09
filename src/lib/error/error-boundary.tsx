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
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-surface-container-lowest)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-[var(--md-sys-color-error)]" aria-hidden="true" />
          <h2 className="mt-6 md3-display-small font-bold text-[var(--md-sys-color-on-surface)]">
            Something went wrong
          </h2>
          <p className="mt-2 md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
            We apologize for the inconvenience. The error has been logged and our team has been notified.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer md3-body-small font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 md3-body-small bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] p-3 rounded-[var(--md-sys-shape-corner-small)] overflow-auto max-h-40">
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
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent md3-label-large font-medium rounded-[var(--md-sys-shape-corner-full)] text-[var(--md-sys-color-on-primary)] bg-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--md-sys-color-primary)]"
          >
            <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
            Try Again
          </button>
          
          <button
            onClick={handleGoHome}
            className="group relative w-full flex justify-center py-3 px-4 border border-[var(--md-sys-color-outline)] md3-label-large font-medium rounded-[var(--md-sys-shape-corner-full)] text-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-low)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--md-sys-color-primary)]"
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