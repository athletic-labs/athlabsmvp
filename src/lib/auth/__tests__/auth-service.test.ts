import { AuthService } from '../auth-service';
import { createSupabaseClient } from '@/lib/supabase/client';

// Mock Supabase client
const mockAuth = {
  signInWithPassword: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  updateUser: jest.fn(),
};

const mockFrom = jest.fn(() => ({
  select: jest.fn(() => ({
    eq: jest.fn(() => ({
      single: jest.fn(),
    })),
  })),
  update: jest.fn(() => ({
    eq: jest.fn(),
  })),
  insert: jest.fn(),
}));

const mockSupabaseClient = {
  auth: mockAuth,
  from: mockFrom,
};

jest.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: jest.fn(() => mockSupabaseClient),
}));

// Mock RBACService
jest.mock('../rbac', () => ({
  RBACService: {
    logAuditEvent: jest.fn().mockResolvedValue(undefined),
    getUserPermissions: jest.fn().mockResolvedValue([]),
  },
}));

describe('AuthService', () => {
  // Mock private AuthService methods to avoid database calls
  beforeAll(() => {
    (AuthService as any).resetFailedAttempts = jest.fn().mockResolvedValue(undefined);
    (AuthService as any).updateLastLogin = jest.fn().mockResolvedValue(undefined);
    (AuthService as any).handleFailedLogin = jest.fn().mockResolvedValue(undefined);
  });
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks to default state
    mockAuth.signInWithPassword.mockClear();
    mockAuth.getUser.mockClear();
    mockFrom.mockClear();
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
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock getCurrentUser call (which is called inside signIn)
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Create a proper mock chain for profiles table
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
          data: { name: 'Test Team' },
          error: null,
        });

      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await AuthService.signIn('test@example.com', 'password123');

      expect(result.user).toBeTruthy();
      expect(result.session).toBeTruthy();
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const result = await AuthService.signIn('test@example.com', 'wrongpassword');
      
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle database connection errors', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' }, session: { access_token: 'token-123' } },
        error: null,
      });

      // Mock database error when getting user profile
      mockAuth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // Mock database error in profile fetch
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Connection failed' },
      });

      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await AuthService.signIn('test@example.com', 'password123');
      
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Unable to load user profile');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user profile with permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      // Mock getUser
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock profile fetch - first call for profile, second for team
      const mockSingle = jest.fn()
        .mockResolvedValueOnce({
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
        })
        .mockResolvedValueOnce({
          data: { name: 'Test Team' },
          error: null,
        });

      const mockEq = jest.fn(() => ({ single: mockSingle }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      mockFrom.mockReturnValue({ select: mockSelect });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeTruthy();
      expect(result?.email).toBe('test@example.com');
      expect(result?.role).toBe('team_staff');
    });

    it('should return null for unauthenticated user', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const result = await AuthService.getCurrentUser();

      expect(result).toBeNull();
    });
  });
});