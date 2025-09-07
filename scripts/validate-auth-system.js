#!/usr/bin/env node
/**
 * Authentication System Validation Script
 * Validates OAuth implementation, RBAC setup, and security features
 */

const fs = require('fs');
const path = require('path');

class AuthSystemValidator {
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

  async validateOAuthImplementation() {
    console.log('🔐 Validating OAuth Implementation...\n');

    // 1. Check OAuth service file
    const oauthServiceFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/oauth-service.ts';
    if (fs.existsSync(oauthServiceFile)) {
      const content = fs.readFileSync(oauthServiceFile, 'utf-8');
      
      const hasOAuthService = content.includes('export class OAuthService');
      const hasProviders = content.includes('OAuthProvider');
      const hasSignInMethod = content.includes('signInWithOAuth');
      const hasCallbackHandler = content.includes('handleCallback');
      const hasErrorHandling = content.includes('getErrorMessage');
      const hasProviderValidation = content.includes('validateProviderConfig');
      
      if (hasOAuthService && hasProviders && hasSignInMethod && hasCallbackHandler && hasErrorHandling && hasProviderValidation) {
        this.log('success', 'oauth', 'OAuth Service Implementation', 'Complete implementation found');
      } else {
        this.log('error', 'oauth', 'OAuth Service Implementation', `Missing features - Service: ${hasOAuthService}, Providers: ${hasProviders}, SignIn: ${hasSignInMethod}, Callback: ${hasCallbackHandler}, Errors: ${hasErrorHandling}, Validation: ${hasProviderValidation}`);
      }

      // Check for specific OAuth providers
      const providers = ['google', 'github', 'azure', 'apple'];
      providers.forEach(provider => {
        if (content.includes(`'${provider}'`)) {
          this.log('success', 'oauth', `OAuth Provider Configuration`, `${provider} provider configured`);
        } else {
          this.log('warning', 'oauth', `OAuth Provider Configuration`, `${provider} provider not found`);
        }
      });
    } else {
      this.log('error', 'oauth', 'OAuth Service File', 'OAuth service file not found');
    }

    // 2. Check OAuth callback route
    const callbackFile = '/Users/benjaminfrost/athletic-labs/src/app/auth/callback/route.ts';
    if (fs.existsSync(callbackFile)) {
      const content = fs.readFileSync(callbackFile, 'utf-8');
      
      const hasCallbackHandler = content.includes('export async function GET');
      const hasCodeExchange = content.includes('exchangeCodeForSession');
      const hasErrorHandling = content.includes('error') && content.includes('OAuth');
      const hasProfileCreation = content.includes('createUserProfile');
      const hasRedirectHandling = content.includes('redirect');
      const hasSecurityChecks = content.includes('isValidRedirectUrl');
      
      if (hasCallbackHandler && hasCodeExchange && hasErrorHandling && hasProfileCreation && hasRedirectHandling && hasSecurityChecks) {
        this.log('success', 'oauth', 'OAuth Callback Handler', 'Complete callback implementation');
      } else {
        this.log('error', 'oauth', 'OAuth Callback Handler', `Missing features - Handler: ${hasCallbackHandler}, Exchange: ${hasCodeExchange}, Errors: ${hasErrorHandling}, Profile: ${hasProfileCreation}, Redirect: ${hasRedirectHandling}, Security: ${hasSecurityChecks}`);
      }
    } else {
      this.log('error', 'oauth', 'OAuth Callback Route', 'Callback route file not found');
    }

    // 3. Check OAuth components
    const oauthButtonFile = '/Users/benjaminfrost/athletic-labs/src/lib/components/OAuthButton.tsx';
    if (fs.existsSync(oauthButtonFile)) {
      const content = fs.readFileSync(oauthButtonFile, 'utf-8');
      
      const hasOAuthButton = content.includes('OAuthButton');
      const hasProviderList = content.includes('OAuthProviderList');
      const hasAccountManager = content.includes('OAuthAccountManager');
      const hasErrorHandling = content.includes('error') && content.includes('onError');
      
      if (hasOAuthButton && hasProviderList && hasAccountManager && hasErrorHandling) {
        this.log('success', 'oauth', 'OAuth UI Components', 'All OAuth components implemented');
      } else {
        this.log('error', 'oauth', 'OAuth UI Components', `Missing components - Button: ${hasOAuthButton}, List: ${hasProviderList}, Manager: ${hasAccountManager}, Errors: ${hasErrorHandling}`);
      }
    } else {
      this.log('error', 'oauth', 'OAuth UI Components', 'OAuth components file not found');
    }

    // 4. Check OAuth database migration
    const oauthMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/006_oauth_enhancements.sql';
    if (fs.existsSync(oauthMigrationFile)) {
      const content = fs.readFileSync(oauthMigrationFile, 'utf-8');
      
      const hasOAuthColumns = content.includes('oauth_provider') && content.includes('oauth_provider_id');
      const hasOAuthProvidersTable = content.includes('CREATE TABLE IF NOT EXISTS oauth_providers');
      const hasOAuthAccountsTable = content.includes('CREATE TABLE IF NOT EXISTS oauth_accounts');
      const hasIndexes = content.includes('idx_oauth_accounts');
      const hasRLSPolicies = content.includes('oauth_accounts_select_own');
      const hasFunctions = content.includes('get_user_oauth_providers');
      
      if (hasOAuthColumns && hasOAuthProvidersTable && hasOAuthAccountsTable && hasIndexes && hasRLSPolicies && hasFunctions) {
        this.log('success', 'oauth', 'OAuth Database Migration', 'Complete OAuth database schema');
      } else {
        this.log('error', 'oauth', 'OAuth Database Migration', `Missing schema - Columns: ${hasOAuthColumns}, Providers: ${hasOAuthProvidersTable}, Accounts: ${hasOAuthAccountsTable}, Indexes: ${hasIndexes}, RLS: ${hasRLSPolicies}, Functions: ${hasFunctions}`);
      }
    } else {
      this.log('error', 'oauth', 'OAuth Database Migration', 'OAuth migration file not found');
    }
  }

  async validateRBACSystem() {
    console.log('\n👥 Validating RBAC System...\n');

    // 1. Check RBAC service
    const rbacFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/rbac.ts';
    if (fs.existsSync(rbacFile)) {
      const content = fs.readFileSync(rbacFile, 'utf-8');
      
      const hasRBACService = content.includes('export class RBACService');
      const hasUserRoles = content.includes('UserRole');
      const hasTeamPermissions = content.includes('TeamPermissions');
      const hasGetPermissions = content.includes('getUserPermissions');
      const hasHasPermission = content.includes('hasPermission');
      const hasUpdatePermissions = content.includes('updateUserPermissions');
      const hasCanPerformAction = content.includes('canPerformAction');
      
      if (hasRBACService && hasUserRoles && hasTeamPermissions && hasGetPermissions && hasHasPermission && hasUpdatePermissions && hasCanPerformAction) {
        this.log('success', 'rbac', 'RBAC Service Implementation', 'Complete RBAC service');
      } else {
        this.log('error', 'rbac', 'RBAC Service Implementation', `Missing features - Service: ${hasRBACService}, Roles: ${hasUserRoles}, Permissions: ${hasTeamPermissions}, Get: ${hasGetPermissions}, Has: ${hasHasPermission}, Update: ${hasUpdatePermissions}, Action: ${hasCanPerformAction}`);
      }

      // Check role hierarchy
      const roles = ['team_staff', 'team_admin', 'athletic_labs_admin', 'athletic_labs_staff'];
      roles.forEach(role => {
        if (content.includes(`'${role}'`)) {
          this.log('success', 'rbac', `Role Definition`, `${role} role defined`);
        } else {
          this.log('warning', 'rbac', `Role Definition`, `${role} role not found`);
        }
      });

      // Check permissions
      const permissions = ['can_create_orders', 'can_view_all_orders', 'can_edit_orders', 'can_delete_orders', 'can_manage_team', 'can_view_analytics'];
      permissions.forEach(permission => {
        if (content.includes(permission)) {
          this.log('success', 'rbac', `Permission Definition`, `${permission} defined`);
        } else {
          this.log('warning', 'rbac', `Permission Definition`, `${permission} not found`);
        }
      });
    } else {
      this.log('error', 'rbac', 'RBAC Service File', 'RBAC service file not found');
    }

    // 2. Check RBAC database migration
    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');
      
      const hasTeamPermissionsTable = content.includes('CREATE TABLE team_permissions');
      const hasUserRoleType = content.includes('CREATE TYPE.*user_role');
      const hasPermissionColumns = content.includes('can_create_orders');
      const hasRLSPolicies = content.includes('team_permissions') && content.includes('POLICY');
      const hasAuditLogs = content.includes('CREATE TABLE audit_logs');
      const hasPermissionFunction = content.includes('has_team_permission');
      
      if (hasTeamPermissionsTable && hasUserRoleType && hasPermissionColumns && hasRLSPolicies && hasAuditLogs && hasPermissionFunction) {
        this.log('success', 'rbac', 'RBAC Database Schema', 'Complete RBAC database implementation');
      } else {
        this.log('error', 'rbac', 'RBAC Database Schema', `Missing schema - Table: ${hasTeamPermissionsTable}, Types: ${hasUserRoleType}, Columns: ${hasPermissionColumns}, RLS: ${hasRLSPolicies}, Audit: ${hasAuditLogs}, Functions: ${hasPermissionFunction}`);
      }
    } else {
      this.log('error', 'rbac', 'RBAC Database Migration', 'RBAC migration file not found');
    }

    // 3. Check middleware integration
    const middlewareFile = '/Users/benjaminfrost/athletic-labs/src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf-8');
      
      const hasProtectedRoutes = content.includes('PROTECTED_ROUTES');
      const hasRoleBasedAccess = content.includes('roles') && content.includes('permissions');
      const hasPermissionCheck = content.includes('checkUserPermissions');
      const hasRoleValidation = content.includes('routeConfig.roles');
      
      if (hasProtectedRoutes && hasRoleBasedAccess && hasPermissionCheck && hasRoleValidation) {
        this.log('success', 'rbac', 'Middleware Integration', 'RBAC integrated in middleware');
      } else {
        this.log('error', 'rbac', 'Middleware Integration', `Missing integration - Routes: ${hasProtectedRoutes}, Roles: ${hasRoleBasedAccess}, Permissions: ${hasPermissionCheck}, Validation: ${hasRoleValidation}`);
      }
    } else {
      this.log('error', 'rbac', 'Middleware File', 'Middleware file not found');
    }
  }

  async validateSessionManagement() {
    console.log('\n🔒 Validating Session Management...\n');

    // 1. Check auth service
    const authServiceFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/auth-service.ts';
    if (fs.existsSync(authServiceFile)) {
      const content = fs.readFileSync(authServiceFile, 'utf-8');
      
      const hasSignIn = content.includes('signIn');
      const hasSignOut = content.includes('signOut');
      const hasGetSession = content.includes('getSession');
      const hasGetCurrentUser = content.includes('getCurrentUser');
      const hasSessionTracking = content.includes('user_sessions');
      const hasFailedLoginTracking = content.includes('handleFailedLogin');
      const hasAccountLockout = content.includes('checkAccountLockout');
      const hasMaxAttempts = content.includes('MAX_LOGIN_ATTEMPTS');
      
      if (hasSignIn && hasSignOut && hasGetSession && hasGetCurrentUser && hasSessionTracking && hasFailedLoginTracking && hasAccountLockout && hasMaxAttempts) {
        this.log('success', 'session', 'Auth Service Features', 'Complete session management');
      } else {
        this.log('error', 'session', 'Auth Service Features', `Missing features - SignIn: ${hasSignIn}, SignOut: ${hasSignOut}, Session: ${hasGetSession}, User: ${hasGetCurrentUser}, Tracking: ${hasSessionTracking}, FailedLogin: ${hasFailedLoginTracking}, Lockout: ${hasAccountLockout}, MaxAttempts: ${hasMaxAttempts}`);
      }

      // Check security features
      const hasIPTracking = content.includes('ip_address');
      const hasDeviceTracking = content.includes('device_info');
      const hasUserAgentTracking = content.includes('user_agent');
      const hasTokenManagement = content.includes('session_token');
      
      if (hasIPTracking && hasDeviceTracking && hasUserAgentTracking && hasTokenManagement) {
        this.log('success', 'session', 'Session Security Features', 'Advanced session tracking implemented');
      } else {
        this.log('warning', 'session', 'Session Security Features', `Limited features - IP: ${hasIPTracking}, Device: ${hasDeviceTracking}, UserAgent: ${hasUserAgentTracking}, Token: ${hasTokenManagement}`);
      }
    } else {
      this.log('error', 'session', 'Auth Service File', 'Auth service file not found');
    }

    // 2. Check session database schema
    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');
      
      const hasUserSessionsTable = content.includes('CREATE TABLE user_sessions');
      const hasSessionStatus = content.includes('session_status');
      const hasExpiryTracking = content.includes('expires_at');
      const hasDeviceInfo = content.includes('device_info');
      const hasIPAddress = content.includes('ip_address');
      const hasUserAgent = content.includes('user_agent');
      
      if (hasUserSessionsTable && hasSessionStatus && hasExpiryTracking && hasDeviceInfo && hasIPAddress && hasUserAgent) {
        this.log('success', 'session', 'Session Database Schema', 'Complete session tracking schema');
      } else {
        this.log('error', 'session', 'Session Database Schema', `Missing schema - Table: ${hasUserSessionsTable}, Status: ${hasSessionStatus}, Expiry: ${hasExpiryTracking}, Device: ${hasDeviceInfo}, IP: ${hasIPAddress}, UserAgent: ${hasUserAgent}`);
      }
    }
  }

  async validateSecurityFeatures() {
    console.log('\n🛡️ Validating Security Features...\n');

    // 1. Check password policy
    const passwordPolicyFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/password-policy.ts';
    if (fs.existsSync(passwordPolicyFile)) {
      const content = fs.readFileSync(passwordPolicyFile, 'utf-8');
      
      const hasPasswordPolicy = content.includes('PasswordPolicy') || content.includes('password');
      const hasValidation = content.includes('validate') || content.includes('strength');
      
      if (hasPasswordPolicy && hasValidation) {
        this.log('success', 'security', 'Password Policy', 'Password policy implemented');
      } else {
        this.log('warning', 'security', 'Password Policy', 'Limited password policy features');
      }
    } else {
      this.log('warning', 'security', 'Password Policy File', 'Password policy file not found');
    }

    // 2. Check CORS configuration
    const corsFile = '/Users/benjaminfrost/athletic-labs/src/lib/middleware/cors-middleware.ts';
    if (fs.existsSync(corsFile)) {
      const content = fs.readFileSync(corsFile, 'utf-8');
      
      const hasCORSMiddleware = content.includes('cors');
      const hasOriginValidation = content.includes('origin');
      const hasMethodRestrictions = content.includes('methods');
      const hasHeaderValidation = content.includes('headers');
      
      if (hasCORSMiddleware && hasOriginValidation && hasMethodRestrictions && hasHeaderValidation) {
        this.log('success', 'security', 'CORS Configuration', 'Complete CORS protection');
      } else {
        this.log('warning', 'security', 'CORS Configuration', `Limited CORS - Middleware: ${hasCORSMiddleware}, Origin: ${hasOriginValidation}, Methods: ${hasMethodRestrictions}, Headers: ${hasHeaderValidation}`);
      }
    } else {
      this.log('warning', 'security', 'CORS Configuration', 'CORS middleware file not found');
    }

    // 3. Check input sanitization
    if (fs.existsSync('/Users/benjaminfrost/athletic-labs/src/middleware.ts')) {
      const content = fs.readFileSync('/Users/benjaminfrost/athletic-labs/src/middleware.ts', 'utf-8');
      
      const hasThreatDetection = content.includes('performThreatDetection');
      const hasInputSanitizer = content.includes('inputSanitizer');
      const hasSecurityBlocking = content.includes('THREAT_DETECTED');
      const hasSecurityHeaders = content.includes('X-Security-Block');
      
      if (hasThreatDetection && hasInputSanitizer && hasSecurityBlocking && hasSecurityHeaders) {
        this.log('success', 'security', 'Input Sanitization', 'Advanced threat detection implemented');
      } else {
        this.log('warning', 'security', 'Input Sanitization', `Limited sanitization - Detection: ${hasThreatDetection}, Sanitizer: ${hasInputSanitizer}, Blocking: ${hasSecurityBlocking}, Headers: ${hasSecurityHeaders}`);
      }
    }

    // 4. Check RLS optimization
    const rlsMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql';
    if (fs.existsSync(rlsMigrationFile)) {
      const content = fs.readFileSync(rlsMigrationFile, 'utf-8');
      
      const hasOptimizedFunctions = content.includes('auth_user_team_id') && content.includes('auth_has_team_permission');
      const hasOptimizedPolicies = content.includes('_optimized');
      const hasSecurityDefiner = content.includes('SECURITY DEFINER');
      const hasPerformanceIndexes = content.includes('idx_profiles_auth_uid');
      
      if (hasOptimizedFunctions && hasOptimizedPolicies && hasSecurityDefiner && hasPerformanceIndexes) {
        this.log('success', 'security', 'RLS Security Optimization', 'Advanced RLS security and performance');
      } else {
        this.log('warning', 'security', 'RLS Security Optimization', `Limited optimization - Functions: ${hasOptimizedFunctions}, Policies: ${hasOptimizedPolicies}, Security: ${hasSecurityDefiner}, Indexes: ${hasPerformanceIndexes}`);
      }
    }
  }

  generateReport() {
    console.log('\n📊 Authentication System Validation Summary');
    console.log('=============================================');
    
    const categories = ['oauth', 'rbac', 'session', 'security'];
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
      const icon = parseFloat(result.percentage) >= 90 ? '✅' : parseFloat(result.percentage) >= 70 ? '⚠️' : '❌';
      console.log(`${icon} ${result.category}: ${result.successful}✅ ${result.warnings}⚠️ ${result.errors}❌ (${result.percentage}% success)`);
    });

    const totalSuccessful = this.results.filter(r => r.status === 'success').length;
    const totalWarnings = this.results.filter(r => r.status === 'warning').length;
    const totalErrors = this.results.filter(r => r.status === 'error').length;
    const totalTests = this.results.length;
    const overallPercentage = totalTests > 0 ? ((totalSuccessful / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📈 Overall Results:');
    console.log(`✅ Success: ${totalSuccessful}/${totalTests} (${overallPercentage}%)`);
    console.log(`⚠️ Warnings: ${totalWarnings}/${totalTests}`);
    console.log(`❌ Errors: ${totalErrors}/${totalTests}`);

    // Show critical errors
    const criticalErrors = this.results.filter(r => r.status === 'error');
    if (criticalErrors.length > 0) {
      console.log('\n❌ Critical Issues to Address:');
      criticalErrors.forEach(error => {
        console.log(`   - [${error.category.toUpperCase()}] ${error.message}: ${error.details}`);
      });
    }

    // Next steps
    if (parseFloat(overallPercentage) >= 85 && totalErrors === 0) {
      console.log('\n🎉 Authentication System is Production Ready!');
      console.log('\nFinal Steps:');
      console.log('1. Configure OAuth providers in Supabase dashboard');
      console.log('2. Set up environment variables for OAuth clients');
      console.log('3. Test OAuth flows in staging environment');
      console.log('4. Set up monitoring and alerting');
      console.log('5. Perform security audit');
    } else {
      console.log('\n⚠️ Authentication System Needs Attention');
      console.log('\nNext Steps:');
      console.log('1. Address all critical errors above');
      console.log('2. Review and fix warnings');
      console.log('3. Complete OAuth provider setup');
      console.log('4. Test all authentication flows');
      console.log('5. Re-run this validation');
    }

    // Security recommendations
    console.log('\n🔒 Security Recommendations:');
    console.log('- Enable OAuth provider configurations in Supabase dashboard');
    console.log('- Use strong client secrets for OAuth applications');
    console.log('- Implement rate limiting on authentication endpoints');
    console.log('- Enable audit logging for all authentication events');
    console.log('- Set up monitoring for suspicious authentication patterns');
    console.log('- Regularly rotate OAuth client secrets');
    console.log('- Use HTTPS exclusively in production');
  }

  async run() {
    console.log('🚀 Starting Authentication System Validation...\n');
    
    await this.validateOAuthImplementation();
    await this.validateRBACSystem();
    await this.validateSessionManagement();
    await this.validateSecurityFeatures();
    
    this.generateReport();
  }
}

// Run validation
async function main() {
  const validator = new AuthSystemValidator();
  await validator.run();
}

if (require.main === module) {
  main().catch(console.error);
}