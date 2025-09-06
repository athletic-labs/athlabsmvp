// Address autocomplete service using Google Places API

export interface AddressSuggestion {
  id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export class AddressService {
  private static apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  
  static async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    // If no API key, fall back to mock data for development
    if (!this.apiKey) {
      console.warn('Google Places API key not found, using mock data');
      return this.getMockSuggestions(query);
    }
    
    if (query.length < 3) {
      return [];
    }
    
    try {
      // Use Google Places API Autocomplete
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(query)}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.predictions?.map((prediction: any) => ({
        id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting?.main_text || prediction.description,
        secondary_text: prediction.structured_formatting?.secondary_text || ''
      })) || [];
      
    } catch (error) {
      console.error('Google Places API error:', error);
      // Fall back to mock data on error
      return this.getMockSuggestions(query);
    }
  }
  
  // Mock implementation fallback for development/error cases
  private static async getMockSuggestions(query: string): Promise<AddressSuggestion[]> {
    if (query.length < 3) {
      return [];
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockSuggestions: AddressSuggestion[] = [
      {
        id: 'mock-1',
        description: `Ohio Stadium, 411 Woody Hayes Dr, Columbus, OH 43210, USA`,
        main_text: 'Ohio Stadium',
        secondary_text: '411 Woody Hayes Dr, Columbus, OH'
      },
      {
        id: 'mock-2',
        description: `Michigan Stadium, 1201 S Main St, Ann Arbor, MI 48104, USA`,
        main_text: 'Michigan Stadium',
        secondary_text: '1201 S Main St, Ann Arbor, MI'
      },
      {
        id: 'mock-3',
        description: `Mercedes-Benz Stadium, 1 AMB Dr NW, Atlanta, GA 30313, USA`,
        main_text: 'Mercedes-Benz Stadium',
        secondary_text: '1 AMB Dr NW, Atlanta, GA'
      },
      {
        id: 'mock-4',
        description: `AT&T Stadium, 1 AT&T Way, Arlington, TX 76011, USA`,
        main_text: 'AT&T Stadium',
        secondary_text: '1 AT&T Way, Arlington, TX'
      }
    ];
    
    // Filter based on query
    return mockSuggestions.filter(suggestion => 
      suggestion.main_text.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(query.toLowerCase())
    );
  }
}