#!/usr/bin/env node

/**
 * Test middleware authentication flow
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testMiddlewareFlow() {
  try {
    console.log('🔐 Testing middleware authentication flow...');
    
    // Simulate login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@athleticlabs.com',
      password: 'TestPass123!'
    });

    if (authError) {
      throw new Error(`Auth failed: ${authError.message}`);
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user?.id);

    // Test the same query that middleware uses
    console.log('\n🔍 Testing middleware profile query...');
    
    const startTime = Date.now();
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        team_id,
        is_active,
        teams:team_id (
          id,
          name,
          is_active
        )
      `)
      .eq('id', authData.user.id)
      .single();
    
    const queryTime = Date.now() - startTime;
    
    console.log(`Query took: ${queryTime}ms`);

    if (profileError) {
      console.error('❌ Profile error (this would cause redirect to login):', profileError);
      
      // Test simpler query
      console.log('\n🔄 Testing simpler profile query...');
      const { data: simpleProfile, error: simpleError } = await supabase
        .from('profiles')
        .select('id, role, team_id, is_active')
        .eq('id', authData.user.id)
        .single();
      
      if (simpleError) {
        console.error('❌ Simple profile error:', simpleError);
      } else {
        console.log('✅ Simple profile query successful:', simpleProfile);
        
        // Test team query separately
        if (simpleProfile.team_id) {
          console.log('\n🏈 Testing separate team query...');
          const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, name, is_active')
            .eq('id', simpleProfile.team_id)
            .single();
          
          if (teamError) {
            console.error('❌ Team query error:', teamError);
          } else {
            console.log('✅ Team query successful:', team);
          }
        }
      }
    } else {
      console.log('✅ Profile query successful:', profile);
      console.log('Profile check results:', {
        hasProfile: !!profile,
        isActive: profile?.is_active,
        hasTeam: !!profile?.team_id,
        teamActive: profile?.teams?.is_active
      });
    }

    // Test session persistence
    console.log('\n🍪 Testing session persistence...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Session persistence issue:', sessionError);
    } else {
      console.log('✅ Session persists:', {
        hasUser: !!session.user,
        expiresAt: new Date(session.expires_at * 1000).toISOString()
      });
    }

    await supabase.auth.signOut();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMiddlewareFlow();