import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Optimized query defaults for performance
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: Data remains fresh for 5 minutes
    staleTime: 1000 * 60 * 5,
    
    // Cache time: Keep unused data for 10 minutes
    gcTime: 1000 * 60 * 10,
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 3 times for server errors
      return failureCount < 3;
    },
    
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for critical data
    refetchOnWindowFocus: true,
    
    // Refetch on reconnect
    refetchOnReconnect: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: 'always',
  },
  mutations: {
    // Retry mutations once
    retry: 1,
    
    // Retry delay for mutations
    retryDelay: 1000,
  },
};

// Create query client with optimized settings
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Query keys factory for consistent cache management
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  profile: (userId?: string) => ['auth', 'profile', userId] as const,
  
  // Orders
  orders: ['orders'] as const,
  ordersList: (filters?: Record<string, any>) => ['orders', 'list', filters] as const,
  ordersById: (orderId: string) => ['orders', 'byId', orderId] as const,
  ordersAnalytics: (teamId?: string) => ['orders', 'analytics', teamId] as const,
  
  // Templates
  templates: ['templates'] as const,
  templatesList: (filters?: Record<string, any>) => ['templates', 'list', filters] as const,
  templatesById: (templateId: string) => ['templates', 'byId', templateId] as const,
  templatesFavorites: (teamId?: string) => ['templates', 'favorites', teamId] as const,
  
  // Teams
  teams: ['teams'] as const,
  teamsById: (teamId: string) => ['teams', 'byId', teamId] as const,
  teamMembers: (teamId: string) => ['teams', 'members', teamId] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  dashboardMetrics: (teamId?: string) => ['analytics', 'dashboard', teamId] as const,
  
  // Places API
  places: ['places'] as const,
  placesAutocomplete: (query: string) => ['places', 'autocomplete', query] as const,
} as const;

// Cache invalidation helpers
export const cacheUtils = {
  // Invalidate all orders data
  invalidateOrders: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.orders });
  },
  
  // Invalidate specific order
  invalidateOrder: (orderId: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.ordersById(orderId) });
  },
  
  // Invalidate all templates data
  invalidateTemplates: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.templates });
  },
  
  // Invalidate dashboard data
  invalidateDashboard: () => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.ordersAnalytics() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardMetrics() }),
    ]);
  },
  
  // Clear all cache
  clearAll: () => {
    return queryClient.clear();
  },
  
  // Remove stale queries
  removeStaleQueries: () => {
    queryClient.getQueryCache().findAll().forEach(query => {
      if (query.isStale()) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  },
};

// Performance monitoring
export const queryMetrics = {
  getCacheSize: () => {
    return queryClient.getQueryCache().getAll().length;
  },
  
  getStaleQueries: () => {
    return queryClient.getQueryCache().findAll().filter(query => query.isStale()).length;
  },
  
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const all = cache.getAll();
    const stale = all.filter(query => query.isStale());
    const fetching = all.filter(query => query.state.status === 'pending');
    
    return {
      total: all.length,
      stale: stale.length,
      fetching: fetching.length,
      fresh: all.length - stale.length,
    };
  },
};

// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Add query cache debugging
  (window as any).queryClient = queryClient;
  (window as any).queryMetrics = queryMetrics;
  (window as any).cacheUtils = cacheUtils;
}