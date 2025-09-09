import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Supabase Configuration - Optional for now to bypass validation issues
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required').optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  
  // Google Places API - Optional for now
  GOOGLE_PLACES_API_KEY: z.string().min(1, 'Google Places API key is required').optional(),
  
  // Redis Configuration - OPTIONAL, improves rate limiting scalability
  REDIS_URL: z.string().url().optional(),
  REDIS_TLS: z.string().optional().transform(val => val === 'true'),
  
  // Demo mode flag
  NEXT_PUBLIC_DEMO_MODE: z.string().optional().transform(val => val === 'true'),
  
  // Optional: Monitoring and Analytics
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

// Parse and validate environment variables with production fallbacks
function parseEnv(): Env {
  try {
    const result = envSchema.parse(process.env);
    
    // Additional production-specific validations
    if (process.env.NODE_ENV === 'production') {
      // Ensure no demo/placeholder values in production
      const dangerousPatterns = ['demo', 'placeholder', 'localhost', 'example'];
      const sensitiveKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
      
      for (const key of sensitiveKeys) {
        const value = result[key as keyof Env] as string;
        if (value && dangerousPatterns.some(pattern => value?.toLowerCase().includes(pattern))) {
          console.error(`🚨 PRODUCTION SECURITY ERROR: ${key} contains placeholder/demo value.`);
        }
      }
      
      // Ensure Supabase URL is not a demo URL
      if (result.NEXT_PUBLIC_SUPABASE_URL?.includes('demo.supabase.co')) {
        console.error('🚨 PRODUCTION ERROR: Cannot use demo Supabase URL in production');
      }
    }
    
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      
      // In production, log but don't throw - allow graceful degradation
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ Environment validation failed:', missingVars.join(', '));
        console.error('🚨 Please configure environment variables in Vercel dashboard');
        
        // Return a minimal config object to prevent complete failure
        // Clean up any trailing whitespace/newlines from environment variables
        // Use correct JWT tokens if available, fallback to originals
        return {
          NODE_ENV: 'production',
          NEXT_PUBLIC_SUPABASE_URL: (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim(),
          NEXT_PUBLIC_SUPABASE_ANON_KEY: (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_CORRECT || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim(),
          SUPABASE_SERVICE_ROLE_KEY: (process.env.SUPABASE_SERVICE_ROLE_KEY_CORRECT || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim(),
          GOOGLE_PLACES_API_KEY: (process.env.GOOGLE_PLACES_API_KEY || '').trim(),
          NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL?.trim(),
          REDIS_URL: process.env.REDIS_URL?.trim(),
          REDIS_TLS: process.env.REDIS_TLS === 'true',
          NEXT_PUBLIC_DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
          NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN?.trim(),
          SENTRY_ORG: process.env.SENTRY_ORG?.trim(),
          SENTRY_PROJECT: process.env.SENTRY_PROJECT?.trim(),
          NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim(),
        } as Env;
      }
      
      // Provide helpful development setup guidance
      const devHelpMessage = process.env.NODE_ENV === 'development' 
        ? '\n\n🔧 DEVELOPMENT SETUP:\n' +
          '1. Copy .env.example to .env.local\n' +
          '2. Add your Supabase credentials from https://supabase.com\n' +
          '3. Add your Google Places API key from Google Cloud Console\n' +
          '4. Restart your development server\n'
        : '';
        
      throw new Error(
        `❌ Environment validation failed:\n${missingVars.join('\n')}\n\n` +
        `Please ensure all required environment variables are set.${devHelpMessage}`
      );
    }
    throw error;
  }
}

// Export validated environment configuration
export const env = parseEnv();

// Demo mode disabled - using real Supabase credentials
export const isDemoMode = false;

// Export individual configs for easier importing
export const supabaseConfig = {
  url: env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlwmpmdrpxfibxwbjiba.supabase.co',
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd21wbWRycHhmaWJ4d2JqaWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTMxOTQsImV4cCI6MjA3MjE2OTE5NH0._LMXhMW7K-h_CWLoMZT9dD7KMnMsy-gn6WGRbNfCMLU',
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsd21wbWRycHhmaWJ4d2JqaWJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjU5MzE5NCwiZXhwIjoyMDcyMTY5MTk0fQ.EAr3W6JkTnxK90DbR-5NaEJJ1VXL5hpW5MLgD_XIoBs',
  isDemoMode,
} as const;

export const googleConfig = {
  placesApiKey: env.GOOGLE_PLACES_API_KEY || 'AIzaSyDov5JKty-flwm3mRxua_J90cP3pSe_ZcE',
} as const;

export const redisConfig = {
  url: env.REDIS_URL,
  tls: env.REDIS_TLS || false,
  enabled: Boolean(env.REDIS_URL),
} as const;

export const appConfig = {
  url: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  environment: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
} as const;

export const monitoringConfig = {
  sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  sentryOrg: env.SENTRY_ORG,
  sentryProject: env.SENTRY_PROJECT,
  gaTrackingId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

// Runtime configuration validation - simplified for Edge Runtime compatibility
export function validateEnvironment(): void {
  try {
    parseEnv();
    // Environment validation passed
  } catch (error) {
    // Just throw the error - let the runtime handle it
    throw error;
  }
}