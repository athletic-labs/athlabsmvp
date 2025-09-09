import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-surface-container-lowest)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <FileQuestion className="mx-auto h-16 w-16 text-[var(--md-sys-color-on-surface-variant)]" />
          <h2 className="mt-6 text-3xl font-bold text-[var(--md-sys-color-on-surface)] md3-headline-large">
            Page Not Found
          </h2>
          <p className="mt-2 text-sm text-[var(--md-sys-color-on-surface-variant)] md3-body-medium">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-[var(--md-sys-color-outline)] text-sm font-medium rounded-md text-[var(--md-sys-color-on-surface)] bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-low)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--md-sys-color-primary)] md3-button-outlined"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}