import { NextRequest, NextResponse } from 'next/server';
import { googleConfig } from '@/lib/config/env';
import { placesAutocompleteSchema } from '@/lib/validation/api-schemas';
import { 
  withQueryValidation, 
  createSuccessResponse, 
  createErrorResponse,
  generateRequestId 
} from '@/lib/validation/api-middleware';
import { withAdaptiveRateLimit, adaptivePresets } from '@/lib/middleware/adaptive-rate-limit';

const GOOGLE_PLACES_API_KEY = googleConfig.placesApiKey;

export const GET = withAdaptiveRateLimit(adaptivePresets.places)(
  withQueryValidation(
    placesAutocompleteSchema,
    async (request: NextRequest, query) => {
    const requestId = generateRequestId();

    try {
      if (!GOOGLE_PLACES_API_KEY) {
        console.error('Google Places API key not configured');
        return createErrorResponse(
          'Address search temporarily unavailable',
          'SERVICE_UNAVAILABLE',
          503
        );
      }

      // Build Google Places API request with security restrictions
      const searchParams = new URLSearchParams({
        input: query.input,
        key: GOOGLE_PLACES_API_KEY,
        types: 'establishment|geocode', // Include both businesses and addresses
        fields: 'place_id,description,structured_formatting', // Only get what we need
        sessiontoken: requestId, // For session-based billing
        language: 'en', // Force English for consistency
      });

      // Add optional parameters
      if (query.types) {
        searchParams.set('types', query.types);
      }

      if (query.radius) {
        searchParams.set('radius', query.radius.toString());
      }

      // Call Google Places API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?${searchParams}`,
        { 
          signal: controller.signal,
          headers: {
            'Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          }
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Google Places API HTTP error: ${response.status}`);
      }

      const data = await response.json();

      // Handle Google API response statuses
      if (data.status === 'ZERO_RESULTS') {
        return createSuccessResponse(
          { 
            predictions: [],
            status: 'ZERO_RESULTS'
          },
          200,
          { requestId }
        );
      }

      if (data.status !== 'OK') {
        console.error(`Google Places API error [${requestId}]:`, data);
        
        // Map Google API errors to user-friendly messages
        let errorMessage = 'Address search failed';
        switch (data.status) {
          case 'REQUEST_DENIED':
            errorMessage = 'Address search access denied';
            break;
          case 'INVALID_REQUEST':
            errorMessage = 'Invalid search request';
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = 'Address search temporarily unavailable due to high demand';
            break;
          case 'UNKNOWN_ERROR':
            errorMessage = 'Address search service temporarily unavailable';
            break;
        }

        return createErrorResponse(
          errorMessage,
          'PLACES_API_ERROR',
          503,
          process.env.NODE_ENV === 'development' ? data : undefined
        );
      }

      // Filter and transform predictions for security and consistency
      const filteredPredictions = data.predictions?.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        structured_formatting: {
          main_text: prediction.structured_formatting?.main_text || '',
          secondary_text: prediction.structured_formatting?.secondary_text || '',
        },
        types: prediction.types || [],
        // Remove potentially sensitive data
      })) || [];

      return createSuccessResponse(
        {
          predictions: filteredPredictions,
          status: data.status,
        },
        200,
        { requestId }
      );

    } catch (error) {
      console.error(`Places API error [${requestId}]:`, error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return createErrorResponse(
          'Address search timed out',
          'TIMEOUT_ERROR',
          408
        );
      }

      return createErrorResponse(
        'Address search failed',
        'INTERNAL_ERROR',
        500,
        process.env.NODE_ENV === 'development' ? error : undefined
      );
    }
  })
);

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