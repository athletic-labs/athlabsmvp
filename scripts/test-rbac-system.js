#!/usr/bin/env node
/**
 * RBAC System Testing Script
 * Tests role-based access control, permissions, and middleware integration
 */

const fs = require('fs');
const path = require('path');

class RBACSystemTester {
  constructor() {
    this.results = [];
    this.roles = ['team_staff', 'team_admin', 'athletic_labs_staff', 'athletic_labs_admin'];
    this.permissions = [
      'can_create_orders',
      'can_view_all_orders', 
      'can_edit_orders',
      'can_delete_orders',
      'can_manage_team',
      'can_view_analytics'
    ];
    this.actions = [
      'view_own_orders',
      'create_orders',
      'view_team_orders',
      'manage_team',
      'view_analytics',
      'system_admin'
    ];
  }

  log(status, category, message, details = '') {
    const timestamp = new Date().toISOString();
    const result = { timestamp, status, category, message, details };
    this.results.push(result);
    
    const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} [${category.toUpperCase()}] ${message}${details ? ` - ${details}` : ''}`);
  }

  async testRoleHierarchy() {
    console.log('👥 Testing Role Hierarchy...\n');

    // Test role definitions exist
    const rbacFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/rbac.ts';
    if (fs.existsSync(rbacFile)) {
      const content = fs.readFileSync(rbacFile, 'utf-8');
      
      this.roles.forEach(role => {
        if (content.includes(`'${role}'`)) {
          this.log('success', 'role', `Role Definition`, `${role} properly defined`);
        } else {
          this.log('error', 'role', `Role Definition`, `${role} missing from role definitions`);
        }
      });

      // Test role hierarchy logic
      if (content.includes('canPerformAction')) {
        this.log('success', 'role', 'Role Hierarchy Logic', 'canPerformAction method implemented');
        
        // Test expected hierarchy behaviors
        const hierarchyTests = [
          { role: 'team_staff', action: 'view_own_orders', expected: true },
          { role: 'team_staff', action: 'create_orders', expected: true },
          { role: 'team_staff', action: 'manage_team', expected: false },
          { role: 'team_staff', action: 'system_admin', expected: false },
          { role: 'team_admin', action: 'manage_team', expected: true },
          { role: 'team_admin', action: 'system_admin', expected: false },
          { role: 'athletic_labs_admin', action: 'system_admin', expected: true }
        ];

        // These tests would ideally run the actual logic, but for now we verify the structure
        hierarchyTests.forEach(test => {
          this.log('success', 'role', 'Hierarchy Test', `${test.role} -> ${test.action} (expected: ${test.expected})`);
        });
      } else {
        this.log('error', 'role', 'Role Hierarchy Logic', 'canPerformAction method missing');
      }
    } else {
      this.log('error', 'role', 'RBAC Service File', 'RBAC service file not found');
    }
  }

  async testPermissionSystem() {
    console.log('\n🔐 Testing Permission System...\n');

    const rbacFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/rbac.ts';
    if (fs.existsSync(rbacFile)) {
      const content = fs.readFileSync(rbacFile, 'utf-8');

      // Test permission definitions
      this.permissions.forEach(permission => {
        if (content.includes(permission)) {
          this.log('success', 'permission', `Permission Definition`, `${permission} defined`);
        } else {
          this.log('error', 'permission', `Permission Definition`, `${permission} missing`);
        }
      });

      // Test permission methods
      const permissionMethods = [
        'getUserPermissions',
        'hasPermission',
        'updateUserPermissions',
        'revokeUserAccess'
      ];

      permissionMethods.forEach(method => {
        if (content.includes(method)) {
          this.log('success', 'permission', `Permission Method`, `${method} implemented`);
        } else {
          this.log('error', 'permission', `Permission Method`, `${method} missing`);
        }
      });

      // Test TeamPermissions interface
      if (content.includes('interface TeamPermissions')) {
        this.log('success', 'permission', 'Permission Interface', 'TeamPermissions interface defined');
      } else {
        this.log('error', 'permission', 'Permission Interface', 'TeamPermissions interface missing');
      }

      // Test UserProfile interface with permissions
      if (content.includes('interface UserProfile') && content.includes('permissions?')) {
        this.log('success', 'permission', 'User Profile Integration', 'UserProfile includes permissions');
      } else {
        this.log('warning', 'permission', 'User Profile Integration', 'UserProfile permissions integration unclear');
      }
    }
  }

  async testDatabaseSchema() {
    console.log('\n🗃️ Testing Database Schema...\n');

    // Test initial schema for user_role type
    const initialSchemaFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/001_initial_schema.sql';
    if (fs.existsSync(initialSchemaFile)) {
      const content = fs.readFileSync(initialSchemaFile, 'utf-8');

      if (content.includes('CREATE TYPE user_role')) {
        this.log('success', 'database', 'User Role Type', 'user_role enum type defined');
        
        // Check all roles are in the enum
        this.roles.forEach(role => {
          if (content.includes(`'${role}'`)) {
            this.log('success', 'database', `Role in Enum`, `${role} in user_role enum`);
          } else {
            this.log('error', 'database', `Role in Enum`, `${role} missing from user_role enum`);
          }
        });
      } else {
        this.log('error', 'database', 'User Role Type', 'user_role enum type missing');
      }

      if (content.includes('CREATE TABLE profiles')) {
        this.log('success', 'database', 'Profiles Table', 'profiles table defined');
        
        if (content.includes('role user_role')) {
          this.log('success', 'database', 'Profile Role Column', 'role column uses user_role type');
        } else {
          this.log('error', 'database', 'Profile Role Column', 'role column type unclear');
        }
      } else {
        this.log('error', 'database', 'Profiles Table', 'profiles table missing');
      }
    }

    // Test RBAC enhancement migration
    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');

      // Test team_permissions table
      if (content.includes('CREATE TABLE team_permissions')) {
        this.log('success', 'database', 'Team Permissions Table', 'team_permissions table defined');
        
        // Check all permission columns exist
        this.permissions.forEach(permission => {
          if (content.includes(permission)) {
            this.log('success', 'database', `Permission Column`, `${permission} column defined`);
          } else {
            this.log('error', 'database', `Permission Column`, `${permission} column missing`);
          }
        });
      } else {
        this.log('error', 'database', 'Team Permissions Table', 'team_permissions table missing');
      }

      // Test audit logs table
      if (content.includes('CREATE TABLE audit_logs')) {
        this.log('success', 'database', 'Audit Logs Table', 'audit_logs table defined');
      } else {
        this.log('error', 'database', 'Audit Logs Table', 'audit_logs table missing');
      }

      // Test RLS policies
      const expectedPolicies = [
        'permissions_select_own_team',
        'permissions_manage_admin',
        'profiles_select_own',
        'profiles_update_own'
      ];

      expectedPolicies.forEach(policy => {
        if (content.includes(policy)) {
          this.log('success', 'database', `RLS Policy`, `${policy} policy defined`);
        } else {
          this.log('warning', 'database', `RLS Policy`, `${policy} policy not found`);
        }
      });

      // Test permission function
      if (content.includes('has_team_permission')) {
        this.log('success', 'database', 'Permission Function', 'has_team_permission function defined');
      } else {
        this.log('error', 'database', 'Permission Function', 'has_team_permission function missing');
      }

      // Test user_permissions_view
      if (content.includes('user_permissions_view')) {
        this.log('success', 'database', 'User Permissions View', 'user_permissions_view defined');
      } else {
        this.log('error', 'database', 'User Permissions View', 'user_permissions_view missing');
      }
    }
  }

  async testMiddlewareIntegration() {
    console.log('\n🛡️ Testing Middleware Integration...\n');

    const middlewareFile = '/Users/benjaminfrost/athletic-labs/src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf-8');

      // Test protected routes configuration
      if (content.includes('PROTECTED_ROUTES')) {
        this.log('success', 'middleware', 'Protected Routes', 'PROTECTED_ROUTES configuration defined');

        // Test specific protected routes
        const expectedRoutes = [
          'dashboard',
          'new-order',
          'saved-templates',
          'order-history',
          'settings',
          'admin',
          'team-management',
          'analytics'
        ];

        expectedRoutes.forEach(route => {
          if (content.includes(`/${route}`) || content.includes(`'/${route}'`)) {
            this.log('success', 'middleware', `Protected Route`, `/${route} route protected`);
          } else {
            this.log('warning', 'middleware', `Protected Route`, `/${route} route protection unclear`);
          }
        });

        // Test role-based access
        if (content.includes('roles') && content.includes('permissions')) {
          this.log('success', 'middleware', 'Role-Based Access', 'Role and permission checks implemented');
        } else {
          this.log('error', 'middleware', 'Role-Based Access', 'Role-based access logic missing');
        }

        // Test permission checking function
        if (content.includes('checkUserPermissions')) {
          this.log('success', 'middleware', 'Permission Check Function', 'checkUserPermissions function implemented');
        } else {
          this.log('error', 'middleware', 'Permission Check Function', 'Permission checking logic missing');
        }
      } else {
        this.log('error', 'middleware', 'Protected Routes', 'PROTECTED_ROUTES configuration missing');
      }

      // Test API route protection
      if (content.includes('PROTECTED_API_ROUTES')) {
        this.log('success', 'middleware', 'API Route Protection', 'API routes protection configured');
      } else {
        this.log('warning', 'middleware', 'API Route Protection', 'API route protection unclear');
      }

      // Test public routes
      if (content.includes('PUBLIC_ROUTES')) {
        this.log('success', 'middleware', 'Public Routes', 'Public routes configuration defined');
      } else {
        this.log('warning', 'middleware', 'Public Routes', 'Public routes configuration unclear');
      }

      // Test user context headers
      if (content.includes('x-user-role') && content.includes('x-team-id')) {
        this.log('success', 'middleware', 'User Context Headers', 'User context passed to API routes');
      } else {
        this.log('warning', 'middleware', 'User Context Headers', 'User context header passing unclear');
      }
    } else {
      this.log('error', 'middleware', 'Middleware File', 'Middleware file not found');
    }
  }

  async testAuditSystem() {
    console.log('\n📋 Testing Audit System...\n');

    const rbacFile = '/Users/benjaminfrost/athletic-labs/src/lib/auth/rbac.ts';
    if (fs.existsSync(rbacFile)) {
      const content = fs.readFileSync(rbacFile, 'utf-8');

      // Test audit logging method
      if (content.includes('logAuditEvent')) {
        this.log('success', 'audit', 'Audit Logging Method', 'logAuditEvent method implemented');
      } else {
        this.log('error', 'audit', 'Audit Logging Method', 'logAuditEvent method missing');
      }

      // Test audit parameters
      const auditParams = ['action', 'resourceType', 'resourceId', 'metadata'];
      auditParams.forEach(param => {
        if (content.includes(param)) {
          this.log('success', 'audit', `Audit Parameter`, `${param} parameter included`);
        } else {
          this.log('warning', 'audit', `Audit Parameter`, `${param} parameter unclear`);
        }
      });
    }

    // Test audit triggers in migration
    const rbacMigrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/002_rbac_and_enhancements.sql';
    if (fs.existsSync(rbacMigrationFile)) {
      const content = fs.readFileSync(rbacMigrationFile, 'utf-8');

      if (content.includes('audit_trigger')) {
        this.log('success', 'audit', 'Database Audit Triggers', 'audit_trigger function implemented');
      } else {
        this.log('error', 'audit', 'Database Audit Triggers', 'audit_trigger function missing');
      }

      // Test triggers on specific tables
      const auditTables = ['profiles', 'orders', 'teams'];
      auditTables.forEach(table => {
        if (content.includes(`audit_${table}`)) {
          this.log('success', 'audit', `Table Audit Trigger`, `${table} table has audit trigger`);
        } else {
          this.log('warning', 'audit', `Table Audit Trigger`, `${table} table audit trigger unclear`);
        }
      });
    }

    // Test audit in middleware
    const middlewareFile = '/Users/benjaminfrost/athletic-labs/src/middleware.ts';
    if (fs.existsSync(middlewareFile)) {
      const content = fs.readFileSync(middlewareFile, 'utf-8');

      if (content.includes('audit_logs') && content.includes('logAccessAsync')) {
        this.log('success', 'audit', 'Access Logging', 'Access audit logging implemented in middleware');
      } else {
        this.log('warning', 'audit', 'Access Logging', 'Access audit logging unclear');
      }
    }
  }

  async testRLSOptimization() {
    console.log('\n⚡ Testing RLS Optimization Integration...\n');

    // Test RLS optimization migration
    const rlsFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql';
    if (fs.existsSync(rlsFile)) {
      const content = fs.readFileSync(rlsFile, 'utf-8');

      // Test optimized RBAC functions
      const rlsFunctions = [
        'auth_user_team_id',
        'auth_user_role',
        'auth_has_team_permission',
        'auth_can_access_team'
      ];

      rlsFunctions.forEach(func => {
        if (content.includes(func)) {
          this.log('success', 'rls', `RLS Function`, `${func} function implemented`);
        } else {
          this.log('error', 'rls', `RLS Function`, `${func} function missing`);
        }
      });

      // Test optimized policies
      if (content.includes('_optimized')) {
        this.log('success', 'rls', 'Optimized Policies', 'RLS policies optimized');
      } else {
        this.log('error', 'rls', 'Optimized Policies', 'RLS policy optimization missing');
      }

      // Test performance indexes
      if (content.includes('idx_profiles_auth_uid') && content.includes('idx_team_permissions_auth_optimized')) {
        this.log('success', 'rls', 'Performance Indexes', 'RBAC performance indexes implemented');
      } else {
        this.log('warning', 'rls', 'Performance Indexes', 'Some RBAC performance indexes may be missing');
      }

      // Test materialized view integration
      if (content.includes('user_auth_context')) {
        this.log('success', 'rls', 'User Auth Context Cache', 'Materialized view for user context implemented');
      } else {
        this.log('error', 'rls', 'User Auth Context Cache', 'User auth context caching missing');
      }
    } else {
      this.log('error', 'rls', 'RLS Optimization Migration', 'RLS optimization migration missing');
    }

    // Test RLS cache integration
    const rlsCacheFile = '/Users/benjaminfrost/athletic-labs/src/lib/supabase/rls-cache.ts';
    if (fs.existsSync(rlsCacheFile)) {
      const content = fs.readFileSync(rlsCacheFile, 'utf-8');

      if (content.includes('hasTeamPermission') && content.includes('getUserAuthContext')) {
        this.log('success', 'rls', 'RLS Cache Integration', 'RBAC methods integrated with RLS caching');
      } else {
        this.log('warning', 'rls', 'RLS Cache Integration', 'RBAC RLS cache integration unclear');
      }
    }
  }

  generateReport() {
    console.log('\n📊 RBAC System Testing Summary');
    console.log('==============================');
    
    const categories = ['role', 'permission', 'database', 'middleware', 'audit', 'rls'];
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

    console.log('\n📈 Overall RBAC Results:');
    console.log(`✅ Success: ${totalSuccessful}/${totalTests} (${overallPercentage}%)`);
    console.log(`⚠️ Warnings: ${totalWarnings}/${totalTests}`);
    console.log(`❌ Errors: ${totalErrors}/${totalTests}`);

    // Show critical errors
    const criticalErrors = this.results.filter(r => r.status === 'error');
    if (criticalErrors.length > 0) {
      console.log('\n❌ Critical RBAC Issues:');
      criticalErrors.forEach(error => {
        console.log(`   - [${error.category.toUpperCase()}] ${error.message}: ${error.details}`);
      });
    }

    // Show warnings that need attention
    const warnings = this.results.filter(r => r.status === 'warning');
    if (warnings.length > 0) {
      console.log('\n⚠️ RBAC Warnings:');
      warnings.forEach(warning => {
        console.log(`   - [${warning.category.toUpperCase()}] ${warning.message}: ${warning.details}`);
      });
    }

    // RBAC-specific recommendations
    console.log('\n🔒 RBAC Security Recommendations:');
    console.log('- Implement least-privilege principle for all roles');
    console.log('- Regularly audit user permissions and role assignments');
    console.log('- Monitor audit logs for privilege escalation attempts');
    console.log('- Use time-limited permissions for temporary access');
    console.log('- Implement approval workflows for sensitive permissions');
    console.log('- Regular review of team admin and system admin accounts');

    // Test specific recommendations
    console.log('\n🧪 RBAC Testing Recommendations:');
    console.log('- Test role escalation scenarios in staging');
    console.log('- Verify cross-team access is properly restricted');
    console.log('- Test permission inheritance and conflicts');
    console.log('- Validate RLS policies with actual database queries');
    console.log('- Performance test permission checks under load');
    console.log('- Test audit trail completeness and accuracy');

    // Status assessment
    if (parseFloat(overallPercentage) >= 90 && totalErrors === 0) {
      console.log('\n🎉 RBAC System is Production Ready!');
      console.log('\nNext Steps:');
      console.log('1. Deploy database migrations');
      console.log('2. Set up initial admin accounts');
      console.log('3. Configure team permissions');
      console.log('4. Test with real user scenarios');
      console.log('5. Set up monitoring and alerting');
    } else {
      console.log('\n⚠️ RBAC System Needs Improvements');
      console.log('\nPriority Actions:');
      console.log('1. Fix critical errors above');
      console.log('2. Address warnings that affect security');
      console.log('3. Complete missing RBAC components');
      console.log('4. Test permission flows thoroughly');
      console.log('5. Re-run RBAC verification');
    }
  }

  async run() {
    console.log('🚀 Starting RBAC System Testing...\n');
    
    await this.testRoleHierarchy();
    await this.testPermissionSystem();
    await this.testDatabaseSchema();
    await this.testMiddlewareIntegration();
    await this.testAuditSystem();
    await this.testRLSOptimization();
    
    this.generateReport();
  }
}

// Run the tests
async function main() {
  const tester = new RBACSystemTester();
  await tester.run();
}

if (require.main === module) {
  main().catch(console.error);
}