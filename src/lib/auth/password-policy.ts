/**
 * Enterprise-grade password policy implementation
 * Based on NIST SP 800-63B guidelines and industry best practices
 */

export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxRepeatingChars: number;
  preventCommonPasswords: boolean;
  preventUserInfoInPassword: boolean;
  historyCheck: number; // Number of previous passwords to check against
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100 strength score
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface UserInfo {
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  companyName?: string;
}

// Default enterprise policy
export const DEFAULT_POLICY: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxRepeatingChars: 2,
  preventCommonPasswords: true,
  preventUserInfoInPassword: true,
  historyCheck: 5,
};

// Common passwords list (top 100 most common passwords)
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'guest', 'qwerty', '12345678', '111111', '12345',
  'col123456', '123123', '1234567', '1234', '1234567890', '000000', '555555', '666666',
  '123321', '654321', '7777777', '123', 'D1lakiss', '777777', 'admin', 'abc123',
  'password1', 'welcome', 'login', 'princess', 'solo', 'master', 'shadow', 'superman',
  'michael', 'sunshine', 'computer', 'jesus', 'hello', 'charlie', '696969', 'hottie',
  'freedom', 'aa123456', 'pussy', 'fuckyou', 'jordan', 'harley', 'ranger', 'iverson',
  'george', 'asshole', 'batman', 'maggie', 'michelle', 'jessica', 'pepper', '1g2w3e4r',
  'zxcvbnm', 'money', 'liverpool', 'pokemon', 'qwerty123', 'firebird', 'password123',
  'apple', 'mustang', 'access', 'shadow', 'master', 'michael', 'superman', '696969',
  'fucking', 'daniel', '123qwe', 'killer', 'trustno1', 'hunter', 'jordan', '1234567',
  'jordan23', 'harley', 'shadow', 'master', 'jennifer', 'hunter', 'fuckyou', '2000',
  'test', 'batman', 'trustno1', 'thomas', 'robert', '1qaz2wsx', 'secret', 'abc123',
  'whatever', 'dragon', 'vanessa', 'merlin', 'arthur', 'pass', 'qwertyui', 'princess',
  'elvis', 'action', 'changeme', 'red123', 'qqww1122', 'dragon', 'purple', 'hockey',
  'yellow', 'zxcvbnm', 'diablo', 'stephen', 'young', 'beautiful', 'family', 'maggie',
  'jessica', 'franklin', 'p@ssw0rd', 'admin123', 'welcome123', 'letmein', 'monkey'
]);

// Special characters for password requirements
const SPECIAL_CHARS = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

/**
 * Password strength calculator
 */
export class PasswordStrengthCalculator {
  private static calculateEntropy(password: string): number {
    const charset = new Set(password);
    const charsetSize = charset.size;
    return Math.log2(Math.pow(charsetSize, password.length));
  }

  private static hasUppercase(password: string): boolean {
    return /[A-Z]/.test(password);
  }

  private static hasLowercase(password: string): boolean {
    return /[a-z]/.test(password);
  }

  private static hasNumbers(password: string): boolean {
    return /\d/.test(password);
  }

  private static hasSpecialChars(password: string): boolean {
    return SPECIAL_CHARS.test(password);
  }

  private static hasRepeatingChars(password: string, maxRepeating: number): boolean {
    const regex = new RegExp(`(.)\\1{${maxRepeating - 1},}`, 'i');
    return regex.test(password);
  }

  private static isCommonPassword(password: string): boolean {
    return COMMON_PASSWORDS.has(password.toLowerCase());
  }

  private static containsUserInfo(password: string, userInfo?: UserInfo): boolean {
    if (!userInfo) return false;

    const passwordLower = password.toLowerCase();
    const infoParts = [
      userInfo.email?.split('@')[0],
      userInfo.firstName,
      userInfo.lastName,
      userInfo.username,
      userInfo.companyName,
    ].filter(Boolean);

    return infoParts.some(info => 
      info && info.length > 2 && passwordLower.includes(info.toLowerCase())
    );
  }

  /**
   * Validates password against policy
   */
  static validate(
    password: string, 
    policy: PasswordPolicy = DEFAULT_POLICY,
    userInfo?: UserInfo
  ): PasswordValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Length checks
    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    } else {
      score += Math.min(25, (password.length / policy.minLength) * 25);
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Character requirements
    const hasUpper = this.hasUppercase(password);
    const hasLower = this.hasLowercase(password);
    const hasNumbers = this.hasNumbers(password);
    const hasSpecial = this.hasSpecialChars(password);

    if (policy.requireUppercase && !hasUpper) {
      errors.push('Password must contain at least one uppercase letter');
    } else if (hasUpper) {
      score += 15;
    }

    if (policy.requireLowercase && !hasLower) {
      errors.push('Password must contain at least one lowercase letter');
    } else if (hasLower) {
      score += 15;
    }

    if (policy.requireNumbers && !hasNumbers) {
      errors.push('Password must contain at least one number');
    } else if (hasNumbers) {
      score += 15;
    }

    if (policy.requireSpecialChars && !hasSpecial) {
      errors.push('Password must contain at least one special character (!@#$%^&*...)');
    } else if (hasSpecial) {
      score += 20;
    }

    // Repeating characters check
    if (policy.maxRepeatingChars > 0 && this.hasRepeatingChars(password, policy.maxRepeatingChars + 1)) {
      errors.push(`Password must not contain more than ${policy.maxRepeatingChars} consecutive identical characters`);
    }

    // Common password check
    if (policy.preventCommonPasswords && this.isCommonPassword(password)) {
      errors.push('Password is too common and easily guessable');
      score = Math.min(score, 30);
    }

    // User info check
    if (policy.preventUserInfoInPassword && this.containsUserInfo(password, userInfo)) {
      errors.push('Password must not contain personal information');
      score = Math.min(score, 40);
    }

    // Entropy bonus
    const entropy = this.calculateEntropy(password);
    if (entropy > 60) score += 10;
    if (entropy > 80) score += 10;

    // Generate suggestions
    if (!hasUpper && !policy.requireUppercase) {
      suggestions.push('Consider adding uppercase letters for stronger security');
    }
    if (!hasLower && !policy.requireLowercase) {
      suggestions.push('Consider adding lowercase letters for stronger security');
    }
    if (!hasNumbers && !policy.requireNumbers) {
      suggestions.push('Consider adding numbers for stronger security');
    }
    if (!hasSpecial && !policy.requireSpecialChars) {
      suggestions.push('Consider adding special characters for stronger security');
    }

    if (password.length < 16 && password.length >= policy.minLength) {
      suggestions.push('Consider using a longer password (16+ characters) for better security');
    }

    // Score cap and warnings
    if (password.length < 8) {
      warnings.push('Password is very short and vulnerable to brute force attacks');
      score = Math.min(score, 20);
    }

    if (!/\d.*\d/.test(password) && hasNumbers) {
      warnings.push('Consider using multiple numbers');
    }

    return {
      isValid: errors.length === 0,
      score: Math.min(100, Math.max(0, score)),
      errors,
      warnings,
      suggestions,
    };
  }

  /**
   * Generate password strength description
   */
  static getStrengthDescription(score: number): {
    level: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    description: string;
    color: string;
  } {
    if (score < 20) {
      return {
        level: 'very-weak',
        description: 'Very Weak',
        color: '#dc2626', // red-600
      };
    } else if (score < 40) {
      return {
        level: 'weak',
        description: 'Weak',
        color: '#ea580c', // orange-600
      };
    } else if (score < 60) {
      return {
        level: 'fair',
        description: 'Fair',
        color: '#ca8a04', // yellow-600
      };
    } else if (score < 80) {
      return {
        level: 'good',
        description: 'Good',
        color: '#16a34a', // green-600
      };
    } else if (score < 95) {
      return {
        level: 'strong',
        description: 'Strong',
        color: '#2563eb', // blue-600
      };
    } else {
      return {
        level: 'very-strong',
        description: 'Very Strong',
        color: '#7c3aed', // violet-600
      };
    }
  }

  /**
   * Generate a secure password suggestion
   */
  static generateSecurePassword(length: number = 16): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const all = uppercase + lowercase + numbers + special;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => 0.5 - Math.random()).join('');
  }
}

/**
 * Password history manager
 */
export class PasswordHistoryManager {
  private static hashPassword(password: string): string {
    // Simple hash for password history comparison
    // In production, this would use a proper hash function like bcrypt
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  static async checkPasswordHistory(
    userId: string,
    newPassword: string,
    historyCount: number
  ): Promise<boolean> {
    // In a real implementation, this would query the database
    // For now, we'll simulate it
    try {
      // This would be a database call to get password history
      const passwordHistory: string[] = []; // Would be populated from DB
      
      const newPasswordHash = this.hashPassword(newPassword);
      
      return !passwordHistory.includes(newPasswordHash);
    } catch (error) {
      console.error('Password history check failed:', error);
      return true; // Allow if check fails
    }
  }

  static async addToPasswordHistory(userId: string, password: string): Promise<void> {
    // In a real implementation, this would update the database
    try {
      const passwordHash = this.hashPassword(password);
      
      // This would be a database operation to:
      // 1. Add new password hash to history
      // 2. Remove oldest entries if history exceeds limit
      
      console.log(`Password history updated for user ${userId}`);
    } catch (error) {
      console.error('Failed to update password history:', error);
    }
  }
}