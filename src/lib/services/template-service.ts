import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface SavedTemplateItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  servings?: number;
  category?: string;
  panSize?: 'half' | 'full';
  notes?: string;
}

export interface SavedTemplate {
  id: string;
  team_id: string;
  created_by: string;
  name: string;
  description?: string;
  items: SavedTemplateItem[];
  times_used: number;
  last_used_at?: string;
  is_favorite?: boolean;
  archived_at?: string;
  archived_by?: string;
  created_at: string;
  updated_at?: string;
}

export class TemplateService {
  private static supabase = createClientComponentClient();
  
  /**
   * Save a new template
   */
  static async saveTemplate(name: string, items: SavedTemplateItem[], description?: string): Promise<SavedTemplate> {
    const response = await fetch('/api/templates', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, items, description }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save template');
    }
    
    const data = await response.json();
    return data.template;
  }
  
  /**
   * Get all saved templates for the team (active only by default)
   */
  static async getTemplates(includeArchived = false): Promise<SavedTemplate[]> {

    const response = await fetch(`/api/templates?includeArchived=${includeArchived}`, {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const data = await response.json();
    const templates = data.templates || [];

    return templates;
  }

  /**
   * Get only archived templates
   */
  static async getArchivedTemplates(): Promise<SavedTemplate[]> {
    const response = await fetch('/api/templates?archived=true', {
      cache: 'no-store',
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch archived templates');
    }
    
    const data = await response.json();
    const templates = data.templates || [];

    return templates;
  }
  
  /**
   * Archive a template (soft delete)
   */
  static async archiveTemplate(templateId: string): Promise<void> {
    const response = await fetch(`/api/templates/${templateId}/archive`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to archive template');
    }
  }

  /**
   * Restore an archived template
   */
  static async restoreTemplate(templateId: string): Promise<void> {
    const response = await fetch(`/api/templates/${templateId}/restore`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to restore template');
    }
  }

  /**
   * Permanently delete a template (hard delete - admin only)
   */
  static async deleteTemplate(templateId: string): Promise<void> {

    const response = await fetch(`/api/templates/${templateId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Delete failed:', error);
      throw new Error(error.error || 'Failed to delete template');
    }
    
    const result = await response.json();

  }
  
  /**
   * Update times used for a template - optimized atomic operation
   */
  static async incrementUsage(templateId: string): Promise<void> {
    // Use atomic UPDATE with SQL function to avoid N+1 query problem
    const { error } = await this.supabase
      .rpc('increment_template_usage', { 
        template_id: templateId 
      });
    
    if (error) {
      console.error('Failed to increment template usage:', error);
      throw new Error('Failed to update template usage');
    }
  }
}