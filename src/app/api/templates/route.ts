import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's team
    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', session.user.id)
      .single();
    
    if (!profile?.team_id) {
      return NextResponse.json({ error: 'No team associated' }, { status: 400 });
    }
    
    // Parse request body
    const body = await request.json();
    const { name, items } = body;
    
    // Validate input
    if (!name || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid template data' }, { status: 400 });
    }
    
    // Format items for storage
    const formattedItems = items.map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      panSize: item.panSize,
      quantity: item.quantity,
      priceHalf: item.priceHalf,
      priceFull: item.priceFull,
      servingsHalf: item.servingsHalf,
      servingsFull: item.servingsFull
    }));
    
    // Save to database
    const { data, error } = await supabase
      .from('saved_templates')
      .insert({
        team_id: profile.team_id,
        created_by: session.user.id,
        name: name,
        items: formattedItems,
        times_used: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving template:', error);
      return NextResponse.json({ error: 'Failed to save template' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      template: data,
      message: 'Template saved successfully' 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's team
    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', session.user.id)
      .single();
    
    if (!profile?.team_id) {
      return NextResponse.json({ error: 'No team associated' }, { status: 400 });
    }
    
    // Fetch templates for the team
    const { data: templates, error } = await supabase
      .from('saved_templates')
      .select('*')
      .eq('team_id', profile.team_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }
    
    const response = NextResponse.json({ templates });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    console.log('DELETE /api/templates called');
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's team
    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', session.user.id)
      .single();
    
    if (!profile?.team_id) {
      console.log('No team found for user');
      return NextResponse.json({ error: 'No team associated' }, { status: 400 });
    }
    
    // Parse request body to get template ID
    const body = await request.json();
    const { templateId } = body;
    console.log('Attempting to delete template:', templateId, 'for team:', profile.team_id);
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }
    
    // First check if template exists and belongs to team
    const { data: existingTemplate } = await supabase
      .from('saved_templates')
      .select('id, team_id')
      .eq('id', templateId)
      .single();
    
    console.log('Existing template found:', existingTemplate);
    
    if (!existingTemplate) {
      console.log('Template not found in database');
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    if (existingTemplate.team_id !== profile.team_id) {
      console.log('Team mismatch - template belongs to:', existingTemplate.team_id, 'user belongs to:', profile.team_id);
      return NextResponse.json({ error: 'Not authorized to delete this template' }, { status: 403 });
    }
    
    // Delete template (only if it belongs to the user's team)
    const { error, count } = await supabase
      .from('saved_templates')
      .delete()
      .eq('id', templateId)
      .eq('team_id', profile.team_id);
    
    console.log('Delete operation result - error:', error, 'affected rows:', count);
    
    if (error) {
      console.error('Error deleting template:', error);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }
    
    console.log('Template deleted successfully:', templateId);
    return NextResponse.json({ 
      success: true, 
      message: 'Template deleted successfully' 
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}