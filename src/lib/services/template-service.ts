import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface SavedTemplate {
  id: string;
  team_id: string;
  created_by: string;
  name: string;
  items: any[];
  times_used: number;
  last_used_at?: string;
  created_at: string;
}

export class TemplateService {
  private static supabase = createClientComponentClient();
  
  /**
   * Save a new template
   */
  static async saveTemplate(name: string, items: any[]): Promise<SavedTemplate> {
    const response = await fetch('/api/templates', {
      method: 'POST',
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
    console.log('Fetching templates from API...');
    
    const response = await fetch('/api/templates', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const data = await response.json();
    console.log('Retrieved templates:', data.templates?.length || 0, 'templates');
    return data.templates;
  }
  
  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    console.log('Deleting template:', templateId);
    
    const response = await fetch('/api/templates', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ templateId }),
    });
    
    console.log('Delete response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Delete failed:', error);
      throw new Error(error.error || 'Failed to delete template');
    }
    
    const result = await response.json();
    console.log('Delete successful:', result);
  }
  
  /**
   * Update times used for a template
   */
  static async incrementUsage(templateId: string): Promise<void> {
    const { data: template } = await this.supabase
      .from('saved_templates')
      .select('times_used')
      .eq('id', templateId)
      .single();
    
    if (template) {
      await this.supabase
        .from('saved_templates')
        .update({ 
          times_used: (template.times_used || 0) + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', templateId);
    }
  }
}