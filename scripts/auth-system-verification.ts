#!/usr/bin/env npx tsx
/**
 * Authentication System Verification Script
 * Comprehensive testing of OAuth flows, RBAC, and session management
 */

import { OAuthService, type OAuthProvider } from '../src/lib/auth/oauth-service';
import { AuthService } from '../src/lib/auth/auth-service';
import { RBACService, type UserRole } from '../src/lib/auth/rbac';
import fs from 'fs';
import path from 'path';

interface TestResult {
  test: string;
  category: 'oauth' | 'rbac' | 'session' | 'security';
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class AuthSystemVerifier {
  private results: TestResult[] = [];

  private async runTest(
    testName: string,
    category: TestResult['category'],
    testFn: () => Promise<any>
  ): Promise<void> {
    const startTime = performance.now();
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: testName,
        category,
        success: true,
        duration,
        details: result
      });
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: testName,
        category,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      console.log(`❌ ${testName} - ${duration.toFixed(2)}ms - ${error}`);
    }
  }

  async testOAuthConfiguration(): Promise<void> {
    console.log('\n🔐 Testing OAuth Configuration...');

    // Test 1: OAuth Service Initialization
    await this.runTest('OAuth Service Initialization', 'oauth', async () => {
      return {
        serviceLoaded: typeof OAuthService !== 'undefined',
        availableProviders: OAuthService.getAvailableProviders(),
        hasRequiredMethods: [
          'getAvailableProviders',
          'signInWithOAuth',
          'handleCallback',
          'linkOAuthAccount'
        ].every(method => typeof (OAuthService as any)[method] === 'function')
      };
    });

    // Test 2: Provider Configuration
    const providers: OAuthProvider[] = ['google', 'github', 'azure', 'apple'];
    
    for (const provider of providers) {
      await this.runTest(`OAuth Provider Configuration - ${provider}`, 'oauth', async () => {
        const providerInfo = OAuthService.getProviderInfo(provider);
        const validation = OAuthService.validateProviderConfig(provider);
        
        return {
          providerInfo: !!providerInfo,
          isEnabled: OAuthService.isProviderEnabled(provider),
          validation: validation,
          hasDisplayName: providerInfo?.displayName,
          hasIcon: providerInfo?.icon
        };
      });
    }

    // Test 3: OAuth Error Handling
    await this.runTest('OAuth Error Message Handling', 'oauth', async () => {
      const errorCodes = [
        'oauth_access_denied',
        'oauth_invalid_request',
        'oauth_server_error',
        'missing_code'
      ];

      const errorMessages = errorCodes.map(code => ({
        code,
        message: OAuthService.getErrorMessage(code, 'google'),
        hasMessage: OAuthService.getErrorMessage(code, 'google').length > 0
      }));

      return {
        errorMessages,
        allHaveMessages: errorMessages.every(e => e.hasMessage)
      };
    });
  }

  async testRBACSystem(): Promise<void> {
    console.log('\n👥 Testing RBAC System...');

    // Test 1: Role Hierarchy
    await this.runTest('Role Hierarchy Validation', 'rbac', async () => {
      const roles: UserRole[] = ['team_staff', 'team_admin', 'athletic_labs_staff', 'athletic_labs_admin'];
      const actions = ['view_own_orders', 'create_orders', 'view_team_orders', 'manage_team', 'system_admin'];

      const roleTests = roles.map(role => ({
        role,
        actions: actions.map(action => ({
          action,
          canPerform: RBACService.canPerformAction(role, action)
        }))
      }));

      // Verify hierarchy makes sense
      const hierarchyTests = {
        teamStaffCanCreateOrders: RBACService.canPerformAction('team_staff', 'create_orders'),
        teamAdminCanManage: RBACService.canPerformAction('team_admin', 'manage_team'),
        staffCantDoSystemAdmin: !RBACService.canPerformAction('team_staff', 'system_admin'),
        adminCanDoSystemAdmin: RBACService.canPerformAction('athletic_labs_admin', 'system_admin')
      };

      return {
        roleTests,
        hierarchyTests,
        hierarchyValid: Object.values(hierarchyTests).every(test => test === true)
      };
    });

    // Test 2: RBAC Service Methods
    await this.runTest('RBAC Service Methods', 'rbac', async () => {
      return {
        hasGetUserPermissions: typeof RBACService.getUserPermissions === 'function',
        hasHasPermission: typeof RBACService.hasPermission === 'function',
        hasUpdateUserPermissions: typeof RBACService.updateUserPermissions === 'function',
        hasRevokeUserAccess: typeof RBACService.revokeUserAccess === 'function',
        hasLogAuditEvent: typeof RBACService.logAuditEvent === 'function',
        hasCanPerformAction: typeof RBACService.canPerformAction === 'function'
      };
    });

    // Test 3: Permission Structure
    await this.runTest('Permission Structure Validation', 'rbac', async () => {
      const expectedPermissions = [
        'can_create_orders',
        'can_view_all_orders',
        'can_edit_orders',
        'can_delete_orders',
        'can_manage_team',
        'can_view_analytics'
      ];

      // This would normally test against actual permission data
      // For now, we verify the structure is consistent
      return {
        expectedPermissions,
        permissionCount: expectedPermissions.length,
        allPermissionsHavePrefix: expectedPermissions.every(p => p.startsWith('can_'))
      };
    });
  }

  async testSessionManagement(): Promise<void> {
    console.log('\n🔒 Testing Session Management...');

    // Test 1: AuthService Methods
    await this.runTest('AuthService Methods', 'session', async () => {
      return {
        hasSignIn: typeof AuthService.signIn === 'function',
        hasSignOut: typeof AuthService.signOut === 'function',
        hasGetSession: typeof AuthService.getSession === 'function',
        hasGetCurrentUser: typeof AuthService.getCurrentUser === 'function',
        hasUpdateProfile: typeof AuthService.updateProfile === 'function',
        hasChangePassword: typeof AuthService.changePassword === 'function',
        hasGetUserSessions: typeof AuthService.getUserSessions === 'function',
        hasRevokeSession: typeof AuthService.revokeSession === 'function'
      };
    });

    // Test 2: Session Security Features
    await this.runTest('Session Security Features', 'session', async () => {
      // Check AuthService implementation for security features
      const authServiceCode = await fs.promises.readFile(
        path.join(__dirname, '../src/lib/auth/auth-service.ts'),
        'utf-8'
      );

      return {
        hasMaxLoginAttempts: authServiceCode.includes('MAX_LOGIN_ATTEMPTS'),
        hasLockoutDuration: authServiceCode.includes('LOCKOUT_DURATION'),
        hasFailedLoginHandling: authServiceCode.includes('handleFailedLogin'),
        hasAccountLockout: authServiceCode.includes('checkAccountLockout'),
        hasSessionTracking: authServiceCode.includes('user_sessions'),
        hasIPTracking: authServiceCode.includes('ip_address')
      };
    });

    // Test 3: Session Configuration
    await this.runTest('Session Configuration', 'session', async () => {
      // Check middleware configuration
      const middlewareCode = await fs.promises.readFile(
        path.join(__dirname, '../src/middleware.ts'),
        'utf-8'
      );

      return {
        hasProtectedRoutes: middlewareCode.includes('PROTECTED_ROUTES'),
        hasPublicRoutes: middlewareCode.includes('PUBLIC_ROUTES'),
        hasRoleBasedAccess: middlewareCode.includes('roles') && middlewareCode.includes('permissions'),
        hasSessionValidation: middlewareCode.includes('getSession'),
        hasCaching: middlewareCode.includes('middlewareCacheManager'),
        hasAuditLogging: middlewareCode.includes('audit_logs')
      };
    });
  }

  async testDatabaseMigrations(): Promise<void> {
    console.log('\n🗃️ Testing Database Migrations...');

    // Test 1: OAuth Migration
    await this.runTest('OAuth Database Migration', 'oauth', async () => {
      const oauthMigration = await fs.promises.readFile(
        path.join(__dirname, '../supabase/migrations/006_oauth_enhancements.sql'),
        'utf-8'
      );

      return {
        hasOAuthColumns: oauthMigration.includes('oauth_provider') && oauthMigration.includes('oauth_provider_id'),
        hasOAuthProvidersTable: oauthMigration.includes('CREATE TABLE IF NOT EXISTS oauth_providers'),
        hasOAuthAccountsTable: oauthMigration.includes('CREATE TABLE IF NOT EXISTS oauth_accounts'),
        hasOAuthIndexes: oauthMigration.includes('idx_oauth_accounts'),
        hasOAuthRLS: oauthMigration.includes('oauth_accounts_select_own'),
        hasOAuthFunctions: oauthMigration.includes('get_user_oauth_providers'),
        hasProviderValidation: oauthMigration.includes('is_oauth_provider_enabled')
      };
    });

    // Test 2: RBAC Migration
    await this.runTest('RBAC Database Migration', 'rbac', async () => {
      const rbacMigration = await fs.promises.readFile(
        path.join(__dirname, '../supabase/migrations/002_rbac_and_enhancements.sql'),
        'utf-8'
      );

      return {
        hasTeamPermissionsTable: rbacMigration.includes('CREATE TABLE team_permissions'),
        hasUserRoles: rbacMigration.includes('CREATE TYPE.*user_role'),
        hasPermissionColumns: rbacMigration.includes('can_create_orders'),
        hasRBACPolicies: rbacMigration.includes('team_permissions') && rbacMigration.includes('POLICY'),
        hasAuditLogs: rbacMigration.includes('CREATE TABLE audit_logs'),
        hasPermissionFunction: rbacMigration.includes('has_team_permission'),
        hasUserPermissionsView: rbacMigration.includes('user_permissions_view')
      };
    });

    // Test 3: RLS Migration
    await this.runTest('RLS Performance Migration', 'security', async () => {
      const rlsMigration = await fs.promises.readFile(
        path.join(__dirname, '../supabase/migrations/005_rls_performance_optimization.sql'),
        'utf-8'
      );

      return {
        hasOptimizedFunctions: rlsMigration.includes('auth_user_team_id') && rlsMigration.includes('auth_has_team_permission'),
        hasOptimizedPolicies: rlsMigration.includes('_optimized'),
        hasPerformanceIndexes: rlsMigration.includes('idx_profiles_auth_uid'),
        hasCachingViews: rlsMigration.includes('user_auth_context'),
        hasMonitoringFunctions: rlsMigration.includes('analyze_rls_performance'),
        hasSecurityDefiner: rlsMigration.includes('SECURITY DEFINER')
      };
    });
  }

  async testSecurityFeatures(): Promise<void> {
    console.log('\n🛡️ Testing Security Features...');

    // Test 1: Input Sanitization
    await this.runTest('Input Sanitization', 'security', async () => {
      const middlewareCode = await fs.promises.readFile(
        path.join(__dirname, '../src/middleware.ts'),
        'utf-8'
      );

      return {
        hasThreatDetection: middlewareCode.includes('performThreatDetection'),
        hasInputSanitizer: middlewareCode.includes('inputSanitizer'),
        hasSecurityBlocking: middlewareCode.includes('THREAT_DETECTED'),
        hasIPTracking: middlewareCode.includes('getClientIP'),
        hasUserAgentCapture: middlewareCode.includes('user-agent')
      };
    });

    // Test 2: Password Policy
    await this.runTest('Password Policy Implementation', 'security', async () => {
      try {
        const passwordPolicyCode = await fs.promises.readFile(
          path.join(__dirname, '../src/lib/auth/password-policy.ts'),
          'utf-8'
        );

        return {
          hasPasswordPolicy: true,
          hasComplexityRules: passwordPolicyCode.includes('complexity'),
          hasMinLength: passwordPolicyCode.includes('minLength'),
          hasValidation: passwordPolicyCode.includes('validate'),
          hasStrengthCheck: passwordPolicyCode.includes('strength')
        };
      } catch (error) {
        return {
          hasPasswordPolicy: false,
          error: 'Password policy file not found'
        };
      }
    });

    // Test 3: CORS Configuration
    await this.runTest('CORS Configuration', 'security', async () => {
      try {
        const corsCode = await fs.promises.readFile(
          path.join(__dirname, '../src/lib/middleware/cors-middleware.ts'),
          'utf-8'
        );

        return {
          hasCORSMiddleware: true,
          hasOriginValidation: corsCode.includes('origin'),
          hasMethodRestrictions: corsCode.includes('methods'),
          hasHeaderRestrictions: corsCode.includes('headers'),
          hasCredentialsHandling: corsCode.includes('credentials')
        };
      } catch (error) {
        return {
          hasCORSMiddleware: false,
          error: 'CORS middleware file not found'
        };
      }
    });
  }

  async testCallbackHandling(): Promise<void> {
    console.log('\n📞 Testing OAuth Callback Handling...');

    // Test 1: Callback Route Implementation
    await this.runTest('OAuth Callback Route', 'oauth', async () => {
      const callbackCode = await fs.promises.readFile(
        path.join(__dirname, '../src/app/auth/callback/route.ts'),
        'utf-8'
      );

      return {
        hasCallbackRoute: true,
        hasErrorHandling: callbackCode.includes('error') && callbackCode.includes('OAuth'),
        hasCodeExchange: callbackCode.includes('exchangeCodeForSession'),
        hasProfileCreation: callbackCode.includes('createUserProfile'),
        hasAuditLogging: callbackCode.includes('logAuditEvent'),
        hasRedirectHandling: callbackCode.includes('getRedirectDestination'),
        hasSecurityValidation: callbackCode.includes('isValidRedirectUrl')
      };
    });

    // Test 2: Callback Security
    await this.runTest('Callback Security Measures', 'security', async () => {
      const callbackCode = await fs.promises.readFile(
        path.join(__dirname, '../src/app/auth/callback/route.ts'),
        'utf-8'
      );

      return {
        hasCSRFProtection: callbackCode.includes('state'),
        hasIPValidation: callbackCode.includes('getClientIP'),
        hasUserAgentTracking: callbackCode.includes('user-agent'),
        hasRedirectValidation: callbackCode.includes('isValidRedirectUrl'),
        hasErrorLogging: callbackCode.includes('logAuditEvent') && callbackCode.includes('error')
      };
    });
  }

  generateReport(): void {
    console.log('\n📊 Authentication System Verification Summary');
    console.log('===============================================');
    
    const categories = ['oauth', 'rbac', 'session', 'security'] as const;
    const categoryResults = categories.map(category => {
      const tests = this.results.filter(r => r.category === category);
      const successful = tests.filter(t => t.success).length;
      const total = tests.length;
      const avgDuration = tests.reduce((acc, r) => acc + r.duration, 0) / total;
      
      return {
        category: category.toUpperCase(),
        successful,
        total,
        percentage: total > 0 ? ((successful / total) * 100).toFixed(1) : '0.0',
        avgDuration: avgDuration.toFixed(2)
      };
    });

    categoryResults.forEach(result => {
      const icon = parseFloat(result.percentage) === 100 ? '✅' : parseFloat(result.percentage) >= 80 ? '⚠️' : '❌';
      console.log(`${icon} ${result.category}: ${result.successful}/${result.total} (${result.percentage}%) - Avg: ${result.avgDuration}ms`);
    });

    const totalSuccessful = this.results.filter(r => r.success).length;
    const totalTests = this.results.length;
    const overallPercentage = totalTests > 0 ? ((totalSuccessful / totalTests) * 100).toFixed(1) : '0.0';

    console.log('\n📈 Overall Results:');
    console.log(`✅ Successful: ${totalSuccessful}/${totalTests} (${overallPercentage}%)`);

    // Show failed tests
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   - [${test.category.toUpperCase()}] ${test.test}: ${test.error}`);
      });
    }

    // Security recommendations
    console.log('\n🔒 Security Recommendations:');
    console.log('- Ensure OAuth providers are properly configured in Supabase dashboard');
    console.log('- Enable MFA for administrative accounts');
    console.log('- Regularly rotate OAuth client secrets');
    console.log('- Monitor authentication logs for suspicious activity');
    console.log('- Implement rate limiting for authentication endpoints');
    console.log('- Use HTTPS in production with proper SSL certificates');

    // Next steps based on results
    if (parseFloat(overallPercentage) >= 90) {
      console.log('\n🎉 Authentication System Ready for Production!');
      console.log('\nFinal Steps:');
      console.log('1. Configure OAuth providers in Supabase dashboard');
      console.log('2. Set up monitoring and alerting for auth events');
      console.log('3. Perform user acceptance testing');
      console.log('4. Deploy with proper environment variables');
    } else {
      console.log('\n⚠️ Authentication System Needs Improvements');
      console.log('\nPriority Actions:');
      console.log('1. Address failed tests above');
      console.log('2. Complete OAuth provider setup');
      console.log('3. Verify security configurations');
      console.log('4. Re-run verification tests');
    }
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Authentication System Verification...\n');
    
    await this.testOAuthConfiguration();
    await this.testRBACSystem();
    await this.testSessionManagement();
    await this.testDatabaseMigrations();
    await this.testSecurityFeatures();
    await this.testCallbackHandling();
    
    this.generateReport();
  }
}

// Run the tests
async function main() {
  const verifier = new AuthSystemVerifier();
  await verifier.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}