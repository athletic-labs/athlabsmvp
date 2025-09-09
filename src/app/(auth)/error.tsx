'use client';

import React from 'react';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { AlertCircle } from 'lucide-react';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-surface-container-lowest)]">
      <div className="w-full max-w-md">
        <Card variant="elevated">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[var(--md-sys-color-error)]" />
            <h2 className="md3-headline-medium font-medium mb-2 text-[var(--md-sys-color-on-surface)]">
              Authentication Error
            </h2>
            <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mb-6">
              There was an error loading the authentication system. This might be due to missing environment configuration.
            </p>
            
            <div className="space-y-4">
              <Button variant="filled" onClick={reset} fullWidth>
                Try Again
              </Button>
              <Button variant="outlined" asChild fullWidth>
                <a href="/">Go to Home</a>
              </Button>
            </div>
            
            <details className="mt-6 text-left">
              <summary className="cursor-pointer md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                Technical Details
              </summary>
              <pre className="mt-2 p-3 bg-[var(--md-sys-color-surface-variant)] rounded md3-label-small overflow-auto">
                {error.message}
              </pre>
            </details>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}