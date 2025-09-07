'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  PasswordStrengthCalculator, 
  PasswordValidationResult,
  PasswordPolicy,
  DEFAULT_POLICY,
  UserInfo
} from '@/lib/auth/password-policy';

interface UsePasswordValidationOptions {
  policy?: PasswordPolicy;
  userInfo?: UserInfo;
  debounceMs?: number;
}

export function usePasswordValidation(options: UsePasswordValidationOptions = {}) {
  const {
    policy = DEFAULT_POLICY,
    userInfo,
    debounceMs = 300
  } = options;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation
  const validation = useMemo(() => {
    if (!password) {
      return {
        isValid: false,
        score: 0,
        errors: [],
        warnings: [],
        suggestions: [],
      };
    }

    return PasswordStrengthCalculator.validate(password, policy, userInfo);
  }, [password, policy, userInfo]);

  // Password confirmation validation
  const confirmationValidation = useMemo(() => {
    if (!confirmPassword) {
      return { isValid: true, error: null };
    }

    const isValid = password === confirmPassword;
    return {
      isValid,
      error: isValid ? null : 'Passwords do not match',
    };
  }, [password, confirmPassword]);

  // Overall validation status
  const isFormValid = useMemo(() => {
    return validation.isValid && confirmationValidation.isValid && password.length > 0;
  }, [validation.isValid, confirmationValidation.isValid, password]);

  // Strength description
  const strengthInfo = useMemo(() => {
    return PasswordStrengthCalculator.getStrengthDescription(validation.score);
  }, [validation.score]);

  // Update password with validation
  const updatePassword = useCallback((newPassword: string) => {
    setPassword(newPassword);
    setIsValidating(true);
    
    // Reset validating state after debounce
    const timer = setTimeout(() => {
      setIsValidating(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [debounceMs]);

  // Update confirmation password
  const updateConfirmPassword = useCallback((newConfirmPassword: string) => {
    setConfirmPassword(newConfirmPassword);
  }, []);

  // Generate secure password
  const generateSecurePassword = useCallback(() => {
    const generatedPassword = PasswordStrengthCalculator.generateSecurePassword();
    setPassword(generatedPassword);
    setConfirmPassword(generatedPassword);
    return generatedPassword;
  }, []);

  // Reset all fields
  const reset = useCallback(() => {
    setPassword('');
    setConfirmPassword('');
    setIsValidating(false);
  }, []);

  return {
    // Password values
    password,
    confirmPassword,
    
    // Validation results
    validation,
    confirmationValidation,
    isFormValid,
    isValidating,
    
    // Strength info
    strengthInfo,
    
    // Actions
    updatePassword,
    updateConfirmPassword,
    generateSecurePassword,
    reset,
    
    // Policy reference
    policy,
  };
}