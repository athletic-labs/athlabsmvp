/**
 * OAuth Authentication Button Component
 * Provides OAuth login buttons with proper styling and error handling
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/lib/design-system/components';
import { OAuthService, type OAuthProvider } from '@/lib/auth/oauth-service';
import { Loader2, AlertCircle } from 'lucide-react';

interface OAuthButtonProps {
  provider: OAuthProvider;
  redirectTo?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'text' | 'elevated' | 'filled' | 'outlined' | 'tonal';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function OAuthButton({
  provider,
  redirectTo,
  disabled = false,
  fullWidth = false,
  variant = 'outlined',
  onSuccess,
  onError,
  className,
}: OAuthButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const providerInfo = OAuthService.getProviderInfo(provider);

  if (!providerInfo || !providerInfo.enabled) {
    return null;
  }

  const handleClick = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Starting OAuth flow:', { provider, redirectTo });

      const result = await OAuthService.signInWithOAuth(provider, { redirectTo });

      if (result.error) {
        const errorMessage = OAuthService.getErrorMessage(result.error, provider);
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      if (result.url) {
        console.log('🚀 Redirecting to OAuth provider...');
        window.location.href = result.url;
        onSuccess?.();
      }
    } catch (err: any) {
      const errorMessage = err.message || `Failed to authenticate with ${providerInfo.displayName}`;
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('OAuth button error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = () => {
    const iconMap: Record<OAuthProvider, string> = {
      google: '🔍',
      github: '🐙',
      azure: '🏢',
      apple: '🍎',
    };
    return iconMap[provider] || '🔐';
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        variant={variant}
        fullWidth={fullWidth}
        className={className}
        leftIcon={
          loading ? (
            <Loader2 className="animate-spin h-4 w-4" />
          ) : (
            <span className="text-lg">{getProviderIcon()}</span>
          )
        }
      >
        {loading ? (
          `Connecting to ${providerInfo.displayName}...`
        ) : (
          `Continue with ${providerInfo.displayName}`
        )}
      </Button>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * OAuth Provider Selection Component
 * Shows all available OAuth providers
 */
interface OAuthProviderListProps {
  redirectTo?: string;
  onSuccess?: (provider: OAuthProvider) => void;
  onError?: (error: string, provider: OAuthProvider) => void;
  className?: string;
}

export function OAuthProviderList({
  redirectTo,
  onSuccess,
  onError,
  className,
}: OAuthProviderListProps) {
  const providers = OAuthService.getAvailableProviders();

  if (providers.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className || ''}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2">
        {providers.map((provider) => (
          <OAuthButton
            key={provider.name}
            provider={provider.name as OAuthProvider}
            redirectTo={redirectTo}
            fullWidth
            onSuccess={() => onSuccess?.(provider.name as OAuthProvider)}
            onError={(error) => onError?.(error, provider.name as OAuthProvider)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * OAuth Account Linking Component
 * For linking/unlinking OAuth accounts in settings
 */
interface OAuthAccountManagerProps {
  onLink?: (provider: OAuthProvider) => void;
  onUnlink?: (provider: OAuthProvider) => void;
  onError?: (error: string, provider: OAuthProvider) => void;
}

export function OAuthAccountManager({
  onLink,
  onUnlink,
  onError,
}: OAuthAccountManagerProps) {
  const [linkedProviders, setLinkedProviders] = useState<OAuthProvider[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    loadLinkedProviders();
  }, []);

  const loadLinkedProviders = async () => {
    try {
      const result = await OAuthService.getLinkedProviders();
      if (result.error) {
        console.error('Failed to load linked providers:', result.error);
      } else {
        setLinkedProviders(result.providers);
      }
    } catch (error) {
      console.error('Error loading linked providers:', error);
    }
  };

  const handleLink = async (provider: OAuthProvider) => {
    try {
      setLoading(prev => ({ ...prev, [provider]: true }));

      const result = await OAuthService.linkOAuthAccount(provider, '/settings');
      
      if (result.error) {
        onError?.(result.error, provider);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
        onLink?.(provider);
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to link account', provider);
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleUnlink = async (provider: OAuthProvider) => {
    try {
      setLoading(prev => ({ ...prev, [provider]: true }));

      const result = await OAuthService.unlinkOAuthAccount(provider);
      
      if (result.error) {
        onError?.(result.error, provider);
        return;
      }

      if (result.success) {
        setLinkedProviders(prev => prev.filter(p => p !== provider));
        onUnlink?.(provider);
      }
    } catch (error: any) {
      onError?.(error.message || 'Failed to unlink account', provider);
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const allProviders = OAuthService.getAvailableProviders();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Connected Accounts</h3>
      <div className="space-y-3">
        {allProviders.map((provider) => {
          const providerName = provider.name as OAuthProvider;
          const isLinked = linkedProviders.includes(providerName);
          const isLoading = loading[providerName];

          return (
            <div
              key={provider.name}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{provider.name === 'google' ? '🔍' : provider.name === 'github' ? '🐙' : '🔐'}</span>
                <div>
                  <div className="font-medium text-gray-900">{provider.displayName}</div>
                  <div className="text-sm text-gray-500">
                    {isLinked ? 'Connected' : 'Not connected'}
                  </div>
                </div>
              </div>

              <Button
                variant={isLinked ? 'outlined' : 'filled'}
                size="sm"
                onClick={() => isLinked ? handleUnlink(providerName) : handleLink(providerName)}
                disabled={isLoading}
                leftIcon={isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : undefined}
              >
                {isLoading ? 'Processing...' : isLinked ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OAuthButton;