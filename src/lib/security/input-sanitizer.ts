/**
 * Comprehensive input sanitization for Athletic Labs SaaS
 * Protects against XSS, injection attacks, and data corruption
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { z } from 'zod';

// Dangerous patterns that should be blocked
const DANGEROUS_PATTERNS = {
  // Script injection patterns
  script: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  scriptSrc: /<script[^>]*src\s*=\s*["\'][^"\']*["\'][^>]*>/gi,
  
  // Event handler patterns  
  eventHandlers: /\s*on\w+\s*=\s*["\'][^"\']*["\'][^>]*/gi,
  
  // JavaScript execution patterns
  javascript: /javascript\s*:/gi,
  vbscript: /vbscript\s*:/gi,
  
  // Data URL patterns (can be used for XSS)
  dataUrl: /data\s*:\s*text\/html/gi,
  
  // SQL injection patterns
  sqlInjection: /((\%27)|(\')|(\'\')|(%3D)|(=))[^\n]*((\%27)|(\')|(\'\')|(%3D)|(=))/gi,
  sqlKeywords: /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b/gi,
  
  // Path traversal
  pathTraversal: /\.\.[\/\\]/gi,
  
  // LDAP injection
  ldapInjection: /[()&|!<=>=*]/gi,
  
  // Command injection
  commandInjection: /[;&|`$(){}[\]]/gi,
};

export interface SanitizationOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  maxLength?: number;
  stripWhitespace?: boolean;
  normalizeWhitespace?: boolean;
  preventInjection?: boolean;
  preventPathTraversal?: boolean;
  allowUnicode?: boolean;
}

export interface SanitizationResult {
  sanitized: string;
  wasModified: boolean;
  removedElements: string[];
  warnings: string[];
  isValid: boolean;
}

export type SanitizationType = 
  | 'text'
  | 'html' 
  | 'email'
  | 'url'
  | 'phone'
  | 'name'
  | 'address'
  | 'json'
  | 'sql'
  | 'filename';

/**
 * Advanced input sanitizer class
 */
export class InputSanitizer {
  private static instance: InputSanitizer;

  private constructor() {}

  static getInstance(): InputSanitizer {
    if (!InputSanitizer.instance) {
      InputSanitizer.instance = new InputSanitizer();
    }
    return InputSanitizer.instance;
  }

  /**
   * Main sanitization method
   */
  sanitize(
    input: string,
    type: SanitizationType = 'text',
    options: SanitizationOptions = {}
  ): SanitizationResult {
    if (!input || typeof input !== 'string') {
      return {
        sanitized: '',
        wasModified: false,
        removedElements: [],
        warnings: [],
        isValid: true,
      };
    }

    const original = input;
    const sanitized = input;
    const removedElements: string[] = [];
    const warnings: string[] = [];

    // Apply type-specific sanitization
    switch (type) {
      case 'html':
        return this.sanitizeHtml(sanitized, options);
      case 'email':
        return this.sanitizeEmail(sanitized, options);
      case 'url':
        return this.sanitizeUrl(sanitized, options);
      case 'phone':
        return this.sanitizePhone(sanitized, options);
      case 'name':
        return this.sanitizeName(sanitized, options);
      case 'address':
        return this.sanitizeAddress(sanitized, options);
      case 'json':
        return this.sanitizeJson(sanitized, options);
      case 'sql':
        return this.sanitizeSql(sanitized, options);
      case 'filename':
        return this.sanitizeFilename(sanitized, options);
      default:
        return this.sanitizeText(sanitized, options);
    }
  }

  /**
   * Sanitize plain text
   */
  private sanitizeText(input: string, options: SanitizationOptions): SanitizationResult {
    let sanitized = input;
    const removedElements: string[] = [];
    const warnings: string[] = [];

    // Remove null bytes
    if (sanitized.includes('\0')) {
      sanitized = sanitized.replace(/\0/g, '');
      removedElements.push('null bytes');
    }

    // Check for dangerous patterns
    if (options.preventInjection !== false) {
      const originalLength = sanitized.length;
      
      // Remove script tags
      if (DANGEROUS_PATTERNS.script.test(sanitized)) {
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.script, '');
        removedElements.push('script tags');
      }

      // Remove event handlers
      if (DANGEROUS_PATTERNS.eventHandlers.test(sanitized)) {
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.eventHandlers, '');
        removedElements.push('event handlers');
      }

      // Remove javascript: and vbscript: protocols
      sanitized = sanitized.replace(DANGEROUS_PATTERNS.javascript, 'removed:');
      sanitized = sanitized.replace(DANGEROUS_PATTERNS.vbscript, 'removed:');

      if (sanitized.length !== originalLength) {
        warnings.push('Potentially dangerous content detected and removed');
      }
    }

    // Path traversal protection
    if (options.preventPathTraversal !== false) {
      if (DANGEROUS_PATTERNS.pathTraversal.test(sanitized)) {
        sanitized = sanitized.replace(DANGEROUS_PATTERNS.pathTraversal, '');
        removedElements.push('path traversal sequences');
        warnings.push('Path traversal attempt detected');
      }
    }

    // Length restrictions
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
      removedElements.push(`content beyond ${options.maxLength} characters`);
    }

    // Whitespace handling
    if (options.stripWhitespace) {
      sanitized = sanitized.trim();
    }

    if (options.normalizeWhitespace) {
      sanitized = sanitized.replace(/\s+/g, ' ').trim();
    }

    // Unicode validation
    if (!options.allowUnicode) {
      // Remove non-ASCII characters
      const beforeUnicode = sanitized.length;
      sanitized = sanitized.replace(/[^\x00-\x7F]/g, '');
      if (sanitized.length !== beforeUnicode) {
        removedElements.push('unicode characters');
      }
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements,
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHtml(input: string, options: SanitizationOptions): SanitizationResult {
    const removedElements: string[] = [];
    const warnings: string[] = [];

    // Configure DOMPurify
    const config: any = {
      ALLOWED_TAGS: options.allowedTags || [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
        'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
      ],
      ALLOWED_ATTR: options.allowedAttributes || {
        'a': ['href', 'title'],
        '*': ['class']
      },
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style', 'meta'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
      USE_PROFILES: { html: true },
    };

    // Track what gets removed
    DOMPurify.addHook('uponSanitizeElement', (node, data) => {
      if (data.allowedTags && !data.allowedTags[data.tagName]) {
        removedElements.push(`<${data.tagName}> tag`);
      }
    });

    DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
      if (!data.allowedAttributes[data.attrName]) {
        removedElements.push(`${data.attrName} attribute`);
      }
    });

    const sanitized = String(DOMPurify.sanitize(input, config));

    // Clean up hooks
    DOMPurify.removeAllHooks();

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements,
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize email addresses
   */
  private sanitizeEmail(input: string, options: SanitizationOptions): SanitizationResult {
    let sanitized = input.toLowerCase().trim();
    const warnings: string[] = [];

    // Basic email validation and sanitization
    if (!validator.isEmail(sanitized)) {
      warnings.push('Invalid email format');
      return {
        sanitized: '',
        wasModified: true,
        removedElements: ['invalid email format'],
        warnings,
        isValid: false,
      };
    }

    // Normalize email (remove dots in Gmail, etc.)
    sanitized = validator.normalizeEmail(sanitized) || sanitized;

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: [],
      warnings,
      isValid: true,
    };
  }

  /**
   * Sanitize URLs
   */
  private sanitizeUrl(input: string, options: SanitizationOptions): SanitizationResult {
    const sanitized = input.trim();
    const warnings: string[] = [];
    const removedElements: string[] = [];

    // Check for dangerous protocols
    const dangerousProtocols = ['javascript' + ':', 'vbscript:', 'data:', 'file:'];
    const lowerInput = sanitized.toLowerCase();
    
    for (const protocol of dangerousProtocols) {
      if (lowerInput.startsWith(protocol)) {
        warnings.push(`Dangerous protocol detected: ${protocol}`);
        return {
          sanitized: '',
          wasModified: true,
          removedElements: [`dangerous protocol: ${protocol}`],
          warnings,
          isValid: false,
        };
      }
    }

    // Validate URL format
    if (!validator.isURL(sanitized, { 
      protocols: ['http', 'https'],
      require_protocol: true,
    })) {
      warnings.push('Invalid URL format');
      return {
        sanitized: '',
        wasModified: true,
        removedElements: ['invalid URL format'],
        warnings,
        isValid: false,
      };
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements,
      warnings,
      isValid: true,
    };
  }

  /**
   * Sanitize phone numbers
   */
  private sanitizePhone(input: string, options: SanitizationOptions): SanitizationResult {
    // Remove all non-digit characters except +
    let sanitized = input.replace(/[^\d+\-\(\)\s]/g, '');
    
    // Normalize spacing
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    const warnings: string[] = [];
    
    // Basic phone validation
    const digitsOnly = sanitized.replace(/[^\d]/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      warnings.push('Phone number should be between 10-15 digits');
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: input !== sanitized ? ['non-phone characters'] : [],
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize person names
   */
  private sanitizeName(input: string, options: SanitizationOptions): SanitizationResult {
    // Allow letters, spaces, hyphens, apostrophes, and periods
    let sanitized = input.replace(/[^a-zA-Z\s\-'\.]/g, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    
    // Capitalize first letter of each word
    sanitized = sanitized.replace(/\b\w/g, char => char.toUpperCase());

    const warnings: string[] = [];
    
    if (sanitized.length < 1) {
      warnings.push('Name cannot be empty');
    }
    
    if (sanitized.length > 100) {
      sanitized = sanitized.substring(0, 100);
      warnings.push('Name truncated to 100 characters');
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: input !== sanitized ? ['invalid name characters'] : [],
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize addresses
   */
  private sanitizeAddress(input: string, options: SanitizationOptions): SanitizationResult {
    // Allow letters, numbers, spaces, and common address characters
    let sanitized = input.replace(/[^a-zA-Z0-9\s\-#.,'/]/g, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim();

    const warnings: string[] = [];
    
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
      warnings.push(`Address truncated to ${options.maxLength} characters`);
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: input !== sanitized ? ['invalid address characters'] : [],
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize JSON strings
   */
  private sanitizeJson(input: string, options: SanitizationOptions): SanitizationResult {
    const warnings: string[] = [];
    let sanitized = input;

    try {
      // Parse and re-stringify to validate and normalize JSON
      const parsed = JSON.parse(sanitized);
      sanitized = JSON.stringify(parsed);
      
      return {
        sanitized,
        wasModified: input !== sanitized,
        removedElements: [],
        warnings,
        isValid: true,
      };
    } catch (error) {
      warnings.push('Invalid JSON format');
      return {
        sanitized: '{}',
        wasModified: true,
        removedElements: ['invalid JSON'],
        warnings,
        isValid: false,
      };
    }
  }

  /**
   * Sanitize SQL identifiers (for dynamic queries - use with extreme caution)
   */
  private sanitizeSql(input: string, options: SanitizationOptions): SanitizationResult {
    const warnings: string[] = [];
    const removedElements: string[] = [];
    
    // Only allow alphanumeric characters and underscores for SQL identifiers
    let sanitized = input.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Check for SQL keywords
    if (DANGEROUS_PATTERNS.sqlKeywords.test(sanitized)) {
      warnings.push('SQL keywords detected - potential injection attempt');
    }

    // Must start with letter or underscore
    if (!/^[a-zA-Z_]/.test(sanitized)) {
      warnings.push('Invalid SQL identifier - must start with letter or underscore');
      sanitized = '_' + sanitized;
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: input !== sanitized ? ['invalid SQL characters'] : [],
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Sanitize filenames
   */
  private sanitizeFilename(input: string, options: SanitizationOptions): SanitizationResult {
    const warnings: string[] = [];
    const removedElements: string[] = [];
    
    // Remove path traversal and dangerous characters
    let sanitized = input.replace(/[<>:"/\\|?*\x00-\x1f]/g, '');
    
    // Remove leading/trailing dots and spaces
    sanitized = sanitized.replace(/^[\.\s]+|[\.\s]+$/g, '');
    
    // Prevent reserved Windows filenames
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(sanitized)) {
      sanitized = '_' + sanitized;
      warnings.push('Reserved filename detected and modified');
    }

    // Length limit
    if (sanitized.length > 255) {
      const extension = sanitized.match(/\.[^.]*$/) || [''];
      const maxBase = 255 - extension[0].length;
      sanitized = sanitized.substring(0, maxBase) + extension[0];
      warnings.push('Filename truncated to 255 characters');
    }

    return {
      sanitized,
      wasModified: input !== sanitized,
      removedElements: input !== sanitized ? ['invalid filename characters'] : [],
      warnings,
      isValid: warnings.length === 0,
    };
  }

  /**
   * Batch sanitize multiple inputs
   */
  sanitizeBatch(
    inputs: Record<string, { value: string; type: SanitizationType; options?: SanitizationOptions }>
  ): Record<string, SanitizationResult> {
    const results: Record<string, SanitizationResult> = {};
    
    for (const [key, { value, type, options }] of Object.entries(inputs)) {
      results[key] = this.sanitize(value, type, options);
    }
    
    return results;
  }

  /**
   * Check if input contains suspicious patterns
   */
  detectThreats(input: string): {
    threats: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    isClean: boolean;
  } {
    const threats: string[] = [];
    let maxSeverity = 0; // 0=clean, 1=low, 2=medium, 3=high, 4=critical

    // Check for various threats
    if (DANGEROUS_PATTERNS.script.test(input)) {
      threats.push('Script injection attempt');
      maxSeverity = Math.max(maxSeverity, 4);
    }

    if (DANGEROUS_PATTERNS.sqlInjection.test(input)) {
      threats.push('SQL injection pattern');
      maxSeverity = Math.max(maxSeverity, 4);
    }

    if (DANGEROUS_PATTERNS.pathTraversal.test(input)) {
      threats.push('Path traversal attempt');
      maxSeverity = Math.max(maxSeverity, 3);
    }

    if (DANGEROUS_PATTERNS.commandInjection.test(input)) {
      threats.push('Command injection attempt');
      maxSeverity = Math.max(maxSeverity, 4);
    }

    if (DANGEROUS_PATTERNS.eventHandlers.test(input)) {
      threats.push('XSS event handler');
      maxSeverity = Math.max(maxSeverity, 3);
    }

    const severityMap: Array<'low' | 'medium' | 'high' | 'critical'> = 
      ['low', 'low', 'medium', 'high', 'critical'];

    return {
      threats,
      severity: severityMap[maxSeverity] || 'low',
      isClean: threats.length === 0,
    };
  }
}

// Export singleton instance
export const inputSanitizer = InputSanitizer.getInstance();