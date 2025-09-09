import { z } from 'zod';
import { ErrorService } from '@/lib/error/error-service';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  error?: string;
}

// Legacy interface for backward compatibility with tests
export interface LegacyValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: Record<string, string[]>;
}

export class ValidationService {
  // Cache for validation results
  private static cache = new Map<string, any>();

  // Clear cache method for testing
  static clearCache(): void {
    this.cache.clear();
  }

  // Legacy validateData method for backward compatibility
  static validateData<T>(schema: z.ZodSchema<T>, data: unknown): LegacyValidationResult<T> {
    const cacheKey = JSON.stringify({ schema: schema._def, data });
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const result = this.validate(schema, data);
    
    // Convert to legacy format
    const legacyResult: LegacyValidationResult<T> = {
      isValid: result.success,
      data: result.data,
      errors: result.errors || {},
    };

    // Cache the result
    this.cache.set(cacheKey, legacyResult);
    
    return legacyResult;
  }
  // Generic validation method
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
    try {
      const result = schema.safeParse(data);
      
      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        const errors: Record<string, string[]> = {};
        
        result.error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!errors[path]) {
            errors[path] = [];
          }
          errors[path].push(err.message);
        });

        return {
          success: false,
          errors,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Validation failed due to an unexpected error',
      };
    }
  }

  // Async validation with database checks
  static async validateWithContext<T>(
    schema: z.ZodSchema<T>,
    data: unknown,
    context?: {
      userId?: string;
      teamId?: string;
      skipDbChecks?: boolean;
    }
  ): Promise<ValidationResult<T>> {
    // First run basic schema validation
    const basicValidation = this.validate(schema, data);
    
    if (!basicValidation.success) {
      return basicValidation;
    }

    // Skip database validation if requested or no context
    if (context?.skipDbChecks || !context) {
      return basicValidation;
    }

    try {
      // Perform additional contextual validations only if we have required context
      if (!context.userId || !context.teamId) {
        return basicValidation;
      }
      
      const contextErrors = await this.performContextualValidation(
        basicValidation.data!, 
        { userId: context.userId, teamId: context.teamId }
      );

      if (Object.keys(contextErrors).length > 0) {
        return {
          success: false,
          errors: {
            ...basicValidation.errors,
            ...contextErrors,
          },
        };
      }

      return basicValidation;
    } catch (error) {
      ErrorService.logError(error as Error, {
        component: 'ValidationService',
        action: 'validateWithContext',
        userId: context.userId,
        teamId: context.teamId,
      });

      return {
        success: false,
        error: 'Validation failed due to a system error',
      };
    }
  }

  // Business rule validations
  static async validateOrderBusinessRules(
    orderData: any,
    context: { userId: string; teamId: string }
  ): Promise<Record<string, string[]>> {
    const errors: Record<string, string[]> = {};

    try {
      // Check minimum order value
      const minOrderAmount = await this.getSystemSetting('ORDER_MINIMUM_AMOUNT');
      if (orderData.subtotal < parseFloat(minOrderAmount || '500')) {
        errors.subtotal = [`Minimum order amount is $${minOrderAmount}`];
      }

      // Check delivery date against team schedule
      if (orderData.gameId) {
        const gameExists = await this.verifyGameExists(orderData.gameId, context.teamId);
        if (!gameExists) {
          errors.gameId = ['Selected game not found or not accessible'];
        }
      }

      // Check rush order timing
      const deliveryDate = new Date(orderData.deliveryDate);
      const now = new Date();
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      const minRegularHours = await this.getSystemSetting('ORDER_MINIMUM_HOURS');
      const minRushHours = await this.getSystemSetting('ORDER_RUSH_MINIMUM_HOURS');
      
      if (hoursUntilDelivery < parseFloat(minRushHours || '24')) {
        errors.deliveryDate = ['Orders must be placed at least 24 hours in advance'];
      } else if (hoursUntilDelivery < parseFloat(minRegularHours || '72')) {
        // This is a rush order, validate rush fee is applied
        if (!orderData.isRushOrder) {
          errors.isRushOrder = ['Rush order fee required for orders placed less than 72 hours in advance'];
        }
      }

      // Validate estimated guests against roster size
      const teamRosterSize = await this.getTeamRosterSize(context.teamId);
      if (orderData.estimatedGuests > teamRosterSize * 1.5) {
        errors.estimatedGuests = [`Estimated guests seems high for team roster size of ${teamRosterSize}`];
      }

    } catch (error) {
      ErrorService.logError(error as Error, {
        component: 'ValidationService',
        action: 'validateOrderBusinessRules',
        ...context,
      });
    }

    return errors;
  }

  // Permission validation
  static async validatePermissions(
    userId: string,
    teamId: string,
    requiredPermission: string
  ): Promise<boolean> {
    try {
      // This would integrate with your RBAC service
      // For now, we'll use a simplified check
      const { RBACService } = await import('@/lib/auth/rbac');
      return await RBACService.hasPermission(userId, teamId, requiredPermission as any);
    } catch (error) {
      ErrorService.logError(error as Error, {
        component: 'ValidationService',
        action: 'validatePermissions',
        userId,
        teamId,
      });
      return false;
    }
  }

  // File validation
  static validateFile(
    file: File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): ValidationResult<File> {
    const errors: Record<string, string[]> = {};

    // Check file size
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default
    if (file.size > maxSize) {
      errors.size = [`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`];
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      errors.type = [`File type ${file.type} is not allowed`];
    }

    // Check file extension
    if (options.allowedExtensions) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !options.allowedExtensions.includes(extension)) {
        errors.extension = [`File extension .${extension} is not allowed`];
      }
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    return { success: true, data: file };
  }

  // Sanitization utilities
  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  }

  static sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[^\w\s\-_.]/g, '') // Keep only alphanumeric, spaces, hyphens, underscores, dots
      .substring(0, 100); // Limit length
  }

  // Private helper methods
  private static async performContextualValidation(
    data: any,
    context: { userId: string; teamId: string }
  ): Promise<Record<string, string[]>> {
    const errors: Record<string, string[]> = {};

    // Example contextual validations
    if (data.teamId && data.teamId !== context.teamId) {
      // Check if user has access to this team
      const hasAccess = await this.verifyTeamAccess(context.userId, data.teamId);
      if (!hasAccess) {
        errors.teamId = ['You do not have access to this team'];
      }
    }

    return errors;
  }

  private static async getSystemSetting(key: string): Promise<string | null> {
    try {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();

      if (error) throw error;
      return data?.value || null;
    } catch (error) {
      console.error(`Error fetching system setting ${key}:`, error);
      return null;
    }
  }

  private static async verifyGameExists(gameId: string, teamId: string): Promise<boolean> {
    try {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('team_schedules')
        .select('id')
        .eq('id', gameId)
        .eq('team_id', teamId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  private static async getTeamRosterSize(teamId: string): Promise<number> {
    try {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('teams')
        .select('roster_size')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data?.roster_size || 60;
    } catch (error) {
      return 60; // Default fallback
    }
  }

  private static async verifyTeamAccess(userId: string, teamId: string): Promise<boolean> {
    try {
      const { createSupabaseClient } = await import('@/lib/supabase/client');
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.team_id === teamId;
    } catch (error) {
      return false;
    }
  }
}