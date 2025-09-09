/**
 * OAuth Authentication Service
 * Handles OAuth provider configurations and authentication flows
 */

import { createSupabaseClient } from '@/lib/supabase/client';
import { createSupabaseServerClientOptimized } from '@/lib/supabase/rls-optimized-client';

export type OAuthProvider = 'google' | 'github' | 'azure' | 'apple';

export interface OAuthConfig {
  provider: OAuthProvider;
  enabled: boolean;
  clientId?: string;
  scopes?: string[];
  redirectTo?: string;
  additionalOptions?: Record<string, any>;
}

export interface OAuthProviderInfo {
  name: string;
  displayName: string;
  icon: string;
  buttonClass: string;
  enabled: boolean;
}

export class OAuthService {
  private static readonly OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderInfo> = {
    google: {
      name: 'google',
      displayName: 'Google',
      icon: '/icons/google.svg',
      buttonClass: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-900',
      enabled: true,
    },
    github: {
      name: 'github',
      displayName: 'GitHub',
      icon: '/icons/github.svg',
      buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
      enabled: true,
    },
    azure: {
      name: 'azure',
      displayName: 'Microsoft',
      icon: '/icons/microsoft.svg',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      enabled: false,
    },
    apple: {
      name: 'apple',
      displayName: 'Apple',
      icon: '/icons/apple.svg',
      buttonClass: 'bg-black hover:bg-gray-900 text-white',
      enabled: false,
    },
  };

  /**
   * Get list of available OAuth providers
   */
  static getAvailableProviders(): OAuthProviderInfo[] {
    return Object.values(this.OAUTH_PROVIDERS).filter(provider => provider.enabled);
  }

  /**
   * Get OAuth provider information
   */
  static getProviderInfo(provider: OAuthProvider): OAuthProviderInfo | null {
    return this.OAUTH_PROVIDERS[provider] || null;
  }

  /**
   * Initiate OAuth authentication flow (client-side)
   */
  static async signInWithOAuth(
    provider: OAuthProvider, 
    options: { redirectTo?: string } = {}
  ): Promise<{ url?: string; error?: string }> {
    try {
      const supabase = createSupabaseClient();
      
      // Prepare redirect URL
      const redirectTo = options.redirectTo || '/auth/callback';
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fullRedirectUrl = `${baseUrl}${redirectTo}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: fullRedirectUrl,
          scopes: this.getProviderScopes(provider),
          queryParams: {
            provider: provider, // Pass provider info for callback handling
          },
        },
      });

      if (error) {
        console.error('❌ OAuth initiation error:', error);
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error: any) {
      console.error('🚨 OAuth service error:', error);
      return { error: error.message || 'OAuth authentication failed' };
    }
  }

  /**
   * Handle OAuth callback (server-side)
   */
  static async handleCallback(
    code: string,
    provider: OAuthProvider
  ): Promise<{ user?: any; session?: any; error?: string }> {
    try {
      const supabase = createSupabaseServerClientOptimized();

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ OAuth callback error:', error);
        return { error: error.message };
      }

      if (!data.session?.user) {
        return { error: 'No session created' };
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('🚨 OAuth callback processing error:', error);
      return { error: error.message || 'OAuth callback failed' };
    }
  }

  /**
   * Check if OAuth provider is configured and enabled
   */
  static isProviderEnabled(provider: OAuthProvider): boolean {
    const providerInfo = this.OAUTH_PROVIDERS[provider];
    return providerInfo?.enabled || false;
  }

  /**
   * Get OAuth provider scopes
   */
  private static getProviderScopes(provider: OAuthProvider): string {
    const scopeMap: Record<OAuthProvider, string> = {
      google: 'openid email profile',
      github: 'user:email',
      azure: 'openid email profile',
      apple: 'email name',
    };

    return scopeMap[provider] || '';
  }

  /**
   * Validate OAuth provider configuration
   */
  static validateProviderConfig(provider: OAuthProvider): {
    isValid: boolean;
    missingConfig: string[];
    warnings: string[];
  } {
    const missingConfig: string[] = [];
    const warnings: string[] = [];

    // Check if provider is enabled
    if (!this.isProviderEnabled(provider)) {
      warnings.push(`${provider} provider is not enabled`);
    }

    // Provider-specific validation
    switch (provider) {
      case 'google':
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          missingConfig.push('NEXT_PUBLIC_SUPABASE_URL');
        }
        if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          missingConfig.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        }
        break;
      case 'github':
        // GitHub OAuth requires specific Supabase configuration
        warnings.push('Ensure GitHub OAuth app is configured in Supabase dashboard');
        break;
      case 'azure':
        warnings.push('Azure AD OAuth requires tenant configuration');
        break;
      case 'apple':
        warnings.push('Apple OAuth requires additional service configuration');
        break;
    }

    return {
      isValid: missingConfig.length === 0,
      missingConfig,
      warnings,
    };
  }

  /**
   * Get OAuth error messages
   */
  static getErrorMessage(errorCode: string, provider?: OAuthProvider): string {
    const errorMessages: Record<string, string> = {
      'oauth_access_denied': 'Access was denied. Please try again.',
      'oauth_invalid_request': 'Invalid OAuth request. Please try again.',
      'oauth_unauthorized_client': 'OAuth configuration error. Please contact support.',
      'oauth_unsupported_response_type': 'OAuth configuration error. Please contact support.',
      'oauth_invalid_scope': 'Invalid permissions requested. Please contact support.',
      'oauth_server_error': 'OAuth provider error. Please try again.',
      'oauth_temporarily_unavailable': 'OAuth service temporarily unavailable. Please try again later.',
      'oauth_callback_failed': 'OAuth authentication failed. Please try again.',
      'missing_code': 'OAuth authorization code missing. Please try again.',
    };

    const defaultMessage = `OAuth authentication failed${provider ? ` with ${provider}` : ''}. Please try again.`;
    return errorMessages[errorCode] || defaultMessage;
  }

  /**
   * Link OAuth account to existing user
   */
  static async linkOAuthAccount(
    provider: OAuthProvider,
    redirectTo?: string
  ): Promise<{ url?: string; error?: string }> {
    try {
      const supabase = createSupabaseClient();

      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { error: 'User must be logged in to link OAuth account' };
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const fullRedirectUrl = `${baseUrl}${redirectTo || '/auth/callback'}`;

      const { data, error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: fullRedirectUrl,
          scopes: this.getProviderScopes(provider),
        },
      });

      if (error) {
        console.error('❌ OAuth linking error:', error);
        return { error: error.message };
      }

      return { url: data.url };
    } catch (error: any) {
      console.error('🚨 OAuth linking service error:', error);
      return { error: error.message || 'Failed to link OAuth account' };
    }
  }

  /**
   * Unlink OAuth account from user
   */
  static async unlinkOAuthAccount(provider: OAuthProvider): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createSupabaseClient();

      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        return { success: false, error: 'User must be logged in to unlink OAuth account' };
      }

      // Find the identity to unlink
      const identity = user.identities?.find(identity => identity.provider === provider);
      if (!identity) {
        return { success: false, error: `No ${provider} account found to unlink` };
      }

      const { error } = await supabase.auth.unlinkIdentity(identity);

      if (error) {
        console.error('❌ OAuth unlinking error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('🚨 OAuth unlinking service error:', error);
      return { success: false, error: error.message || 'Failed to unlink OAuth account' };
    }
  }

  /**
   * Get linked OAuth providers for current user
   */
  static async getLinkedProviders(): Promise<{ providers: OAuthProvider[]; error?: string }> {
    try {
      const supabase = createSupabaseClient();

      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return { providers: [], error: 'User not authenticated' };
      }

      // Extract linked providers from user identities
      const linkedProviders: OAuthProvider[] = [];
      if (user.identities) {
        for (const identity of user.identities) {
          const provider = identity.provider as OAuthProvider;
          if (this.OAUTH_PROVIDERS[provider] && !linkedProviders.includes(provider)) {
            linkedProviders.push(provider);
          }
        }
      }

      return { providers: linkedProviders };
    } catch (error: any) {
      console.error('🚨 Error getting linked providers:', error);
      return { providers: [], error: error.message };
    }
  }
}

export default OAuthService;