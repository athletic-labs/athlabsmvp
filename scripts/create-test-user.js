#!/usr/bin/env node

/**
 * Create a test user for development and testing
 * This script creates a user account and associated profile in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test@athleticlabs.com',
      password: 'TestPass123!',
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create a test team first
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: 'Test Athletic Team',
        organization_type: 'school',
        subscription_tier: 'pro',
        is_active: true,
        settings: {
          default_prep_time: 48,
          notification_preferences: {
            email: true,
            sms: false
          }
        }
      })
      .select()
      .single();

    if (teamError) {
      throw new Error(`Team creation failed: ${teamError.message}`);
    }

    console.log('✅ Team created:', teamData.id);

    // Update the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: 'Test',
        last_name: 'User',
        role: 'team_admin',
        team_id: teamData.id,
        onboarding_completed: true,
        is_active: true
      })
      .eq('id', authData.user.id);

    if (profileError) {
      throw new Error(`Profile update failed: ${profileError.message}`);
    }

    console.log('✅ Profile updated with team association');

    // Create a sample saved template
    const { error: templateError } = await supabase
      .from('saved_templates')
      .insert({
        team_id: teamData.id,
        created_by: authData.user.id,
        name: 'Sample Game Day Template',
        description: 'Pre-game meal template',
        items: [
          {
            templateId: 'pasta-bolognese',
            quantity: 2,
            panSize: 'full',
            notes: 'Extra parmesan cheese'
          },
          {
            templateId: 'caesar-salad',
            quantity: 1,
            panSize: 'half',
            substitutions: {
              dressing: 'ranch'
            }
          }
        ],
        times_used: 3,
        is_favorite: true
      });

    if (templateError) {
      throw new Error(`Template creation failed: ${templateError.message}`);
    }

    console.log('✅ Sample template created');

    console.log('\n🎉 Test user setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('Email: test@athleticlabs.com');
    console.log('Password: TestPass123!');
    console.log('\nYou can now test the saved-templates page functionality.');

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    process.exit(1);
  }
}

createTestUser();