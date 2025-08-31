import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get client IP from various possible headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  // Parse forwarded header (format: "client, proxy1, proxy2")
  const ip = forwarded 
    ? forwarded.split(',')[0].trim()
    : realIP || clientIP || request.ip || 'unknown';

  return NextResponse.json({ ip });
}