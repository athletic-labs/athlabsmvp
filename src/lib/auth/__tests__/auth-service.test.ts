import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth-service';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      insert: vi.fn(),
    })),
  })
}));

// Mock RBACService
vi.mock('../rbac', () => ({
  RBACService: {
    logAuditEvent: vi.fn(),
    getUserPermissions: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in valid user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };
      const mockSession = {
        access_token: 'token-123',
        expires_at: Date.now() / 1000 + 3600,
      };

      // Mock successful auth
      const authMock = vi.mocked(AuthService['supabase'].auth.signInWithPassword);
      authMock.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile fetch
      const profileMock = vi.mocked(AuthService['supabase'].from);
      profileMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                role: 'team_staff',
                team_id: 'team-123',
                is_active: true,
                onboarding_completed: true,
              },
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.user).toBeTruthy();
      expect(result.session).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid credentials', async () => {
      const authMock = vi.mocked(AuthService['supabase'].auth.signInWithPassword);
      authMock.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await AuthService.signIn('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle account lockout', async () => {
      // Mock lockout check
      const profileMock = vi.mocked(AuthService['supabase'].from);
      profileMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                failed_login_attempts: 5,
                locked_until: new Date(Date.now() + 1800000).toISOString(), // 30 min future
              },
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await AuthService.signIn('locked@example.com', 'password123');

      expect(result.user).toBeNull();
      expect(result.error).toContain('Account locked until');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user profile with permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      // Mock getUser
      const getUserMock = vi.mocked(AuthService['supabase'].auth.getUser);
      getUserMock.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock profile fetch
      const profileMock = vi.mocked(AuthService['supabase'].from);
      profileMock.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'user-123',
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                role: 'team_staff',
                team_id: 'team-123',
                is_active: true,
                teams: { name: 'Test Team' },
              },
              error: null,
            }),
          })),
        })),
      } as any);

      const result = await AuthService.getCurrentUser();

      expect(result).toBeTruthy();
      expect(result?.email).toBe('test@example.com');
      expect(result?.role).toBe('team_staff');
    });

    it('should return null for unauthenticated user', async () => {
      const getUserMock = vi.mocked(AuthService['supabase'].auth.getUser);
      getUserMock.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});