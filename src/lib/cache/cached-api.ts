import { cacheManager, cacheKeys, cacheConfig } from './redis-client';

/**
 * Cached API wrapper functions
 */

// Orders API with caching
export const cachedOrdersApi = {
  async getOrders(teamId: string, filters?: Record<string, any>) {
    const key = cacheKeys.orders(teamId, filters);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/v1/orders?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.orders.ttl
    );
  },

  async getOrderById(orderId: string) {
    const key = cacheKeys.orderById(orderId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/v1/orders/${orderId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.order;
      },
      cacheConfig.orderById.ttl
    );
  },

  async invalidateOrders(teamId: string) {
    await cacheManager.delPattern(`orders:${teamId}:*`);
    await cacheManager.del(cacheKeys.orderAnalytics(teamId));
    await cacheManager.del(cacheKeys.dashboardMetrics(teamId));
  },
};

// Templates API with caching
export const cachedTemplatesApi = {
  async getTemplates(teamId: string, filters?: Record<string, any>) {
    const key = cacheKeys.templates(teamId, filters);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        if (filters?.search) params.append('search', filters.search);
        if (filters?.favorites) params.append('favorites', 'true');

        const response = await fetch(`/api/templates?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.templates.ttl
    );
  },

  async getTemplateById(templateId: string) {
    const key = cacheKeys.templateById(templateId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/templates/${templateId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data.template;
      },
      cacheConfig.templateById.ttl
    );
  },

  async getFavoriteTemplates(teamId: string) {
    const key = cacheKeys.templatesFavorites(teamId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch('/api/templates?favorites=true&limit=10', {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch favorite templates: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.templates.ttl
    );
  },

  async invalidateTemplates(teamId: string) {
    await cacheManager.delPattern(`templates:${teamId}:*`);
  },
};

// Dashboard Analytics API with caching
export const cachedAnalyticsApi = {
  async getDashboardMetrics(teamId: string) {
    const key = cacheKeys.dashboardMetrics(teamId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/analytics/dashboard?teamId=${teamId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard metrics: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.dashboardMetrics.ttl
    );
  },

  async getOrderAnalytics(teamId: string) {
    const key = cacheKeys.orderAnalytics(teamId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/analytics/orders?teamId=${teamId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch order analytics: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.dashboardMetrics.ttl
    );
  },

  async invalidateDashboard(teamId: string) {
    await cacheManager.del([
      cacheKeys.dashboardMetrics(teamId),
      cacheKeys.orderAnalytics(teamId),
    ]);
  },
};

// User data API with caching
export const cachedUserApi = {
  async getUserProfile(userId: string) {
    const key = cacheKeys.userProfile(userId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/users/${userId}/profile`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.userProfile.ttl
    );
  },

  async getUserPermissions(userId: string, teamId: string) {
    const key = cacheKeys.userPermissions(userId, teamId);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/users/${userId}/permissions?teamId=${teamId}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user permissions: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.userPermissions.ttl
    );
  },

  async invalidateUser(userId: string) {
    await cacheManager.delPattern(`user:*:${userId}*`);
  },
};

// Places API with long-term caching (addresses don't change often)
export const cachedPlacesApi = {
  async getAutocomplete(query: string) {
    if (!query || query.length < 3) {
      return { predictions: [] };
    }

    const key = cacheKeys.placesAutocomplete(query);
    
    return await cacheManager.cacheAside(
      key,
      async () => {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch places: ${response.statusText}`);
        }

        const data = await response.json();
        return data.data;
      },
      cacheConfig.placesAutocomplete.ttl
    );
  },
};

/**
 * Cache invalidation helpers for mutations
 */
export const cacheInvalidation = {
  // When order is created/updated/deleted
  async onOrderChange(teamId: string, orderId?: string) {
    await Promise.all([
      cachedOrdersApi.invalidateOrders(teamId),
      cachedAnalyticsApi.invalidateDashboard(teamId),
      orderId && cacheManager.del(cacheKeys.orderById(orderId)),
    ]);
  },

  // When template is created/updated/deleted
  async onTemplateChange(teamId: string, templateId?: string) {
    await Promise.all([
      cachedTemplatesApi.invalidateTemplates(teamId),
      templateId && cacheManager.del(cacheKeys.templateById(templateId)),
    ]);
  },

  // When user profile or permissions change
  async onUserChange(userId: string) {
    await cachedUserApi.invalidateUser(userId);
  },

  // Clear all cache for a team (useful for major changes)
  async clearTeamCache(teamId: string) {
    await Promise.all([
      cacheManager.delPattern(`orders:${teamId}:*`),
      cacheManager.delPattern(`templates:${teamId}:*`),
      cacheManager.del([
        cacheKeys.dashboardMetrics(teamId),
        cacheKeys.orderAnalytics(teamId),
      ]),
    ]);
  },
};