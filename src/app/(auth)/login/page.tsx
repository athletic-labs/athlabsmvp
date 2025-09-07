'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/auth-service';
import { supabaseConfig } from '@/lib/config/env';
import { Loader2, Info } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { TextFieldV2 } from '@/lib/design-system/components/TextFieldV2';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });
  
  // Debug form state
  React.useEffect(() => {
    console.log('📋 Form state:', { errors, isValid, errorKeys: Object.keys(errors) });
  }, [errors, isValid]);

  const onSubmit = async (data: LoginFormData) => {
    console.log('🚀 Form submitted!', { email: data.email, password: data.password?.length + ' chars' });
    try {
      setLoading(true);
      setError(null);
      
      console.log('📞 Calling AuthService.signIn...');
      const result = await AuthService.signIn(data.email, data.password);
      
      console.log('🔄 Auth result:', result);
      
      if (result.error) {
        console.log('❌ Auth error:', result.error);
        setError(result.error);
        return;
      }

      if (result.user) {
        console.log('👤 User authenticated:', result.user);
        // Check if user needs onboarding
        if (!result.user.onboarding_completed) {
          console.log('🚀 Redirecting to onboarding...');
          await new Promise(resolve => setTimeout(resolve, 200));
          window.location.replace('/onboarding');
        } else {
          console.log('🚀 Redirecting to dashboard...');
          
          // Add a small delay to ensure session cookies are fully set
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Use window.location.replace for more reliable post-auth navigation
          // This ensures a full page reload which helps with session synchronization
          window.location.replace('/dashboard');
        }
      } else {
        console.log('❌ No user in result');
        setError('Login failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--md-sys-color-surface-container-lowest)]">
      <div className="w-full max-w-md">
        <Card variant="elevated">
          <CardContent className="p-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/athletic-labs-logo.png"
              alt="Athletic Labs"
              width={200}
              height={60}
              className="h-12 w-auto"
              priority
            />
          </div>

          <h2 className="md3-headline-medium font-medium text-center mb-2 text-[var(--md-sys-color-on-surface)]">Welcome Back</h2>
          <p className="md3-body-large text-center text-[var(--md-sys-color-on-surface-variant)] mb-8">
            Sign in to your Athletic Labs account
          </p>


          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)] rounded-[var(--md-sys-shape-corner-small)] text-[var(--md-sys-color-on-error-container)] md3-body-small">
                {error}
              </div>
            )}

            <TextFieldV2
              {...register('email')}
              type="email"
              label="Email Address"
              placeholder="you@team.com"
              disabled={loading}
              error={!!errors.email}
              errorMessage={errors.email?.message}
              variant="outlined"
              fullWidth
            />

            <TextFieldV2
              {...register('password')}
              type="password"
              label="Password"
              placeholder="••••••••"
              disabled={loading}
              error={!!errors.password}
              errorMessage={errors.password?.message}
              variant="outlined"
              fullWidth
            />

            <Button
              type="submit"
              disabled={loading}
              variant="filled"
              fullWidth
              leftIcon={loading ? <Loader2 className="animate-spin h-4 w-4" /> : undefined}
              onClick={(e) => {
                console.log('🖱️ Button clicked!', { disabled: loading, errors: Object.keys(errors) });
                // Don't prevent default - let form submit handle it
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-smoke dark:border-smoke/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-navy text-navy/60 dark:text-white/60">
                  New to Athletic Labs?
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outlined" fullWidth asChild>
                <Link href="/request-access">Request Access</Link>
              </Button>
              <Button variant="text" fullWidth asChild>
                <Link href="/signup">Have an invitation code? Get Started</Link>
              </Button>
            </div>
          </div>

          <p className="mt-8 text-center md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
            For technical support, email{' '}
            <a href="mailto:support@athleticlabs.com" className="text-[var(--md-sys-color-primary)] hover:underline">
              support@athleticlabs.com
            </a>
          </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}