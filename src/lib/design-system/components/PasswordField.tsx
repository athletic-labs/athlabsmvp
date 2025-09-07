'use client';

import React, { useState, useCallback } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { TextField } from './TextField';
import { IconButton } from './IconButton';
import { Button } from './Button';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';
import { usePasswordValidation } from '@/lib/hooks/usePasswordValidation';
import { PasswordPolicy, UserInfo } from '@/lib/auth/password-policy';

interface PasswordFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  policy?: PasswordPolicy;
  userInfo?: UserInfo;
  showStrengthIndicator?: boolean;
  showGenerateButton?: boolean;
  showConfirmation?: boolean;
  confirmationLabel?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: string;
}

export function PasswordField({
  label = 'Password',
  placeholder = 'Enter your password',
  value: externalValue,
  onChange: externalOnChange,
  onValidationChange,
  policy,
  userInfo,
  showStrengthIndicator = true,
  showGenerateButton = true,
  showConfirmation = false,
  confirmationLabel = 'Confirm Password',
  disabled = false,
  required = false,
  className,
  error: externalError,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const {
    password,
    confirmPassword,
    validation,
    confirmationValidation,
    isFormValid,
    strengthInfo,
    updatePassword,
    updateConfirmPassword,
    generateSecurePassword,
  } = usePasswordValidation({
    policy,
    userInfo,
  });

  // Use external value if provided, otherwise use internal state
  const currentPassword = externalValue !== undefined ? externalValue : password;
  
  // Handle password change
  const handlePasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (externalOnChange) {
      externalOnChange(newValue);
    } else {
      updatePassword(newValue);
    }
  }, [externalOnChange, updatePassword]);

  // Handle validation change callback
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange(showConfirmation ? isFormValid : validation.isValid);
    }
  }, [onValidationChange, showConfirmation, isFormValid, validation.isValid]);

  // Generate secure password
  const handleGeneratePassword = useCallback(async () => {
    const generated = generateSecurePassword();
    if (externalOnChange) {
      externalOnChange(generated);
    }
    
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(generated);
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      logger.warn('Failed to copy password to clipboard:', error);
    }
  }, [generateSecurePassword, externalOnChange]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  // Handle confirm password change with proper event handling
  const handleConfirmPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    updateConfirmPassword(newValue);
  }, [updateConfirmPassword]);

  // Determine error message
  const errorMessage = externalError || 
    (validation.errors.length > 0 ? validation.errors[0] : '') ||
    (showConfirmation && !confirmationValidation.isValid ? confirmationValidation.error : '');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main password field */}
      <div className="relative">
        <TextField
          type={showPassword ? 'text' : 'password'}
          label={label}
          placeholder={placeholder}
          value={currentPassword}
          onChange={handlePasswordChange}
          disabled={disabled}
          required={required}
          error={!!errorMessage}
          errorMessage={errorMessage || undefined}
          trailingIcon={
            <div className="flex items-center gap-1">
              {/* Copy button (when password is generated) */}
              <AnimatePresence>
                {copiedToClipboard && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-secondary"
                  >
                    <Check className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Generate password button */}
              {showGenerateButton && !disabled && (
                <IconButton
                  onClick={handleGeneratePassword}
                  size="small"
                  variant="standard"
                  icon={<RefreshCw className="w-4 h-4" />}
                  aria-label="Generate secure password"
                />
              )}

              {/* Toggle visibility button */}
              <IconButton
                onClick={togglePasswordVisibility}
                size="small"
                variant="standard"
                icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              />
            </div>
          }
        />
      </div>

      {/* Password strength indicator */}
      <AnimatePresence>
        {showStrengthIndicator && currentPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PasswordStrengthIndicator
              validation={validation}
              strengthInfo={strengthInfo}
              showDetails={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation field */}
      {showConfirmation && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <TextField
              type={showConfirmPassword ? 'text' : 'password'}
              label={confirmationLabel}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              disabled={disabled}
              required={required}
              error={!!confirmationValidation.error}
              errorMessage={confirmationValidation.error || ''}
              trailingIcon={
                <IconButton
                  onClick={toggleConfirmPasswordVisibility}
                  size="small"
                  variant="standard"
                  icon={showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                />
              }
            />
          </motion.div>
        </AnimatePresence>
      )}

      {/* Password generation helper text */}
      {showGenerateButton && (
        <div className="text-on-surface-variant md3-body-small">
          <p>
            Tip: Click the{' '}
            <RefreshCw className="w-3 h-3 inline mx-1" />
            icon to generate a secure password that meets all requirements.
          </p>
        </div>
      )}
    </div>
  );
}

// Simplified password field for basic use cases
export function SimplePasswordField({
  label = 'Password',
  placeholder = 'Enter password',
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  className,
}: Pick<PasswordFieldProps, 'label' | 'placeholder' | 'value' | 'onChange' | 'disabled' | 'required' | 'error' | 'className'>) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <TextField
      type={showPassword ? 'text' : 'password'}
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      error={!!error}
      errorMessage={error}
      className={className}
      trailingIcon={
        <IconButton
          onClick={togglePasswordVisibility}
          size="small"
          variant="standard"
          icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        />
      }
    />
  );
}