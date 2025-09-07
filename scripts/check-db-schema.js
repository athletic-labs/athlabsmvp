#!/usr/bin/env node

/**
 * Check database schema to understand the structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 Checking user profile...');
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'test@athleticlabs.com')
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
    } else {
      console.log('📋 Profile data:', profile);
    }

    console.log('\n🔍 Checking team...');
    
    if (profile?.team_id) {
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', profile.team_id)
        .single();

      if (teamError) {
        console.error('Team error:', teamError);
      } else {
        console.log('🏈 Team data:', team);
      }
    }

    console.log('\n🔍 Checking saved templates...');
    
    const { data: templates, error: templatesError } = await supabase
      .from('saved_templates')
      .select('*')
      .limit(5);

    if (templatesError) {
      console.error('Templates error:', templatesError);
    } else {
      console.log('📄 Templates data:', templates);
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    process.exit(1);
  }
}

checkSchema();