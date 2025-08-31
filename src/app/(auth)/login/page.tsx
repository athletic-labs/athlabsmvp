'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SimpleAuthService } from '@/lib/auth/simple-auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-smoke/20 to-white dark:from-navy dark:to-navy/90">
      <div className="w-full max-w-md">
        <div className="md-card">
          <div className="flex justify-center mb-8">
            <h1 className="text-3xl font-bold">Athletic Labs</h1>
          </div>

          <h2 className="text-2xl font-medium text-center mb-2">Welcome Back</h2>
          <p className="text-center text-navy/60 dark:text-white/60 mb-8">
            Sign in to your Athletic Labs account
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="md-text-field"
                placeholder="you@team.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="md-text-field"
                placeholder="••••••••"
                disabled={loading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md-filled-button w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
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
              <Link href="/request-access" className="md-outlined-button w-full text-center block">
                Request Access
              </Link>
              <Link href="/signup" className="md-text-button w-full text-center block">
                Have an invitation code? Get Started
              </Link>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-navy/60 dark:text-white/60">
            For technical support, email{' '}
            <a href="mailto:support@athleticlabs.com" className="text-electric-blue hover:underline">
              support@athleticlabs.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}