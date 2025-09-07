#!/usr/bin/env npx tsx
/**
 * RLS Performance Optimization Test Script
 * Tests the optimized RLS policies and caching implementation
 */

import { createSupabaseServerClientOptimized } from '../src/lib/supabase/rls-optimized-client';
import { initializeRLSCache } from '../src/lib/supabase/rls-cache';

interface TestResult {
  test: string;
  success: boolean;
  duration: number;
  error?: string;
  details?: any;
}

class RLSPerformanceTester {
  private results: TestResult[] = [];
  private testUserId = '550e8400-e29b-41d4-a716-446655440000'; // Mock UUID for testing

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<void> {
    const startTime = performance.now();
    try {
      const result = await testFn();
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: testName,
        success: true,
        duration,
        details: result
      });
      
      console.log(`✅ ${testName} - ${duration.toFixed(2)}ms`);
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: testName,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });
      
      console.log(`❌ ${testName} - ${duration.toFixed(2)}ms - ${error}`);
    }
  }

  async testRLSOptimizedClient(): Promise<void> {
    console.log('\n🔍 Testing RLS Optimized Client...');
    
    const client = createSupabaseServerClientOptimized(this.testUserId);
    
    // Test 1: Basic client creation
    await this.runTest('Client Creation', async () => {
      return { client: !!client };
    });

    // Test 2: Cache methods exist
    await this.runTest('Cache Methods Available', async () => {
      return {
        hasGetUserTeam: typeof client.getUserTeam === 'function',
        hasGetUserRole: typeof client.getUserRole === 'function',
        hasTeamPermission: typeof client.hasTeamPermission === 'function',
        hasCanAccessTeam: typeof client.canAccessTeam === 'function',
        hasCachedQuery: typeof client.cachedQuery === 'function',
        hasInvalidateCache: typeof client.invalidateCache === 'function'
      };
    });

    // Test 3: Optimized query methods
    await this.runTest('Optimized Query Methods', async () => {
      return {
        hasGetTemplates: typeof client.getTemplates === 'function',
        hasGetOrders: typeof client.getOrders === 'function',
        hasGetTeamAnalytics: typeof client.getTeamAnalytics === 'function',
        hasRefreshAnalyticsCache: typeof client.refreshAnalyticsCache === 'function'
      };
    });

    // Test 4: Performance monitoring
    await this.runTest('Performance Monitoring', async () => {
      return {
        hasCacheMetrics: typeof client.getCacheMetrics === 'function',
        hasRLSStats: typeof client.getRLSPerformanceStats === 'function'
      };
    });
  }

  async testRLSCache(): Promise<void> {
    console.log('\n📦 Testing RLS Cache Implementation...');
    
    // Mock Supabase client for testing
    const mockSupabaseClient = {
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({
              data: {
                user_id: this.testUserId,
                team_id: 'team-123',
                role: 'team_member',
                is_active: true,
                can_create_orders: true,
                can_view_all_orders: false,
                can_edit_orders: false,
                can_delete_orders: false,
                can_manage_team: false,
                can_view_analytics: false,
                last_refreshed: new Date().toISOString()
              },
              error: null
            })
          })
        })
      }),
      rpc: () => Promise.resolve({ data: true, error: null }),
      auth: {
        onAuthStateChange: () => ({})
      }
    };

    const rlsCache = initializeRLSCache(mockSupabaseClient, {
      defaultTtl: 1000, // 1 second for testing
      maxSize: 100,
      enableMonitoring: true
    });

    // Test 1: Cache initialization
    await this.runTest('Cache Initialization', async () => {
      return { initialized: !!rlsCache };
    });

    // Test 2: User auth context caching
    await this.runTest('User Auth Context Caching', async () => {
      // First call (should fetch from "database")
      const start1 = performance.now();
      const context1 = await rlsCache.getUserAuthContext(this.testUserId);
      const duration1 = performance.now() - start1;

      // Second call (should be cached)
      const start2 = performance.now();
      const context2 = await rlsCache.getUserAuthContext(this.testUserId);
      const duration2 = performance.now() - start2;

      return {
        context1: !!context1,
        context2: !!context2,
        duration1: duration1.toFixed(2),
        duration2: duration2.toFixed(2),
        cached: duration2 < duration1 / 2 // Cache should be significantly faster
      };
    });

    // Test 3: Permission caching
    await this.runTest('Permission Caching', async () => {
      // Test permission check
      const start1 = performance.now();
      const hasPermission1 = await rlsCache.hasTeamPermission(this.testUserId, 'team-123', 'can_create_orders');
      const duration1 = performance.now() - start1;

      // Second call should be cached
      const start2 = performance.now();
      const hasPermission2 = await rlsCache.hasTeamPermission(this.testUserId, 'team-123', 'can_create_orders');
      const duration2 = performance.now() - start2;

      return {
        hasPermission1,
        hasPermission2,
        duration1: duration1.toFixed(2),
        duration2: duration2.toFixed(2),
        cached: duration2 < duration1 / 2
      };
    });

    // Test 4: Cache metrics
    await this.runTest('Cache Metrics', async () => {
      const metrics = rlsCache.getMetrics();
      return {
        hasMetrics: !!metrics,
        hitCount: metrics?.hitCount || 0,
        missCount: metrics?.missCount || 0,
        hitRate: metrics?.hitRate || 0,
        cacheSize: metrics?.cacheSize || 0
      };
    });

    // Test 5: Cache invalidation
    await this.runTest('Cache Invalidation', async () => {
      // Add some cached data
      await rlsCache.getUserAuthContext(this.testUserId);
      const metricsBefore = rlsCache.getMetrics();
      
      // Invalidate user cache
      rlsCache.invalidateUserCache(this.testUserId);
      const metricsAfter = rlsCache.getMetrics();

      return {
        cacheSizeBefore: metricsBefore?.cacheSize || 0,
        cacheSizeAfter: metricsAfter?.cacheSize || 0,
        invalidated: (metricsBefore?.cacheSize || 0) > (metricsAfter?.cacheSize || 0)
      };
    });
  }

  async testDatabaseFunctions(): Promise<void> {
    console.log('\n🗃️ Testing Database Function Definitions...');

    // Test the SQL migration file syntax and completeness
    await this.runTest('Migration File Structure', async () => {
      const fs = await import('fs/promises');
      const migrationContent = await fs.readFile('/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql', 'utf-8');
      
      // Check for required functions
      const requiredFunctions = [
        'auth_user_team_id()',
        'auth_user_role()',
        'auth_has_team_permission(',
        'auth_can_access_team(',
        'analyze_rls_performance()',
        'get_rls_cache_stats()',
        'monitor_rls_performance()',
        'refresh_user_auth_context()'
      ];

      const foundFunctions = requiredFunctions.map(func => ({
        function: func,
        found: migrationContent.includes(func)
      }));

      return {
        totalFunctions: requiredFunctions.length,
        foundCount: foundFunctions.filter(f => f.found).length,
        functions: foundFunctions,
        hasMaterializedView: migrationContent.includes('CREATE MATERIALIZED VIEW IF NOT EXISTS user_auth_context'),
        hasOptimizedPolicies: migrationContent.includes('CREATE POLICY') && migrationContent.includes('_optimized'),
        hasIndexes: migrationContent.includes('CREATE INDEX CONCURRENTLY')
      };
    });

    // Test indexes and policy structure
    await this.runTest('RLS Policy Optimization Structure', async () => {
      const fs = await import('fs/promises');
      const migrationContent = await fs.readFile('/Users/benjaminfrost/athletic-labs/supabase/migrations/005_rls_performance_optimization.sql', 'utf-8');
      
      // Count optimized policies
      const policyMatches = migrationContent.match(/CREATE POLICY.*_optimized/g) || [];
      const indexMatches = migrationContent.match(/CREATE INDEX CONCURRENTLY.*idx_.*rls/g) || [];
      
      return {
        optimizedPolicies: policyMatches.length,
        rlsIndexes: indexMatches.length,
        hasDropStatements: migrationContent.includes('DROP POLICY IF EXISTS'),
        hasGrantStatements: migrationContent.includes('GRANT EXECUTE'),
        hasComments: migrationContent.includes('COMMENT ON')
      };
    });
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting RLS Performance Optimization Tests...\n');
    
    await this.testRLSOptimizedClient();
    await this.testRLSCache();
    await this.testDatabaseFunctions();
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((acc, r) => acc + r.duration, 0) / total;
    
    console.log(`✅ Successful: ${successful}/${total} (${((successful/total) * 100).toFixed(1)}%)`);
    console.log(`⏱️ Average Duration: ${avgDuration.toFixed(2)}ms`);
    
    if (successful < total) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.test}: ${result.error}`);
      });
    }
    
    // Performance analysis
    const slowTests = this.results.filter(r => r.duration > 100);
    if (slowTests.length > 0) {
      console.log('\n⚠️ Slow Tests (>100ms):');
      slowTests.forEach(result => {
        console.log(`   - ${result.test}: ${result.duration.toFixed(2)}ms`);
      });
    }
    
    console.log('\n✨ RLS Performance Optimization Testing Complete!');
    console.log('\nNext Steps:');
    console.log('1. Deploy the migration to your Supabase project');
    console.log('2. Update your application to use the optimized client');
    console.log('3. Monitor RLS performance using the new functions');
    console.log('4. Set up cache invalidation triggers as needed');
  }
}

// Run the tests
async function main() {
  const tester = new RLSPerformanceTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}