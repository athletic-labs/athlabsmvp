import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Configure integrations
  integrations: [
    // Database performance monitoring
    Sentry.postgresIntegration(),
    // HTTP request monitoring
    Sentry.httpIntegration(),
  ],
  
  // Filter out noisy server errors
  beforeSend(event) {
    // Don't send health check failures
    if (event.request?.url?.includes('/api/health')) {
      return null;
    }
    return event;
  },
  
  // Add server context
  initialScope: {
    tags: {
      component: 'server',
    },
  },
  
  // Profile sample rate
  profilesSampleRate: 0.1,
});