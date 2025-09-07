import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  
  // Supabase Configuration - with fallbacks for demo mode
  NEXT_PUBLIC_SUPABASE_URL: z.string().default('https://demo.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().default('demo_anon_key_placeholder'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('demo_service_key_placeholder'),
  
  // Google Places API - optional for demo
  GOOGLE_PLACES_API_KEY: z.string().default('demo_places_key'),
  
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
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(
        `Environment validation failed:\n${missingVars.join('\n')}\n\n` +
        `Please check your .env.local file and ensure all required variables are set.\n` +
        `Refer to .env.example for the complete list of variables.`
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
    console.log('✅ Environment validation passed');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    if (appConfig.isProduction) {
      process.exit(1); // Exit in production to prevent misconfigured deployments
    }
  }
}