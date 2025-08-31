import { z } from 'zod';

// User and Authentication Schemas
export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileUpdateSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number').optional(),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Team Schemas
// Create a base schema without the refine for partial updates
const teamBaseSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  leagueId: z.string().uuid('Invalid league ID'),
  rosterSize: z.number().min(10).max(200).default(60),
  proteinTarget: z.number().min(0).max(100),
  carbsTarget: z.number().min(0).max(100),
  fatsTarget: z.number().min(0).max(100),
  nutritionalPreset: z.string().optional(),
  billingEmail: z.string().email('Invalid billing email'),
  taxRate: z.number().min(0).max(1).default(0.0875),
});

export const teamCreateSchema = teamBaseSchema.refine(
  (data) => data.proteinTarget + data.carbsTarget + data.fatsTarget === 100, 
  {
    message: "Nutritional targets must sum to 100%",
    path: ["proteinTarget"],
  }
);

export const teamUpdateSchema = teamBaseSchema.partial().omit({ leagueId: true });

// Order Schemas
export const orderCreateSchema = z.object({
  contactName: z.string().min(2, 'Contact name is required'),
  contactPhone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number'),
  contactEmail: z.string().email('Invalid email address'),
  deliveryDate: z.string().refine((date) => {
    const deliveryDate = new Date(date);
    const now = new Date();
    const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDelivery >= 72; // 72 hours minimum
  }, 'Delivery date must be at least 72 hours in advance'),
  deliveryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  deliveryAddress: z.string().min(10, 'Please provide a complete delivery address'),
  deliveryInstructions: z.string().optional(),
  estimatedGuests: z.number().min(10, 'Minimum 10 guests').max(500, 'Maximum 500 guests'),
  gameId: z.string().uuid().optional(),
  items: z.array(z.object({
    type: z.enum(['template', 'individual']),
    templateId: z.string().uuid().optional(),
    menuItemId: z.string().uuid().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    panSize: z.enum(['half', 'full']).optional(),
    substitutions: z.record(z.string()).optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

export const orderUpdateSchema = z.object({
  status: z.enum(['draft', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']),
  contactName: z.string().min(2, 'Contact name is required').optional(),
  contactPhone: z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number').optional(),
  contactEmail: z.string().email('Invalid email address').optional(),
  deliveryDate: z.string().optional(),
  deliveryTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  deliveryAddress: z.string().min(10, 'Please provide a complete delivery address').optional(),
  deliveryInstructions: z.string().optional(),
  estimatedGuests: z.number().min(10).max(500).optional(),
  internalNotes: z.string().optional(),
});

// Menu Schemas
export const menuTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  description: z.string().optional(),
  cuisineType: z.string().min(2, 'Cuisine type is required'),
  bundlePrice: z.number().min(0, 'Price must be positive'),
  servesCount: z.number().min(1, 'Must serve at least 1 person').default(60),
  imageUrl: z.string().url('Invalid image URL').optional(),
  minOrderHours: z.number().min(24).default(72),
  featured: z.boolean().default(false),
});

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Item name is required'),
  description: z.string().optional(),
  category: z.enum(['Protein', 'Starch', 'Vegetables', 'Breakfast', 'Also Available', 'Add-Ons / Alternatives']),
  pricePerPerson: z.number().min(0).optional(),
  priceHalfPan: z.number().min(0).optional(),
  priceFullPan: z.number().min(0).optional(),
  servingsHalfPan: z.number().min(1).default(12),
  servingsFullPan: z.number().min(1).default(24),
  panNotation: z.string().optional(),
  isAddOn: z.boolean().default(false),
  dietaryFlags: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
});

// Schedule Schemas
export const scheduleCreateSchema = z.object({
  opponentName: z.string().min(2, 'Opponent name is required'),
  gameDate: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, 'Invalid date format'),
  gameTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  isHomeGame: z.boolean().default(true),
  location: z.string().min(5, 'Location is required'),
  notes: z.string().optional(),
});

// Saved Template Schemas
export const savedTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  description: z.string().optional(),
  items: z.array(z.object({
    templateId: z.string().uuid().optional(),
    menuItemId: z.string().uuid().optional(),
    quantity: z.number().min(1),
    panSize: z.enum(['half', 'full']).optional(),
    substitutions: z.record(z.string()).optional(),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

// Permission Schemas
export const permissionUpdateSchema = z.object({
  canCreateOrders: z.boolean().default(true),
  canViewAllOrders: z.boolean().default(false),
  canEditOrders: z.boolean().default(false),
  canDeleteOrders: z.boolean().default(false),
  canManageTeam: z.boolean().default(false),
  canViewAnalytics: z.boolean().default(false),
});

// System Settings Schemas
export const systemSettingSchema = z.object({
  key: z.string().min(1, 'Setting key is required'),
  value: z.string().min(1, 'Setting value is required'),
  description: z.string().optional(),
});

// Search and Filter Schemas
export const orderSearchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['draft', 'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  teamId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const analyticsDateRangeSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date'),
  teamId: z.string().uuid().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

// Common validation utilities
export const uuidSchema = z.string().uuid('Invalid ID format');
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, 'Invalid phone number');

// Type exports for TypeScript
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
export type TeamCreateData = z.infer<typeof teamCreateSchema>;
export type TeamUpdateData = z.infer<typeof teamUpdateSchema>;
export type OrderCreateData = z.infer<typeof orderCreateSchema>;
export type OrderUpdateData = z.infer<typeof orderUpdateSchema>;
export type MenuTemplateData = z.infer<typeof menuTemplateSchema>;
export type MenuItemData = z.infer<typeof menuItemSchema>;
export type ScheduleCreateData = z.infer<typeof scheduleCreateSchema>;
export type SavedTemplateData = z.infer<typeof savedTemplateSchema>;
export type PermissionUpdateData = z.infer<typeof permissionUpdateSchema>;
export type SystemSettingData = z.infer<typeof systemSettingSchema>;
export type OrderSearchData = z.infer<typeof orderSearchSchema>;
export type AnalyticsDateRangeData = z.infer<typeof analyticsDateRangeSchema>;