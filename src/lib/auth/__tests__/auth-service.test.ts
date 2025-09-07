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
    logAuditEvent: jest.fn(),
    getUserPermissions: jest.fn(),
  },
}));

describe('AuthService', () => {
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

      // Mock profile fetch for getCurrentUser
      const mockSelect = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      }));
      
      const mockSingle = mockSelect().eq().single;
      
      // First call: profiles table
      mockSingle
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
        // Second call: teams table
        .mockResolvedValueOnce({
          data: { name: 'Test Team' },
          error: null,
        });
      
      mockFrom.mockReturnValue({
        select: mockSelect,
      });

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

      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Connection failed' },
            }),
          })),
        })),
      });

      const result = await AuthService.signIn('test@example.com', 'password123');
      
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toBe('Connection failed');
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

      // Mock profile fetch
      mockFrom.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
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
      });

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