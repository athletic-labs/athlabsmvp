#!/usr/bin/env node

/**
 * Test the templates API endpoint to diagnose issues
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testTemplatesAPI() {
  try {
    console.log('🔐 Testing authentication...');
    
    // First authenticate
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@athleticlabs.com',
      password: 'TestPass123!'
    });

    if (authError) {
      throw new Error(`Auth failed: ${authError.message}`);
    }

    console.log('✅ Authentication successful');
    console.log('User ID:', authData.user?.id);

    // Test API endpoint via fetch (like the frontend does)
    console.log('\n📡 Testing templates API endpoint...');
    
    // Get the session token for API calls
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No session found after authentication');
    }

    console.log('Session token available:', !!session.access_token);

    // Make API call to localhost (simulating frontend)
    try {
      const response = await fetch('http://localhost:3000/api/templates', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      console.log('API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', {
        templates: data.templates?.length || 0,
        pagination: data.pagination,
        firstTemplate: data.templates?.[0]?.name
      });

    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message);
      
      // Fallback: test direct database query
      console.log('\n🔍 Testing direct database query...');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id, role')
        .eq('id', authData.user.id)
        .single();
      
      console.log('User profile:', profile);

      if (profile?.team_id) {
        const { data: templates, error: templatesError } = await supabase
          .from('saved_templates')
          .select('*')
          .eq('team_id', profile.team_id)
          .limit(5);

        if (templatesError) {
          console.error('❌ Database error:', templatesError);
        } else {
          console.log('✅ Database query successful:', {
            count: templates?.length || 0,
            templates: templates?.map(t => ({ id: t.id, name: t.name }))
          });
        }
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log('\n✅ Test completed');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Start dev server if needed
const { spawn } = require('child_process');

console.log('🚀 Starting development server...');
const devServer = spawn('npm', ['run', 'dev'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true
});

let serverReady = false;

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready in') || output.includes('Local:')) {
    if (!serverReady) {
      serverReady = true;
      console.log('✅ Dev server ready, running tests...\n');
      
      // Wait a moment for server to fully start
      setTimeout(() => {
        testTemplatesAPI().finally(() => {
          devServer.kill();
          process.exit(0);
        });
      }, 2000);
    }
  }
});

devServer.stderr.on('data', (data) => {
  console.error('Dev server error:', data.toString());
});

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Timeout waiting for dev server');
  devServer.kill();
  process.exit(1);
}, 30000);