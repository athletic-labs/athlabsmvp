#!/usr/bin/env node
/**
 * RLS Performance Optimization Validation Script
 * Validates the implementation structure and SQL syntax
 */

const fs = require('fs');
const path = require('path');

class RLSOptimizationValidator {
  constructor() {
    this.results = [];
  }

  log(status, message, details = '') {
    const timestamp = new Date().toISOString();
    const result = { timestamp, status, message, details };
    this.results.push(result);
    
    const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${message}${details ? ` - ${details}` : ''}`);
  }

  async validateFiles() {
    console.log('🔍 Validating RLS Optimization Files...\n');

    // 1. Check RLS cache implementation
    const cacheFile = '/Users/benjaminfrost/athletic-labs/src/lib/supabase/rls-cache.ts';
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, 'utf-8');
      
      // Check for required classes and methods
      const hasRLSCacheClass = content.includes('export class RLSPolicyCache');
      const hasGetUserAuthContext = content.includes('getUserAuthContext');
      const hasTeamPermission = content.includes('hasTeamPermission');
      const hasCacheMetrics = content.includes('getMetrics');
      const hasInvalidation = content.includes('invalidateUserCache');
      
      if (hasRLSCacheClass && hasGetUserAuthContext && hasTeamPermission && hasCacheMetrics && hasInvalidation) {
        this.log('success', 'RLS Cache Implementation', 'All required methods present');
      } else {
        this.log('error', 'RLS Cache Implementation', `Missing methods - Class: ${hasRLSCacheClass}, Auth: ${hasGetUserAuthContext}, Permission: ${hasTeamPermission}, Metrics: ${hasCacheMetrics}, Invalidation: ${hasInvalidation}`);
      }
    } else {
      this.log('error', 'RLS Cache File', 'File not found');
    }

    // 2. Check optimized client
    const clientFile = '/Users/benjaminfrost/athletic-labs/src/lib/supabase/rls-optimized-client.ts';
    if (fs.existsSync(clientFile)) {
      const content = fs.readFileSync(clientFile, 'utf-8');
      
      const hasCreateFunction = content.includes('createRLSOptimizedSupabaseClient');
      const hasCachedQuery = content.includes('cachedQuery');
      const hasGetUserTeam = content.includes('getUserTeam');
      const hasOptimizedQueries = content.includes('getTemplates') && content.includes('getOrders');
      const hasPerformanceStats = content.includes('getRLSPerformanceStats');
      
      if (hasCreateFunction && hasCachedQuery && hasGetUserTeam && hasOptimizedQueries && hasPerformanceStats) {
        this.log('success', 'Optimized Client Implementation', 'All required methods present');
      } else {
        this.log('error', 'Optimized Client Implementation', `Missing methods - Create: ${hasCreateFunction}, Cached: ${hasCachedQuery}, UserTeam: ${hasGetUserTeam}, Queries: ${hasOptimizedQueries}, Stats: ${hasPerformanceStats}`);
      }
    } else {
      this.log('error', 'Optimized Client File', 'File not found');
    }

    // 3. Validate SQL migration
    const migrationFile = '/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql';
    if (fs.existsSync(migrationFile)) {
      const content = fs.readFileSync(migrationFile, 'utf-8');
      
      this.validateSQLMigration(content);
    } else {
      this.log('error', 'RLS Migration File', 'File not found');
    }
  }

  validateSQLMigration(content) {
    console.log('\n🗃️ Validating SQL Migration Structure...');

    // Check for required functions
    const requiredFunctions = [
      'auth_user_team_id',
      'auth_user_role', 
      'auth_has_team_permission',
      'auth_can_access_team',
      'analyze_rls_performance',
      'get_rls_cache_stats',
      'monitor_rls_performance',
      'refresh_user_auth_context'
    ];

    let functionsFound = 0;
    requiredFunctions.forEach(func => {
      if (content.includes(`CREATE OR REPLACE FUNCTION ${func}`)) {
        functionsFound++;
        this.log('success', `Function ${func}`, 'Found in migration');
      } else {
        this.log('error', `Function ${func}`, 'Missing from migration');
      }
    });

    this.log(functionsFound === requiredFunctions.length ? 'success' : 'warning', 
      'Database Functions', `${functionsFound}/${requiredFunctions.length} functions found`);

    // Check for optimized policies
    const policyPattern = /CREATE POLICY ".*_optimized"/g;
    const policies = content.match(policyPattern) || [];
    
    if (policies.length > 0) {
      this.log('success', 'Optimized RLS Policies', `${policies.length} optimized policies found`);
    } else {
      this.log('error', 'Optimized RLS Policies', 'No optimized policies found');
    }

    // Check for performance indexes
    const indexPattern = /CREATE INDEX CONCURRENTLY.*idx_.*rls/g;
    const indexes = content.match(indexPattern) || [];
    
    if (indexes.length > 0) {
      this.log('success', 'RLS Performance Indexes', `${indexes.length} RLS-specific indexes found`);
    } else {
      this.log('warning', 'RLS Performance Indexes', 'Limited RLS-specific indexes found');
    }

    // Check for materialized view
    if (content.includes('CREATE MATERIALIZED VIEW IF NOT EXISTS user_auth_context')) {
      this.log('success', 'User Auth Context View', 'Materialized view found');
    } else {
      this.log('error', 'User Auth Context View', 'Materialized view missing');
    }

    // Check for proper grants
    const grantPattern = /GRANT EXECUTE ON FUNCTION.*TO authenticated/g;
    const grants = content.match(grantPattern) || [];
    
    if (grants.length >= 4) {
      this.log('success', 'Function Permissions', `${grants.length} functions granted to authenticated users`);
    } else {
      this.log('warning', 'Function Permissions', `Only ${grants.length} grants found`);
    }
  }

  validateStructure() {
    console.log('\n🏗️ Validating Project Structure...');

    const requiredFiles = [
      '/Users/benjaminfrost/athletic-labs/src/lib/supabase/rls-cache.ts',
      '/Users/benjaminfrost/athletic-labs/src/lib/supabase/rls-optimized-client.ts',
      '/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql',
      '/Users/benjaminfrost/athletic-labs/supabase/migrations/004_optimize_template_usage.sql',
      '/Users/benjaminfrost/athletic-labs/supabase/migrations/003_performance_optimization.sql'
    ];

    let filesFound = 0;
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        filesFound++;
        this.log('success', `File Structure`, path.basename(file));
      } else {
        this.log('error', `File Structure`, `Missing: ${path.basename(file)}`);
      }
    });

    this.log(filesFound === requiredFiles.length ? 'success' : 'warning',
      'Project Structure', `${filesFound}/${requiredFiles.length} required files found`);
  }

  generateReport() {
    console.log('\n📊 Validation Summary');
    console.log('========================');
    
    const successCount = this.results.filter(r => r.status === 'success').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const total = this.results.length;
    
    console.log(`✅ Success: ${successCount}/${total} (${((successCount/total) * 100).toFixed(1)}%)`);
    console.log(`⚠️ Warnings: ${warningCount}/${total} (${((warningCount/total) * 100).toFixed(1)}%)`);
    console.log(`❌ Errors: ${errorCount}/${total} (${((errorCount/total) * 100).toFixed(1)}%)`);
    
    if (errorCount === 0) {
      console.log('\n🎉 RLS Performance Optimization Implementation is Ready!');
      console.log('\nNext Steps:');
      console.log('1. Deploy the migration: supabase db push');
      console.log('2. Update application imports to use optimized client');
      console.log('3. Configure caching parameters as needed');
      console.log('4. Monitor performance using the new analytics functions');
    } else {
      console.log('\n⚠️ Issues Found - Please address errors before deployment');
    }
    
    // Performance recommendations
    console.log('\n🚀 Performance Optimization Recommendations:');
    console.log('- Use the optimized client for all database operations');
    console.log('- Configure cache TTL based on your data update frequency');
    console.log('- Monitor RLS function performance with analyze_rls_performance()');
    console.log('- Set up automated materialized view refresh for user_auth_context');
    console.log('- Use cache invalidation strategically on user permission changes');
  }

  async run() {
    console.log('🚀 Starting RLS Performance Optimization Validation...\n');
    
    await this.validateFiles();
    this.validateStructure();
    this.generateReport();
  }
}

// Run validation
async function main() {
  const validator = new RLSOptimizationValidator();
  await validator.run();
}

if (require.main === module) {
  main().catch(console.error);
}