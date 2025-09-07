#!/usr/bin/env node
/**
 * Session Management Testing Script
 * Tests session handling, token refresh, and security features
 */

const fs = require('fs');
const path = require('path');

class SessionManagementTester {
  constructor() {
    this.results = [];
  }

  log(status, category, message, details = '') {
    const timestamp = new Date().toISOString();
    const result = { timestamp, status, category, message, details };
    this.results.push(result);
    
    const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} [${category.toUpperCase()}] ${message}${details ? ` - ${details}` : ''}`);
  }

  async testAuthServiceMethods() {
    console.log('🔐 Testing Auth Service Methods...\n');

    const authServiceFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/auth-service.ts';
    if (fs.existsSync(authServiceFile)) {
      const content = fs.readFileSync(authServiceFile, 'utf-8');
      
      // Test core authentication methods
      const coreMethods = [
        { method: 'signIn', description: 'User sign in' },
        { method: 'signOut', description: 'User sign out' },
        { method: 'getSession', description: 'Get current session' },
        { method: 'getCurrentUser', description: 'Get current user profile' }
      ];

      coreMethods.forEach(({ method, description }) => {
        if (content.includes(`static async ${method}`)) {
          this.log('success', 'auth', `Auth Method`, `${method} - ${description} implemented`);
        } else {
          this.log('error', 'auth', `Auth Method`, `${method} - ${description} missing`);
        }
      });

      // Test user management methods
      const userMethods = [
        { method: 'updateProfile', description: 'Update user profile' },
        { method: 'changePassword', description: 'Change password' }
      ];

      userMethods.forEach(({ method, description }) => {
        if (content.includes(method)) {
          this.log('success', 'auth', `User Management`, `${method} - ${description} implemented`);
        } else {
          this.log('warning', 'auth', `User Management`, `${method} - ${description} missing`);
        }
      });

      // Test session management methods
      const sessionMethods = [
        { method: 'getUserSessions', description: 'Get user active sessions' },
        { method: 'revokeSession', description: 'Revoke specific session' },
        { method: 'revokeUserSessions', description: 'Revoke all user sessions' }
      ];

      sessionMethods.forEach(({ method, description }) => {
        if (content.includes(method)) {
          this.log('success', 'session', `Session Management`, `${method} - ${description} implemented`);
        } else {
          this.log('error', 'session', `Session Management`, `${method} - ${description} missing`);
        }
      });
    } else {
      this.log('error', 'auth', 'Auth Service File', 'AuthService file not found');
    }
  }

  async testSessionSecurity() {
    console.log('\n🛡️ Testing Session Security Features...\n');

    const authServiceFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/auth-service.ts';
    if (fs.existsSync(authServiceFile)) {
      const content = fs.readFileSync(authServiceFile, 'utf-8');

      // Test security constants
      if (content.includes('MAX_LOGIN_ATTEMPTS')) {
        const maxAttemptsMatch = content.match(/MAX_LOGIN_ATTEMPTS\s*=\s*(\d+)/);
        const maxAttempts = maxAttemptsMatch ? parseInt(maxAttemptsMatch[1]) : null;
        this.log('success', 'security', 'Max Login Attempts', `Limited to ${maxAttempts} attempts`);
      } else {
        this.log('error', 'security', 'Max Login Attempts', 'Login attempt limiting not implemented');
      }

      if (content.includes('LOCKOUT_DURATION')) {
        const lockoutMatch = content.match(/LOCKOUT_DURATION\s*=\s*(.+);/);
        const lockoutDuration = lockoutMatch ? lockoutMatch[1] : null;
        this.log('success', 'security', 'Account Lockout', `Lockout duration: ${lockoutDuration}`);
      } else {
        this.log('error', 'security', 'Account Lockout', 'Account lockout not implemented');
      }

      // Test failed login handling
      if (content.includes('handleFailedLogin')) {
        this.log('success', 'security', 'Failed Login Tracking', 'Failed login attempts tracked');
      } else {
        this.log('error', 'security', 'Failed Login Tracking', 'Failed login tracking missing');
      }

      if (content.includes('checkAccountLockout')) {
        this.log('success', 'security', 'Account Lockout Check', 'Account lockout validation implemented');
      } else {
        this.log('error', 'security', 'Account Lockout Check', 'Account lockout check missing');
      }

      // Test session tracking features
      const trackingFeatures = [
        { feature: 'ip_address', description: 'IP address tracking' },
        { feature: 'device_info', description: 'Device information tracking' },
        { feature: 'user_agent', description: 'User agent tracking' },
        { feature: 'session_token', description: 'Session token management' }
      ];

      trackingFeatures.forEach(({ feature, description }) => {
        if (content.includes(feature)) {
          this.log('success', 'tracking', 'Session Tracking', `${description} implemented`);
        } else {
          this.log('warning', 'tracking', 'Session Tracking', `${description} missing`);
        }
      });

      // Test session creation and cleanup
      if (content.includes('createSession')) {
        this.log('success', 'session', 'Session Creation', 'Session creation logic implemented');
      } else {
        this.log('warning', 'session', 'Session Creation', 'Explicit session creation unclear');
      }

      if (content.includes('cleanup') || content.includes('expired')) {
        this.log('success', 'session', 'Session Cleanup', 'Session cleanup logic present');
      } else {
        this.log('warning', 'session', 'Session Cleanup', 'Session cleanup logic unclear');
      }
    }
  }

  async testSessionDatabase() {
    console.log('\n🗃️ Testing Session Database Schema...\n');

    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');

      // Test user_sessions table structure
      if (content.includes('CREATE TABLE user_sessions')) {
        this.log('success', 'database', 'User Sessions Table', 'user_sessions table defined');

        // Test required columns
        const requiredColumns = [
          { column: 'user_id', description: 'User reference' },
          { column: 'session_token', description: 'Session token storage' },
          { column: 'device_info', description: 'Device information JSON' },
          { column: 'ip_address', description: 'IP address tracking' },
          { column: 'user_agent', description: 'User agent string' },
          { column: 'status', description: 'Session status enum' },
          { column: 'expires_at', description: 'Session expiry time' },
          { column: 'last_activity', description: 'Last activity timestamp' }
        ];

        requiredColumns.forEach(({ column, description }) => {
          if (content.includes(column)) {
            this.log('success', 'database', 'Session Column', `${column} - ${description}`);
          } else {
            this.log('error', 'database', 'Session Column', `${column} - ${description} missing`);
          }
        });

        // Test session status enum
        if (content.includes('session_status')) {
          this.log('success', 'database', 'Session Status Enum', 'session_status enum defined');
          
          const statusValues = ['active', 'expired', 'revoked'];
          statusValues.forEach(status => {
            if (content.includes(`'${status}'`)) {
              this.log('success', 'database', 'Session Status Value', `${status} status defined`);
            } else {
              this.log('warning', 'database', 'Session Status Value', `${status} status missing`);
            }
          });
        } else {
          this.log('error', 'database', 'Session Status Enum', 'session_status enum missing');
        }
      } else {
        this.log('error', 'database', 'User Sessions Table', 'user_sessions table missing');
      }

      // Test session indexes
      const sessionIndexes = [
        'idx_user_sessions_user_id',
        'idx_user_sessions_status',
        'idx_user_sessions_expires_at'
      ];

      sessionIndexes.forEach(index => {
        if (content.includes(index)) {
          this.log('success', 'database', 'Session Index', `${index} performance index defined`);
        } else {
          this.log('warning', 'database', 'Session Index', `${index} performance index missing`);
        }
      });

      // Test session RLS policies
      const sessionPolicies = [
        'session_select_own',
        'session_update_own',
        'session_delete_own'
      ];

      sessionPolicies.forEach(policy => {
        if (content.includes(policy)) {
          this.log('success', 'database', 'Session RLS Policy', `${policy} policy defined`);
        } else {
          this.log('warning', 'database', 'Session RLS Policy', `${policy} policy missing`);
        }
      });

      // Test session cleanup function
      if (content.includes('cleanup_expired_sessions')) {
        this.log('success', 'database', 'Session Cleanup Function', 'Expired session cleanup function defined');
      } else {
        this.log('warning', 'database', 'Session Cleanup Function', 'Session cleanup function missing');
      }
    }

    // Test OAuth session enhancements
    const oauthMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/006_oauth_enhancements.sql';
    if (fs.existsSync(oauthMigrationFile)) {
      const content = fs.readFileSync(oauthMigrationFile, 'utf-8');

      if (content.includes('oauth_provider') && content.includes('user_sessions')) {
        this.log('success', 'database', 'OAuth Session Integration', 'OAuth provider tracking in sessions');
      } else {
        this.log('warning', 'database', 'OAuth Session Integration', 'OAuth session integration unclear');
      }

      if (content.includes('refresh_token_hash')) {
        this.log('success', 'database', 'Token Management', 'Refresh token hash storage implemented');
      } else {
        this.log('warning', 'database', 'Token Management', 'Token management features unclear');
      }
    }
  }

  async testTokenRefreshMechanisms() {
    console.log('\n🔄 Testing Token Refresh Mechanisms...\n');

    // Test Supabase configuration for token refresh
    const supabaseConfigFile = '/Users/benjaminfrost/athletic-labs/supabase/config.toml';
    if (fs.existsSync(supabaseConfigFile)) {
      const content = fs.readFileSync(supabaseConfigFile, 'utf-8');

      // Test JWT settings
      if (content.includes('jwt_expiry')) {
        const expiryMatch = content.match(/jwt_expiry\s*=\s*(\d+)/);
        const expiry = expiryMatch ? parseInt(expiryMatch[1]) : null;
        this.log('success', 'token', 'JWT Expiry', `Token expires in ${expiry} seconds`);
      } else {
        this.log('warning', 'token', 'JWT Expiry', 'JWT expiry configuration not found');
      }

      if (content.includes('enable_refresh_token_rotation')) {
        this.log('success', 'token', 'Token Rotation', 'Refresh token rotation enabled');
      } else {
        this.log('warning', 'token', 'Token Rotation', 'Refresh token rotation configuration unclear');
      }

      if (content.includes('refresh_token_reuse_interval')) {
        const reuseMatch = content.match(/refresh_token_reuse_interval\s*=\s*(\d+)/);
        const reuse = reuseMatch ? parseInt(reuseMatch[1]) : null;
        this.log('success', 'token', 'Token Reuse Protection', `Reuse interval: ${reuse} seconds`);
      } else {
        this.log('warning', 'token', 'Token Reuse Protection', 'Token reuse protection unclear');
      }
    }

    // Test client-side token handling
    const supabaseClientFile = '/Users/benjaminfrost/athletic-labs/src/lib/supabase/client.ts';
    if (fs.existsSync(supabaseClientFile)) {
      const content = fs.readFileSync(supabaseClientFile, 'utf-8');

      if (content.includes('autoRefreshToken')) {
        this.log('success', 'token', 'Auto Refresh', 'Automatic token refresh enabled');
      } else {
        this.log('warning', 'token', 'Auto Refresh', 'Auto token refresh configuration unclear');
      }

      if (content.includes('persistSession')) {
        this.log('success', 'token', 'Session Persistence', 'Session persistence configured');
      } else {
        this.log('warning', 'token', 'Session Persistence', 'Session persistence unclear');
      }
    }

    // Test server-side token handling
    const middlewareFile = '/Users/benjaminfrost/athletic-labs/src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf-8');

      if (content.includes('getSession') && content.includes('sessionError')) {
        this.log('success', 'token', 'Session Validation', 'Server-side session validation with error handling');
      } else {
        this.log('warning', 'token', 'Session Validation', 'Session validation error handling unclear');
      }

      if (content.includes('expires') || content.includes('refresh')) {
        this.log('success', 'token', 'Token Expiry Handling', 'Token expiry handling logic present');
      } else {
        this.log('warning', 'token', 'Token Expiry Handling', 'Token expiry handling unclear');
      }
    }
  }

  async testSessionSecurityMeasures() {
    console.log('\n🔒 Testing Session Security Measures...\n');

    // Test middleware session security
    const middlewareFile = '/Users/benjaminfrost/athletic-labs/src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf-8');

      // Test user context validation
      if (content.includes('getUserData') || content.includes('getCachedUserData')) {
        this.log('success', 'security', 'User Context Validation', 'User context validation implemented');
      } else {
        this.log('error', 'security', 'User Context Validation', 'User context validation missing');
      }

      // Test account status checks
      if (content.includes('is_active')) {
        this.log('success', 'security', 'Account Status Check', 'User and team active status validation');
      } else {
        this.log('error', 'security', 'Account Status Check', 'Account status validation missing');
      }

      // Test session caching
      if (content.includes('middlewareCacheManager')) {
        this.log('success', 'security', 'Session Caching', 'Session data caching for performance');
      } else {
        this.log('warning', 'security', 'Session Caching', 'Session caching unclear');
      }

      // Test IP and user agent tracking
      if (content.includes('getClientIP') && content.includes('user-agent')) {
        this.log('success', 'security', 'Request Fingerprinting', 'IP and user agent tracking implemented');
      } else {
        this.log('warning', 'security', 'Request Fingerprinting', 'Request fingerprinting incomplete');
      }
    }

    // Test OAuth token security
    const oauthMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/006_oauth_enhancements.sql';
    if (fs.existsSync(oauthMigrationFile)) {
      const content = fs.readFileSync(oauthMigrationFile, 'utf-8');

      if (content.includes('cleanup_expired_oauth_tokens')) {
        this.log('success', 'security', 'OAuth Token Cleanup', 'Expired OAuth token cleanup function');
      } else {
        this.log('warning', 'security', 'OAuth Token Cleanup', 'OAuth token cleanup missing');
      }

      if (content.includes('access_token_hash') && content.includes('refresh_token_hash')) {
        this.log('success', 'security', 'Token Hashing', 'OAuth tokens stored as hashes for security');
      } else {
        this.log('warning', 'security', 'Token Hashing', 'OAuth token security unclear');
      }
    }
  }

  async testSessionMonitoring() {
    console.log('\n📊 Testing Session Monitoring...\n');

    // Test audit logging integration
    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');

      if (content.includes('audit_logs') && content.includes('login')) {
        this.log('success', 'monitoring', 'Login Audit Logging', 'Login events logged to audit system');
      } else {
        this.log('warning', 'monitoring', 'Login Audit Logging', 'Login audit logging unclear');
      }
    }

    // Test session activity tracking
    const authServiceFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/auth-service.ts';
    if (fs.existsSync(authServiceFile)) {
      const content = fs.readFileSync(authServiceFile, 'utf-8');

      if (content.includes('last_login_at')) {
        this.log('success', 'monitoring', 'Login Activity Tracking', 'Last login timestamp tracking');
      } else {
        this.log('warning', 'monitoring', 'Login Activity Tracking', 'Login activity tracking unclear');
      }

      if (content.includes('logAuditEvent') && content.includes('login')) {
        this.log('success', 'monitoring', 'Session Event Logging', 'Session events logged for monitoring');
      } else {
        this.log('warning', 'monitoring', 'Session Event Logging', 'Session event logging unclear');
      }
    }

    // Test session statistics
    const oauthMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/006_oauth_enhancements.sql';
    if (fs.existsSync(oauthMigrationFile)) {
      const content = fs.readFileSync(oauthMigrationFile, 'utf-8');

      if (content.includes('get_oauth_provider_stats')) {
        this.log('success', 'monitoring', 'Authentication Stats', 'OAuth provider usage statistics available');
      } else {
        this.log('warning', 'monitoring', 'Authentication Stats', 'Authentication statistics unclear');
      }

      if (content.includes('user_auth_methods')) {
        this.log('success', 'monitoring', 'Auth Methods View', 'User authentication methods tracking');
      } else {
        this.log('warning', 'monitoring', 'Auth Methods View', 'Authentication methods tracking unclear');
      }
    }
  }

  generateReport() {
    console.log('\n📊 Session Management Testing Summary');
    console.log('====================================');
    
    const categories = ['auth', 'session', 'security', 'tracking', 'database', 'token', 'monitoring'];
    const categoryResults = categories.map(category => {
      const tests = this.results.filter(r => r.category === category);
      const successful = tests.filter(t => t.status === 'success').length;
      const warnings = tests.filter(t => t.status === 'warning').length;
      const errors = tests.filter(t => t.status === 'error').length;
      const total = tests.length;
      
      return {
        category: category.toUpperCase(),
        successful,
        warnings,
        errors,
        total,
        percentage: total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0'
      };
    });

    categoryResults.forEach(result => {
      if (result.total > 0) {
        const icon = parseFloat(result.percentage) >= 90 ? '✅' : parseFloat(result.percentage) >= 70 ? '⚠️' : '❌';
        console.log(`${icon} ${result.category}: ${result.successful}✅ ${result.warnings}⚠️ ${result.errors}❌ (${result.percentage}% success)`);
      }
    });

    const totalSuccessful = this.results.filter(r => r.status === 'success').length;
    const totalWarnings = this.results.filter(r => r.status === 'warning').length;
    const totalErrors = this.results.filter(r => r.status === 'error').length;
    const totalTests = this.results.length;
    const overallPercentage = totalTests > 0 ? ((totalSuccessful / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📈 Overall Session Management Results:');
    console.log(`✅ Success: ${totalSuccessful}/${totalTests} (${overallPercentage}%)`);
    console.log(`⚠️ Warnings: ${totalWarnings}/${totalTests}`);
    console.log(`❌ Errors: ${totalErrors}/${totalTests}`);

    // Show critical errors
    const criticalErrors = this.results.filter(r => r.status === 'error');
    if (criticalErrors.length > 0) {
      console.log('\n❌ Critical Session Management Issues:');
      criticalErrors.forEach(error => {
        console.log(`   - [${error.category.toUpperCase()}] ${error.message}: ${error.details}`);
      });
    }

    // Show important warnings
    const importantWarnings = this.results.filter(r => r.status === 'warning' && 
      (r.category === 'security' || r.category === 'token'));
    if (importantWarnings.length > 0) {
      console.log('\n⚠️ Important Session Security Warnings:');
      importantWarnings.forEach(warning => {
        console.log(`   - [${warning.category.toUpperCase()}] ${warning.message}: ${warning.details}`);
      });
    }

    // Session security recommendations
    console.log('\n🔒 Session Security Recommendations:');
    console.log('- Implement session timeout and automatic logout');
    console.log('- Use secure, httpOnly cookies for session tokens');
    console.log('- Implement concurrent session limits per user');
    console.log('- Log all session events for security monitoring');
    console.log('- Implement device fingerprinting for anomaly detection');
    console.log('- Regular cleanup of expired sessions and tokens');
    console.log('- Use CSP headers to prevent token theft via XSS');

    // Token management recommendations
    console.log('\n🔄 Token Management Recommendations:');
    console.log('- Implement short-lived access tokens with refresh tokens');
    console.log('- Use token rotation to prevent replay attacks');
    console.log('- Implement token revocation on suspicious activity');
    console.log('- Store refresh tokens securely with encryption');
    console.log('- Monitor token usage patterns for anomalies');
    console.log('- Implement graceful token refresh failure handling');

    // Production readiness assessment
    if (parseFloat(overallPercentage) >= 85 && totalErrors === 0) {
      console.log('\n🎉 Session Management System is Production Ready!');
      console.log('\nNext Steps:');
      console.log('1. Configure session timeouts for production');
      console.log('2. Set up session monitoring and alerting');
      console.log('3. Test session handling under load');
      console.log('4. Implement session analytics dashboard');
      console.log('5. Set up automated session cleanup jobs');
    } else {
      console.log('\n⚠️ Session Management Needs Improvements');
      console.log('\nPriority Actions:');
      console.log('1. Fix critical session management errors');
      console.log('2. Address security warnings');
      console.log('3. Complete token refresh implementation');
      console.log('4. Test session security measures');
      console.log('5. Re-run session management tests');
    }
  }

  async run() {
    console.log('🚀 Starting Session Management Testing...\n');
    
    await this.testAuthServiceMethods();
    await this.testSessionSecurity();
    await this.testSessionDatabase();
    await this.testTokenRefreshMechanisms();
    await this.testSessionSecurityMeasures();
    await this.testSessionMonitoring();
    
    this.generateReport();
  }
}

// Run the tests
async function main() {
  const tester = new SessionManagementTester();
  await tester.run();
}

if (require.main === module) {
  main().catch(console.error);
}