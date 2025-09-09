import { z } from 'zod';

// Common validation schemas
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email format');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format');
export const dateSchema = z.string().datetime('Invalid date format');
export const positiveIntSchema = z.number().int().positive('Must be a positive integer');
export const nonNegativeNumberSchema = z.number().nonnegative('Must be non-negative');

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

// Order-related schemas
export const orderStatusSchema = z.enum([
  'draft', 'pending', 'confirmed', 'preparing', 
  'out_for_delivery', 'delivered', 'cancelled'
]);

export const paymentStatusSchema = z.enum([
  'pending', 'processing', 'succeeded', 'failed', 'refunded'
]);

export const orderItemSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1, 'Item name is required').max(255),
  quantity: positiveIntSchema,
  unitPrice: nonNegativeNumberSchema,
  servings: z.number().int().min(1).optional(),
  category: z.string().optional(),
  panSize: z.enum(['half', 'full']).optional(),
  notes: z.string().max(500).optional(),
});

export const createOrderSchema = z.object({
  // Order details
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  
  // Delivery information
  deliveryDate: z.string().refine((date) => {
    const deliveryDate = new Date(date);
    const now = new Date();
    const hoursFromNow = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursFromNow >= 24;
  }, 'Delivery must be at least 24 hours from now'),
  
  deliveryTime: z.string().optional(),
  deliveryLocation: z.string().min(1, 'Delivery location is required').max(500),
  deliveryTiming: z.enum([
    'arrival', 'pre-game', 'post-game', 'flight-out', 'intermission', 'custom'
  ]),
  
  // Contact information
  contactName: z.string().min(1, 'Contact name is required').max(100),
  contactPhone: phoneSchema,
  contactEmail: emailSchema,
  
  // Additional details
  estimatedGuests: z.number().int().min(1).max(1000),
  notes: z.string().max(1000).optional(),
  specialInstructions: z.string().max(500).optional(),
});

export const updateOrderSchema = createOrderSchema.partial().extend({
  id: uuidSchema,
  status: orderStatusSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
});

// Places API validation
export const placesAutocompleteSchema = z.object({
  input: z.string().min(3, 'Search query must be at least 3 characters').max(100),
  types: z.string().optional(),
  radius: z.number().int().min(0).max(50000).optional(),
});

// User and team schemas
export const userRoleSchema = z.enum([
  'team_staff', 'team_admin', 'athletic_labs_admin', 'athletic_labs_staff'
]);

export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  phone: phoneSchema.optional(),
  role: userRoleSchema.default('team_staff'),
  teamId: uuidSchema.optional(),
});

export const updateUserSchema = createUserSchema.partial().extend({
  id: uuidSchema,
});

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  leagueId: uuidSchema,
  rosterSize: z.number().int().min(1).max(200).default(60),
  proteinTarget: z.number().int().min(0).max(100).optional(),
  carbsTarget: z.number().int().min(0).max(100).optional(),
  fatsTarget: z.number().int().min(0).max(100).optional(),
  billingEmail: emailSchema.optional(),
  taxRate: z.number().min(0).max(1).default(0.0875),
});

// Template item schema (more flexible than order item)
export const templateItemSchema = z.object({
  id: z.string().min(1, 'Item ID is required'), // Allow non-UUID IDs like 'p1', 'p2'
  name: z.string().min(1, 'Item name is required').max(255),
  quantity: positiveIntSchema,
  unitPrice: nonNegativeNumberSchema,
  servings: z.number().int().min(1).optional(),
  category: z.string().optional(),
  panSize: z.enum(['half', 'full']).optional(),
  notes: z.string().max(500).optional(),
});

// Template schemas
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  items: z.array(templateItemSchema).min(1),
});

export const updateTemplateSchema = createTemplateSchema.partial().extend({
  id: uuidSchema,
});

// Analytics schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1).max(50),
  properties: z.record(z.unknown()).optional(),
  userId: uuidSchema.optional(),
  sessionId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

// Query parameter schemas for GET requests
export const getOrdersQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  teamId: uuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const getTemplatesQuerySchema = z.object({
  teamId: uuidSchema.optional(),
  featured: z.coerce.boolean().optional(),
  category: z.string().optional(),
  archived: z.coerce.boolean().optional(),
  includeArchived: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Health check schema
export const healthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string(),
  uptime: z.number(),
  checks: z.object({
    database: z.object({
      status: z.enum(['pass', 'fail']),
      latency: z.number(),
      error: z.string().optional(),
    }),
    memory: z.object({
      status: z.enum(['pass', 'fail']),
      usage: z.object({
        rss: z.number(),
        heapTotal: z.number(),
        heapUsed: z.number(),
        external: z.number(),
        arrayBuffers: z.number(),
      }),
    }),
  }),
});

// Export type definitions
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
export type GetTemplatesQuery = z.infer<typeof getTemplatesQuerySchema>;
export type PlacesAutocompleteQuery = z.infer<typeof placesAutocompleteSchema>;