import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { POST, GET } from '../v1/orders/route';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: jest.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: jest.fn(),
      })),
    })),
  }),
}));

jest.mock('@/lib/validation/validation-service', () => ({
  ValidationService: {
    validateData: jest.fn(),
  },
}));

jest.mock('@/lib/error/error-service', () => ({
  ErrorService: {
    handleError: jest.fn(),
    createError: jest.fn(),
  },
}));

describe('/api/v1/orders', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = new NextRequest('http://localhost:3000/api/v1/orders');
  });

  describe('POST /api/v1/orders', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        contactName: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@example.com',
        deliveryDate: '2024-12-25',
        deliveryTime: '12:00',
        deliveryAddress: '123 Main St, City, State 12345',
        estimatedGuests: 50,
        items: [{
          type: 'template',
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1
        }]
      };

      // Mock validation success
      const ValidationService = await import('@/lib/validation/validation-service');
      jest.mocked(ValidationService.ValidationService.validateData).mockReturnValue({
        isValid: true,
        data: orderData,
        errors: {},
      });

      // Mock Supabase success
      const supabaseMock = await import('@/lib/supabase/server');
      const mockSupabase = jest.mocked(supabaseMock.createSupabaseServerClient());
      
      jest.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      jest.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-123', team_id: 'team-123', role: 'team_staff' },
              error: null,
            }),
          })),
        })),
        insert: vi.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: [{ id: 'order-123', ...orderData }],
            error: null,
          }),
        })),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('order-123');
    });

    it('should reject order with invalid data', async () => {
      const invalidData = {
        contactName: 'J', // Too short
        contactEmail: 'invalid-email',
        estimatedGuests: 5, // Below minimum
      };

      const ValidationService = await import('@/lib/validation/validation-service');
      jest.mocked(ValidationService.ValidationService.validateData).mockReturnValue({
        isValid: false,
        data: null,
        errors: {
          contactName: ['Contact name must be at least 2 characters'],
          contactEmail: ['Invalid email address'],
          estimatedGuests: ['Minimum 10 guests'],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should return paginated orders for authenticated user', async () => {
      const mockOrders = [
        { id: 'order-1', contact_name: 'John Doe', status: 'confirmed' },
        { id: 'order-2', contact_name: 'Jane Smith', status: 'pending' },
      ];

      const supabaseMock = await import('@/lib/supabase/server');
      const mockSupabase = jest.mocked(supabaseMock.createSupabaseServerClient());
      
      jest.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      jest.mocked(mockSupabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'user-123', team_id: 'team-123', role: 'team_staff' },
              error: null,
            }),
          })),
          order: vi.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: mockOrders,
              error: null,
              count: 2,
            }),
          })),
        })),
      } as any);

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should return 401 for unauthenticated user', async () => {
      const supabaseMock = await import('@/lib/supabase/server');
      const mockSupabase = jest.mocked(supabaseMock.createSupabaseServerClient());
      
      jest.mocked(mockSupabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const response = await GET(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
    });
  });
});