import Link from 'next/link';
import { AlertTriangle, Home, LogOut, Shield } from 'lucide-react';

interface ErrorPageProps {
  searchParams: { type?: string };
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const errorType = searchParams.type || 'unknown';

  const errorMessages = {
    'account-suspended': {
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact support for assistance.',
      icon: Shield,
    },
    'team-suspended': {
      title: 'Team Access Suspended',
      message: 'Your team access has been suspended. Please contact your team administrator.',
      icon: Shield,
    },
    'insufficient-permissions': {
      title: 'Access Denied',
      message: 'You don\'t have permission to access this resource. Please contact your administrator.',
      icon: Shield,
    },
    'system-error': {
      title: 'System Error',
      message: 'A system error occurred. Please try again later or contact support.',
      icon: AlertTriangle,
    },
    'unknown': {
      title: 'Error',
      message: 'An unexpected error occurred. Please try again.',
      icon: AlertTriangle,
    },
  };

  const error = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.unknown;
  const Icon = error.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <Icon className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="mt-6 md3-headline-large text-[var(--md-sys-color-on-surface)]">
            {error.title}
          </h2>
          <p className="mt-2 md3-body-small text-gray-600 dark:text-gray-400">
            {error.message}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent md3-label-large font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          
          {errorType === 'insufficient-permissions' && (
            <Link
              href="/login"
              className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 md3-label-large font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Login as Different User
            </Link>
          )}
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 md3-label-large font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}