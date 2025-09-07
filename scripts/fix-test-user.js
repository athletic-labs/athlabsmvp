#!/usr/bin/env node

/**
 * Fix the existing test user by ensuring they have the correct role and team
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixTestUser() {
  try {
    console.log('🔍 Checking existing user...');
    
    // Find the user by email
    const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw new Error(`Failed to list users: ${authError.message}`);
    }

    const testUser = authUser.users.find(u => u.email === 'test@athleticlabs.com');
    if (!testUser) {
      throw new Error('Test user not found');
    }

    console.log('✅ Found user:', testUser.id);

    // Check current profile
    const { data: currentProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (profileError) {
      console.log('❌ Profile not found, creating...');
    } else {
      console.log('📋 Current profile:', {
        role: currentProfile.role,
        team_id: currentProfile.team_id,
        onboarding_completed: currentProfile.onboarding_completed,
        is_active: currentProfile.is_active
      });
    }

    // Check if we have a team, create one if needed
    let teamId;
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('name', 'Test Athletic Team')
      .single();

    if (existingTeam) {
      teamId = existingTeam.id;
      console.log('✅ Using existing team:', teamId);
    } else {
      const { data: newTeam, error: teamError } = await supabase
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
      
      teamId = newTeam.id;
      console.log('✅ Created new team:', teamId);
    }

    // Update/insert the profile with correct role
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: testUser.id,
        email: testUser.email,
        first_name: 'Test',
        last_name: 'User',
        role: 'team_admin',  // This is crucial for accessing saved-templates
        team_id: teamId,
        onboarding_completed: true,
        is_active: true
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      throw new Error(`Profile update failed: ${upsertError.message}`);
    }

    console.log('✅ Profile updated with team_admin role');

    // Create a sample template if none exists
    const { data: existingTemplate } = await supabase
      .from('saved_templates')
      .select('id')
      .eq('team_id', teamId)
      .limit(1)
      .single();

    if (!existingTemplate) {
      const { error: templateError } = await supabase
        .from('saved_templates')
        .insert({
          team_id: teamId,
          created_by: testUser.id,
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
    } else {
      console.log('✅ Template already exists');
    }

    console.log('\n🎉 Test user setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('Email: test@athleticlabs.com');
    console.log('Password: TestPass123!');
    console.log('Role: team_admin (has access to saved-templates)');
    console.log('\nThe saved-templates page should now work properly.');

  } catch (error) {
    console.error('❌ Error fixing test user:', error.message);
    process.exit(1);
  }
}

fixTestUser();