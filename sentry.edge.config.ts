import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Reduce sampling for edge functions
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  
  // Minimal configuration for edge runtime
  beforeSend(event) {
    // Filter middleware noise
    if (event.request?.url?.includes('/_next/static')) {
      return null;
    }
    return event;
  },
  
  initialScope: {
    tags: {
      component: 'edge',
    },
  },
});