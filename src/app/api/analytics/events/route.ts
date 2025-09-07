import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { withInputSanitization, sanitizationPresets } from '@/lib/middleware/sanitization-middleware';

const analyticsHandler = async (request: NextRequest) => {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const event = await request.json();

    // Validate event structure
    if (!event.event_name || !event.timestamp) {
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwarded ? forwarded.split(',')[0].trim() : realIP || 'unknown';

    // Store in database (using audit_logs table for now)
    await supabase
      .from('audit_logs')
      .insert({
        user_id: event.user_id,
        team_id: event.team_id,
        action: 'analytics_event',
        resource_type: 'analytics',
        metadata: {
          event_name: event.event_name,
          properties: event.properties,
          session_id: event.session_id,
          ip_address: ip,
        },
      });

    // In production, you might also send to external analytics services
    if (process.env.NODE_ENV === 'production') {
      // Example: Google Analytics, Mixpanel, Amplitude, etc.
      // await sendToExternalAnalytics(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics event' },
      { status: 500 }
    );
  }
};

export const POST = withInputSanitization(analyticsHandler, {
  body: {
    event_name: { type: 'text', options: { maxLength: 100, normalizeWhitespace: true } },
    user_id: { type: 'sql' },
    team_id: { type: 'sql' },
    session_id: { type: 'text', options: { maxLength: 255 } },
    properties: { type: 'json' },
  },
  logThreats: true,
  blockThreats: true,
  maxThreatSeverity: 'medium',
});