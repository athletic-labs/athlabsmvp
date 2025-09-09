'use client';

import { ErrorBoundary } from '@/lib/error/error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-6 md3-headline-large text-[var(--md-sys-color-on-surface)]">
                Application Error
              </h2>
              <p className="mt-2 md3-body-small text-gray-600">
                A critical error occurred. Please try refreshing the page.
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer md3-body-small font-medium text-gray-500 hover:text-gray-700">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 md3-label-small bg-gray-100 p-3 rounded overflow-auto max-h-40">
                    {error.message}
                    {error.digest && `\nDigest: ${error.digest}`}
                    {'\n\n'}
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={reset}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent md3-label-large font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 md3-label-large font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}