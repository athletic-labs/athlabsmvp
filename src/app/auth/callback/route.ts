/**
 * OAuth Callback Handler
 * Handles authentication callbacks from OAuth providers (Google, GitHub, etc.)
 */

import { createSupabaseServerClientOptimized } from '@/lib/supabase/rls-optimized-client';
import { RBACService } from '@/lib/auth/rbac';
import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const provider = requestUrl.searchParams.get('provider') || 'unknown';

  // Handle OAuth errors
  if (error) {
    console.error('❌ OAuth error:', error);
    const errorUrl = new URL('/login', requestUrl.origin);
    errorUrl.searchParams.set('error', `oauth_${error}`);
    errorUrl.searchParams.set('provider', provider);
    return NextResponse.redirect(errorUrl);
  }

  // Handle missing authorization code
  if (!code) {
    console.error('❌ Missing authorization code');
    const errorUrl = new URL('/login', requestUrl.origin);
    errorUrl.searchParams.set('error', 'missing_code');
    return NextResponse.redirect(errorUrl);
  }

  try {
    const supabase = createSupabaseServerClientOptimized();

    // Exchange code for session

    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('❌ Code exchange error:', exchangeError);
      throw new Error(`Authentication failed: ${exchangeError.message}`);
    }

    if (!data.session?.user) {
      console.error('❌ No session or user after exchange');
      throw new Error('Authentication failed: No session created');
    }

    const { user, session } = data;

    // Check if user profile exists
    let userProfile = await getUserProfile(supabase, user.id);

    // Create profile if it doesn't exist (first OAuth login)
    if (!userProfile) {

      userProfile = await createUserProfile(supabase, user, provider);
      
      if (!userProfile) {
        throw new Error('Failed to create user profile');
      }
    } else {
      // Update existing profile with OAuth data
      await updateProfileWithOAuthData(supabase, user.id, user, provider);
    }

    // Log successful OAuth login
    await RBACService.logAuditEvent('login', 'oauth', user.id, {
      provider,
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent'),
    });

    // Update last login timestamp
    await updateLastLogin(supabase, user.id);

    // Determine redirect destination
    const redirectTo = getRedirectDestination(requestUrl, userProfile);

    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));

  } catch (error: any) {
    console.error('🚨 OAuth callback error:', error);
    
    // Attempt to log the error
    try {
      await RBACService.logAuditEvent('login', 'oauth_error', undefined, {
        provider,
        error: error.message,
        ip_address: getClientIP(request),
        user_agent: request.headers.get('user-agent'),
      });
    } catch (logError) {
      console.error('Failed to log OAuth error:', logError);
    }

    const errorUrl = new URL('/login', requestUrl.origin);
    errorUrl.searchParams.set('error', 'oauth_callback_failed');
    errorUrl.searchParams.set('message', error.message);
    return NextResponse.redirect(errorUrl);
  }
}

async function getUserProfile(supabase: any, userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        team_id,
        is_active,
        onboarding_completed,
        oauth_provider,
        oauth_provider_id
      `)
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

async function createUserProfile(supabase: any, user: any, provider: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '',
        last_name: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        role: 'team_staff', // Default role
        is_active: true,
        onboarding_completed: false,
        oauth_provider: provider,
        oauth_provider_id: user.user_metadata?.provider_id || user.user_metadata?.sub,
        last_login_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
}

async function updateProfileWithOAuthData(supabase: any, userId: string, user: any, provider: string) {
  try {
    const updates: any = {
      last_login_at: new Date().toISOString(),
      oauth_provider: provider,
      oauth_provider_id: user.user_metadata?.provider_id || user.user_metadata?.sub,
    };

    // Update name if not set or if it's different
    if (user.user_metadata?.full_name || user.user_metadata?.name) {
      const fullName = user.user_metadata.full_name || user.user_metadata.name;
      const nameParts = fullName.split(' ');
      updates.first_name = nameParts[0] || '';
      updates.last_name = nameParts.slice(1).join(' ') || '';
    }

    await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

  } catch (error) {
    console.error('Error updating profile with OAuth data:', error);
  }
}

async function updateLastLogin(supabase: any, userId: string) {
  try {
    await supabase
      .from('profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

function getRedirectDestination(requestUrl: URL, userProfile: any): string {
  // Check for stored redirect in state or URL params
  const redirectTo = requestUrl.searchParams.get('redirectTo') || requestUrl.searchParams.get('redirect_to');
  
  if (redirectTo && isValidRedirectUrl(redirectTo)) {
    return redirectTo;
  }

  // Determine based on user profile
  if (!userProfile.onboarding_completed) {
    return '/onboarding';
  }

  if (userProfile.role === 'athletic_labs_admin') {
    return '/admin/dashboard';
  }

  return '/dashboard';
}

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url, 'https://example.com');
    // Only allow relative URLs or URLs from same origin
    return parsedUrl.pathname.startsWith('/') && !url.includes('//');
  } catch {
    return false;
  }
}

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  return forwarded 
    ? forwarded.split(',')[0].trim()
    : realIP || clientIP || null;
}