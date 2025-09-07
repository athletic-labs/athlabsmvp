'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, Info } from 'lucide-react';
import { PasswordValidationResult } from '@/lib/auth/password-policy';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  strengthInfo: {
    level: string;
    description: string;
    color: string;
  };
  showDetails?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  validation,
  strengthInfo,
  showDetails = true,
  className,
}: PasswordStrengthIndicatorProps) {
  // Strength bar segments (5 segments)
  const segments = 5;
  const activeSegments = Math.ceil((validation.score / 100) * segments);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Score Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="md3-body-small text-on-surface-variant">
            Password Strength
          </span>
          <span 
            className="md3-label-small font-medium"
            style={{ color: strengthInfo.color }}
          >
            {strengthInfo.description}
          </span>
        </div>
        
        <div className="flex gap-1">
          {Array.from({ length: segments }, (_, index) => (
            <motion.div
              key={index}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                index < activeSegments
                  ? 'opacity-100'
                  : 'opacity-20 bg-surface-variant'
              )}
              style={{
                backgroundColor: index < activeSegments ? strengthInfo.color : undefined,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.1,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>

        {/* Score percentage */}
        <div className="flex justify-end">
          <span className="md3-body-small text-on-surface-variant">
            {validation.score}/100
          </span>
        </div>
      </div>

      {/* Detailed feedback */}
      {showDetails && (validation.errors.length > 0 || validation.warnings.length > 0 || validation.suggestions.length > 0) && (
        <div className="space-y-3">
          {/* Errors */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-error" />
                <span className="md3-body-small font-medium text-error">
                  Requirements
                </span>
              </div>
              <ul className="space-y-1 ml-6">
                {validation.errors.map((error, index) => (
                  <motion.li
                    key={index}
                    className="md3-body-small text-on-surface-variant"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {error}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-primary" />
                <span className="md3-body-small font-medium text-primary">
                  Warnings
                </span>
              </div>
              <ul className="space-y-1 ml-6">
                {validation.warnings.map((warning, index) => (
                  <motion.li
                    key={index}
                    className="md3-body-small text-on-surface-variant"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {warning}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {validation.suggestions.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-tertiary" />
                <span className="md3-body-small font-medium text-tertiary">
                  Suggestions
                </span>
              </div>
              <ul className="space-y-1 ml-6">
                {validation.suggestions.map((suggestion, index) => (
                  <motion.li
                    key={index}
                    className="md3-body-small text-on-surface-variant"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {suggestion}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* Success state */}
          {validation.isValid && (
            <motion.div
              className="flex items-center gap-2 p-3 rounded-lg bg-secondary-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Check className="w-4 h-4 text-secondary" />
              <span className="md3-body-small font-medium text-on-secondary-container">
                Password meets all security requirements
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function PasswordStrengthBadge({
  validation,
  strengthInfo,
  className,
}: Omit<PasswordStrengthIndicatorProps, 'showDetails'>) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Strength indicator circle */}
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
          {/* Background circle */}
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-surface-variant opacity-20"
          />
          {/* Progress circle */}
          <motion.circle
            cx="12"
            cy="12"
            r="10"
            stroke={strengthInfo.color}
            strokeWidth="2"
            fill="none"
            strokeDasharray="62.83" // 2 * π * 10
            initial={{ strokeDashoffset: 62.83 }}
            animate={{ 
              strokeDashoffset: 62.83 - (validation.score / 100) * 62.83 
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        
        {/* Score in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-xs font-medium"
            style={{ color: strengthInfo.color }}
          >
            {validation.score}
          </span>
        </div>
      </div>

      {/* Strength description */}
      <span 
        className="md3-body-small font-medium"
        style={{ color: strengthInfo.color }}
      >
        {strengthInfo.description}
      </span>
    </div>
  );
}