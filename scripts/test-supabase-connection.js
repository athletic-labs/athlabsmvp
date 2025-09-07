#!/usr/bin/env node

/**
 * Test Supabase connection and authentication
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Supabase connection...');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Anon Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    // Test 1: Basic connection
    console.log('\n📡 Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Basic connection failed:', error.message);
      return;
    }
    console.log('✅ Basic connection successful');

    // Test 2: Authentication test
    console.log('\n🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@athleticlabs.com',
      password: 'TestPass123!'
    });

    if (authError) {
      console.error('❌ Authentication failed:', authError.message);
      if (authError.message.includes('fetch')) {
        console.error('🔍 This looks like a network connectivity issue');
        console.error('   - Check if Supabase URL is accessible');
        console.error('   - Verify API keys are correct');
        console.error('   - Check network/firewall settings');
      }
      return;
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);

    // Test 3: Sign out
    console.log('\n🚪 Testing sign out...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('❌ Sign out failed:', signOutError.message);
    } else {
      console.log('✅ Sign out successful');
    }

  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    
    if (error.message.includes('fetch') || error.message.includes('network')) {
      console.error('\n🔍 Network Error Diagnosis:');
      console.error('1. Check if you can access Supabase URL in browser:');
      console.error('   ' + process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.error('2. Verify API keys are valid and not expired');
      console.error('3. Check if local development server is running');
      console.error('4. Try restarting your development environment');
    }
  }
}

testConnection();