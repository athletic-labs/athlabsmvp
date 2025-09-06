import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  if (!GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ 
      error: 'Google Places API key not configured',
      predictions: [] 
    }, { status: 500 });
  }

  try {
    // Google Places API Autocomplete
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
      new URLSearchParams({
        input: input,
        key: GOOGLE_PLACES_API_KEY,
        types: 'establishment|geocode', // Include both businesses and addresses
        fields: 'place_id,description,structured_formatting', // Only get what we need
      })
    );

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Google Places API error:', data);
      throw new Error(`Google Places API status: ${data.status}`);
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Places API error:', error);
    return NextResponse.json({ 
      error: 'Failed to search addresses',
      predictions: [] 
    }, { status: 500 });
  }
}

// Add CORS headers if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}