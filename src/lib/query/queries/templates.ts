import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheUtils } from '../query-client';

// Types
interface Template {
  id: string;
  name: string;
  description: string;
  items: any[];
  times_used: number;
  last_used_at: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface TemplateFilters {
  page?: number;
  limit?: number;
  search?: string;
  favorites?: boolean;
}

interface TemplatesResponse {
  templates: Template[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface CreateTemplateData {
  name: string;
  description: string;
  items: any[];
}

// API functions
const templatesApi = {
  async getTemplates(filters?: TemplateFilters): Promise<TemplatesResponse> {
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

  async getTemplateById(templateId: string): Promise<Template> {
    const response = await fetch(`/api/templates/${templateId}`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.template;
  },

  async createTemplate(templateData: CreateTemplateData): Promise<Template> {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.template;
  },

  async updateTemplate(templateId: string, updates: Partial<CreateTemplateData>): Promise<Template> {
    const response = await fetch(`/api/templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update template: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.template;
  },

  async deleteTemplate(templateId: string): Promise<void> {
    const response = await fetch(`/api/templates/${templateId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete template: ${response.statusText}`);
    }
  },

  async toggleFavorite(templateId: string): Promise<Template> {
    const response = await fetch(`/api/templates/${templateId}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle favorite: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.template;
  },
};

// Query hooks
export function useTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: queryKeys.templatesList(filters),
    queryFn: () => templatesApi.getTemplates(filters),
    staleTime: 1000 * 60 * 5, // Templates are fairly static, 5 minutes
    gcTime: 1000 * 60 * 15, // Keep cached for 15 minutes
  });
}

export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.templatesById(templateId),
    queryFn: () => templatesApi.getTemplateById(templateId),
    enabled: !!templateId,
    staleTime: 1000 * 60 * 10, // Single template can be cached longer
  });
}

export function useFavoriteTemplates(teamId?: string) {
  return useQuery({
    queryKey: queryKeys.templatesFavorites(teamId),
    queryFn: () => templatesApi.getTemplates({ favorites: true, limit: 10 }),
    staleTime: 1000 * 60 * 3, // Favorites change more frequently
  });
}

// Mutation hooks
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: (newTemplate) => {
      // Invalidate all template queries
      cacheUtils.invalidateTemplates();
      
      // Add new template to cache
      queryClient.setQueryData(queryKeys.templatesById(newTemplate.id), newTemplate);
      
      // Optimistically add to templates list
      const templatesQueryKey = queryKeys.templatesList();
      const previousData = queryClient.getQueryData<TemplatesResponse>(templatesQueryKey);
      
      if (previousData) {
        queryClient.setQueryData<TemplatesResponse>(templatesQueryKey, {
          ...previousData,
          templates: [newTemplate, ...previousData.templates],
          pagination: {
            ...previousData.pagination,
            total: previousData.pagination.total + 1,
          },
        });
      }
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ templateId, updates }: { templateId: string; updates: Partial<CreateTemplateData> }) =>
      templatesApi.updateTemplate(templateId, updates),
    onSuccess: (updatedTemplate) => {
      // Update specific template in cache
      queryClient.setQueryData(queryKeys.templatesById(updatedTemplate.id), updatedTemplate);
      
      // Update in all templates lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.templates },
        (oldData: any) => {
          if (!oldData?.templates) return oldData;
          
          return {
            ...oldData,
            templates: oldData.templates.map((template: Template) =>
              template.id === updatedTemplate.id ? updatedTemplate : template
            ),
          };
        }
      );
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: (_, templateId) => {
      // Remove from specific cache
      queryClient.removeQueries({ queryKey: queryKeys.templatesById(templateId) });
      
      // Remove from all templates lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.templates },
        (oldData: any) => {
          if (!oldData?.templates) return oldData;
          
          return {
            ...oldData,
            templates: oldData.templates.filter((template: Template) => template.id !== templateId),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1),
            },
          };
        }
      );
      
      // Invalidate favorites if this was a favorite
      queryClient.invalidateQueries({ queryKey: queryKeys.templatesFavorites() });
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templatesApi.toggleFavorite,
    onSuccess: (updatedTemplate) => {
      // Update specific template
      queryClient.setQueryData(queryKeys.templatesById(updatedTemplate.id), updatedTemplate);
      
      // Update in all templates lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.templates },
        (oldData: any) => {
          if (!oldData?.templates) return oldData;
          
          return {
            ...oldData,
            templates: oldData.templates.map((template: Template) =>
              template.id === updatedTemplate.id ? updatedTemplate : template
            ),
          };
        }
      );
      
      // Invalidate favorites list
      queryClient.invalidateQueries({ queryKey: queryKeys.templatesFavorites() });
    },
  });
}

// Prefetch utilities
export function usePrefetchTemplate() {
  const queryClient = useQueryClient();

  return (templateId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.templatesById(templateId),
      queryFn: () => templatesApi.getTemplateById(templateId),
      staleTime: 1000 * 60 * 10,
    });
  };
}