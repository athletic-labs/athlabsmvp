import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface SavedTemplateItem {
  templateId?: string;
  menuItemId?: string;
  quantity: number;
  panSize?: 'half' | 'full';
  substitutions?: Record<string, string>;
  notes?: string;
}

export interface SavedTemplate {
  id: string;
  team_id: string;
  created_by: string;
  name: string;
  items: SavedTemplateItem[];
  times_used: number;
  last_used_at?: string;
  created_at: string;
}

export class TemplateService {
  private static supabase = createClientComponentClient();
  
  /**
   * Save a new template
   */
  static async saveTemplate(name: string, items: SavedTemplateItem[]): Promise<SavedTemplate> {
    const response = await fetch('/api/templates', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, items }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save template');
    }
    
    const data = await response.json();
    return data.template;
  }
  
  /**
   * Get all saved templates for the team
   */
  static async getTemplates(): Promise<SavedTemplate[]> {

    const response = await fetch('/api/templates', {
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
   * Delete a template - optimized to use RESTful endpoint
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