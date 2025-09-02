import { describe, it, expect, beforeEach } from '@jest/globals';
import { ValidationService } from '../validation-service';
import { signInSchema, teamCreateSchema, orderCreateSchema } from '../schemas';

describe('ValidationService', () => {
  beforeEach(() => {
    ValidationService.clearCache();
  });

  describe('validateData', () => {
    it('should validate correct sign-in data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const result = ValidationService.validateData(signInSchema, data);
      
      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.errors).toEqual({});
    });

    it('should reject invalid email format', () => {
      const data = {
        email: 'invalid-email',
        password: 'Password123'
      };

      const result = ValidationService.validateData(signInSchema, data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toContain('Invalid email address');
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: '123'
      };

      const result = ValidationService.validateData(signInSchema, data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.password).toContain('Password must be at least 8 characters');
    });
  });

  describe('Team validation', () => {
    it('should validate team with correct nutritional targets', () => {
      const data = {
        name: 'Test Team',
        city: 'Test City',
        leagueId: '123e4567-e89b-12d3-a456-426614174000',
        rosterSize: 25,
        proteinTarget: 30,
        carbsTarget: 50,
        fatsTarget: 20,
        billingEmail: 'billing@test.com',
        taxRate: 0.0875
      };

      const result = ValidationService.validateData(teamCreateSchema, data);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject nutritional targets that do not sum to 100', () => {
      const data = {
        name: 'Test Team',
        city: 'Test City',
        leagueId: '123e4567-e89b-12d3-a456-426614174000',
        rosterSize: 25,
        proteinTarget: 30,
        carbsTarget: 50,
        fatsTarget: 30, // Sum = 110, should fail
        billingEmail: 'billing@test.com',
        taxRate: 0.0875
      };

      const result = ValidationService.validateData(teamCreateSchema, data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.proteinTarget).toContain('Nutritional targets must sum to 100%');
    });
  });

  describe('Order validation', () => {
    it('should validate order with future delivery date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 4); // 4 days ahead

      const data = {
        contactName: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@example.com',
        deliveryDate: futureDate.toISOString().split('T')[0],
        deliveryTime: '12:00',
        deliveryAddress: '123 Main St, City, State 12345',
        estimatedGuests: 50,
        items: [{
          type: 'template' as const,
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1
        }]
      };

      const result = ValidationService.validateData(orderCreateSchema, data);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject order with delivery date less than 72 hours', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const data = {
        contactName: 'John Doe',
        contactPhone: '+1234567890',
        contactEmail: 'john@example.com',
        deliveryDate: tomorrow.toISOString().split('T')[0],
        deliveryTime: '12:00',
        deliveryAddress: '123 Main St, City, State 12345',
        estimatedGuests: 50,
        items: [{
          type: 'template' as const,
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          quantity: 1
        }]
      };

      const result = ValidationService.validateData(orderCreateSchema, data);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.deliveryDate).toContain('Delivery date must be at least 72 hours in advance');
    });
  });

  describe('caching', () => {
    it('should cache validation results', () => {
      const data = { email: 'test@example.com', password: 'Password123' };
      
      const result1 = ValidationService.validateData(signInSchema, data);
      const result2 = ValidationService.validateData(signInSchema, data);
      
      expect(result1).toEqual(result2);
    });

    it('should clear cache when requested', () => {
      const data = { email: 'test@example.com', password: 'Password123' };
      
      ValidationService.validateData(signInSchema, data);
      ValidationService.clearCache();
      
      expect(ValidationService['cache'].size).toBe(0);
    });
  });
});