'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SimpleAuthService } from '@/lib/auth/simple-auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, Button, TextField } from '@/lib/design-system/components';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await SimpleAuthService.signIn(data.email, data.password);
      
      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.user) {
        // Check if user needs onboarding
        if (!result.user.onboarding_completed) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else {
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
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--md-sys-color-on-surface)]">Email Address</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@team.com"
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent ${errors.email ? 'border-[var(--md-sys-color-error)]' : 'border-[var(--md-sys-color-outline)]'}`}
              />
              {errors.email && (
                <p className="text-sm text-[var(--md-sys-color-error)]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--md-sys-color-on-surface)]">Password</label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] placeholder:text-[var(--md-sys-color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent ${errors.password ? 'border-[var(--md-sys-color-error)]' : 'border-[var(--md-sys-color-outline)]'}`}
              />
              {errors.password && (
                <p className="text-sm text-[var(--md-sys-color-error)]">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              variant="filled"
              fullWidth
              leftIcon={loading ? <Loader2 className="animate-spin h-4 w-4" /> : undefined}
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