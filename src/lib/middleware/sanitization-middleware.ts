/**
 * Input sanitization middleware for API routes
 * Automatically sanitizes request data to prevent XSS and injection attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { inputSanitizer, SanitizationType, SanitizationOptions } from '@/lib/security/input-sanitizer';

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse;

interface SanitizationConfig {
  body?: Record<string, { type: SanitizationType; options?: SanitizationOptions }>;
  query?: Record<string, { type: SanitizationType; options?: SanitizationOptions }>;
  headers?: string[]; // Headers to sanitize as text
  logThreats?: boolean;
  blockThreats?: boolean;
  maxThreatSeverity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SanitizationLog {
  timestamp: string;
  path: string;
  method: string;
  clientIp: string;
  threats: Array<{
    field: string;
    originalValue: string;
    threats: string[];
    severity: string;
  }>;
  sanitizedFields: Array<{
    field: string;
    wasModified: boolean;
    removedElements: string[];
  }>;
}

/**
 * Higher-order function to add input sanitization to API routes
 */
export function withInputSanitization(
  handler: ApiHandler,
  config: SanitizationConfig = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  const {
    body = {},
    query = {},
    headers = [],
    logThreats = true,
    blockThreats = true,
    maxThreatSeverity = 'medium'
  } = config;

  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      const sanitizationLog: SanitizationLog = {
        timestamp: new Date().toISOString(),
        path: request.nextUrl.pathname,
        method: request.method,
        clientIp: getClientIP(request),
        threats: [],
        sanitizedFields: [],
      };

      let shouldBlock = false;
      const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
      const maxSeverityLevel = severityOrder[maxThreatSeverity];

      // Sanitize request body
      let sanitizedBody = null;
      if (Object.keys(body).length > 0 && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const originalBody = await request.json();
          sanitizedBody = { ...originalBody };

          for (const [field, { type, options }] of Object.entries(body)) {
            if (originalBody[field] !== undefined) {
              const value = String(originalBody[field]);
              
              // Check for threats first
              const threatCheck = inputSanitizer.detectThreats(value);
              if (!threatCheck.isClean) {
                sanitizationLog.threats.push({
                  field,
                  originalValue: value.substring(0, 100), // Limit for logging
                  threats: threatCheck.threats,
                  severity: threatCheck.severity,
                });

                if (severityOrder[threatCheck.severity] >= maxSeverityLevel) {
                  shouldBlock = true;
                }
              }

              // Sanitize the value
              const result = inputSanitizer.sanitize(value, type, options);
              sanitizedBody[field] = result.sanitized;

              if (result.wasModified) {
                sanitizationLog.sanitizedFields.push({
                  field,
                  wasModified: true,
                  removedElements: result.removedElements,
                });
              }
            }
          }
        } catch (error) {
          console.error('[Sanitization] Failed to parse request body:', error);
        }
      }

      // Sanitize query parameters
      const sanitizedQuery = new URLSearchParams();
      const searchParams = request.nextUrl.searchParams;
      
      const entries = Array.from(searchParams.entries());
      for (const [key, value] of entries) {
        let sanitizedValue = value;
        
        if (query[key]) {
          const { type, options } = query[key];
          
          // Check for threats
          const threatCheck = inputSanitizer.detectThreats(value);
          if (!threatCheck.isClean) {
            sanitizationLog.threats.push({
              field: `query.${key}`,
              originalValue: value.substring(0, 100),
              threats: threatCheck.threats,
              severity: threatCheck.severity,
            });

            if (severityOrder[threatCheck.severity] >= maxSeverityLevel) {
              shouldBlock = true;
            }
          }

          // Sanitize
          const result = inputSanitizer.sanitize(value, type, options);
          sanitizedValue = result.sanitized;

          if (result.wasModified) {
            sanitizationLog.sanitizedFields.push({
              field: `query.${key}`,
              wasModified: true,
              removedElements: result.removedElements,
            });
          }
        } else {
          // Default sanitization for unspecified query params
          const result = inputSanitizer.sanitize(value, 'text', { maxLength: 1000 });
          sanitizedValue = result.sanitized;
        }

        sanitizedQuery.append(key, sanitizedValue);
      }

      // Sanitize specified headers
      const sanitizedHeaders = new Headers(request.headers);
      for (const headerName of headers) {
        const headerValue = request.headers.get(headerName);
        if (headerValue) {
          const result = inputSanitizer.sanitize(headerValue, 'text', { maxLength: 500 });
          if (result.wasModified) {
            sanitizedHeaders.set(headerName, result.sanitized);
            sanitizationLog.sanitizedFields.push({
              field: `header.${headerName}`,
              wasModified: true,
              removedElements: result.removedElements,
            });
          }
        }
      }

      // Log threats and sanitization activity
      if (logThreats && (sanitizationLog.threats.length > 0 || sanitizationLog.sanitizedFields.length > 0)) {
        console.warn('[Security] Input sanitization activity:', {
          ...sanitizationLog,
          userAgent: request.headers.get('user-agent'),
        });
      }

      // Block request if serious threats detected
      if (blockThreats && shouldBlock) {
        console.error('[Security] Blocking request due to threat detection:', sanitizationLog);
        
        return new NextResponse(
          JSON.stringify({
            error: 'Request blocked due to security concerns',
            code: 'THREAT_DETECTED',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'X-Security-Block': 'threat-detected',
            },
          }
        );
      }

      // Create sanitized request
      const sanitizedRequest = new NextRequest(
        new URL(request.nextUrl.pathname + '?' + sanitizedQuery.toString(), request.url),
        {
          method: request.method,
          headers: sanitizedHeaders,
          body: sanitizedBody ? JSON.stringify(sanitizedBody) : request.body,
        }
      );

      // Add sanitization info to request context
      (sanitizedRequest as any).sanitizationLog = sanitizationLog;

      return await handler(sanitizedRequest, context);

    } catch (error) {
      console.error('[Sanitization] Middleware error:', error);
      return await handler(request, context); // Fall back to original request
    }
  };
}

/**
 * Preset sanitization configurations for common API patterns
 */
export const sanitizationPresets = {
  // User profile data
  userProfile: {
    body: {
      firstName: { type: 'name' as const },
      lastName: { type: 'name' as const },
      email: { type: 'email' as const },
      phone: { type: 'phone' as const },
      bio: { type: 'text' as const, options: { maxLength: 500, normalizeWhitespace: true } },
    },
    logThreats: true,
    blockThreats: true,
  },

  // Order creation
  orderCreation: {
    body: {
      contactName: { type: 'name' as const },
      contactEmail: { type: 'email' as const },
      contactPhone: { type: 'phone' as const },
      deliveryAddress: { type: 'address' as const, options: { maxLength: 200 } },
      notes: { type: 'text' as const, options: { maxLength: 1000, normalizeWhitespace: true } },
      deliveryInstructions: { type: 'text' as const, options: { maxLength: 500 } },
    },
    query: {
      teamId: { type: 'sql' as const },
    },
    logThreats: true,
    blockThreats: true,
  },

  // Template management
  templateManagement: {
    body: {
      name: { type: 'text' as const, options: { maxLength: 100, normalizeWhitespace: true } },
      description: { type: 'text' as const, options: { maxLength: 500, normalizeWhitespace: true } },
      items: { type: 'json' as const },
    },
    query: {
      search: { type: 'text' as const, options: { maxLength: 100 } },
      page: { type: 'text' as const, options: { maxLength: 10 } },
      limit: { type: 'text' as const, options: { maxLength: 10 } },
    },
    logThreats: true,
    blockThreats: true,
  },

  // File upload
  fileUpload: {
    body: {
      filename: { type: 'filename' as const },
      description: { type: 'text' as const, options: { maxLength: 200 } },
    },
    headers: ['content-disposition', 'x-filename'] as string[],
    logThreats: true,
    blockThreats: true,
    maxThreatSeverity: 'high' as const,
  },

  // Admin operations (strictest)
  adminOperations: {
    body: {
      action: { type: 'text' as const, options: { maxLength: 50 } },
      reason: { type: 'text' as const, options: { maxLength: 500 } },
      targetId: { type: 'sql' as const },
    },
    logThreats: true,
    blockThreats: true,
    maxThreatSeverity: 'low' as const, // Block even low-level threats for admin
  },

  // Search operations
  search: {
    query: {
      q: { type: 'text' as const, options: { maxLength: 200, normalizeWhitespace: true } },
      filter: { type: 'text' as const, options: { maxLength: 100 } },
      sort: { type: 'sql' as const },
      page: { type: 'text' as const, options: { maxLength: 10 } },
      limit: { type: 'text' as const, options: { maxLength: 10 } },
    },
    logThreats: false, // Search queries are frequent, don't log unless threats
    blockThreats: true,
  },
} as const;

/**
 * Utility functions
 */
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP) {
    return xRealIP.trim();
  }
  
  return 'unknown';
}

/**
 * Preset wrapper functions for common use cases
 */
export const withUserProfileSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.userProfile);

export const withOrderSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.orderCreation);

export const withTemplateSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.templateManagement);

export const withFileUploadSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.fileUpload);

export const withAdminSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.adminOperations);

export const withSearchSanitization = (handler: ApiHandler) =>
  withInputSanitization(handler, sanitizationPresets.search);