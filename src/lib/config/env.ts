import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Supabase Configuration - REQUIRED for production
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Supabase URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // Google Places API - REQUIRED for production
  GOOGLE_PLACES_API_KEY: z.string().min(1, 'Google Places API key is required'),
  
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

// Parse and validate environment variables
function parseEnv(): Env {
  try {
    const result = envSchema.parse(process.env);
    
    // Additional production-specific validations
    if (process.env.NODE_ENV === 'production') {
      // Ensure no demo/placeholder values in production
      const dangerousPatterns = ['demo', 'placeholder', 'localhost', 'example'];
      const sensitiveKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY']; // Temporarily remove GOOGLE_PLACES_API_KEY for bundle analysis
      
      for (const key of sensitiveKeys) {
        const value = result[key as keyof Env] as string;
        if (dangerousPatterns.some(pattern => value?.toLowerCase().includes(pattern))) {
          throw new Error(
            `🚨 PRODUCTION SECURITY ERROR: ${key} contains placeholder/demo value.\n` +
            `Current value: ${value}\n` +
            `Production deployments must use real credentials.`
          );
        }
      }
      
      // Ensure Supabase URL is not a demo URL
      if (result.NEXT_PUBLIC_SUPABASE_URL.includes('demo.supabase.co')) {
        throw new Error('🚨 PRODUCTION ERROR: Cannot use demo Supabase URL in production');
      }
    }
    
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      
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
  url: env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  isDemoMode,
} as const;

export const googleConfig = {
  placesApiKey: env.GOOGLE_PLACES_API_KEY,
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

// Runtime configuration validation - call this in middleware or app startup
export function validateEnvironment(): void {
  try {
    parseEnv();
    if (typeof console !== 'undefined') {
      console.log('✅ Environment validation passed');
    }
  } catch (error) {
    if (typeof console !== 'undefined') {
      console.error('❌ Environment validation failed:', error);
    }
    if (appConfig.isProduction && typeof process !== 'undefined' && process.exit) {
      process.exit(1); // Exit in production to prevent misconfigured deployments
    } else if (appConfig.isProduction) {
      throw new Error('Critical environment configuration error - deployment cannot continue');
    }
  }
}