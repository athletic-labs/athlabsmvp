'use client';

import { useState, useEffect } from 'react';
import { Plus, Archive, RotateCcw, ShoppingCart, Clock, TrendingUp, Search, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { TemplateService, SavedTemplate } from '@/lib/services/template-service';
import { useCartStore } from '@/lib/store/cart-store';
import { Card, CardContent, Button } from '@/lib/design-system/components';
import { TextFieldV2 } from '@/lib/design-system/components/TextFieldV2';

export default function SavedTemplatesPage() {
  const [activeTemplates, setActiveTemplates] = useState<SavedTemplate[]>([]);
  const [archivedTemplates, setArchivedTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const { addItem } = useCartStore();
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  // Reload templates when page becomes visible (handles navigation back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadTemplates();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  const loadTemplates = async () => {
    try {
      // Load active templates (default behavior)
      const activeData = await TemplateService.getTemplates(false);
      setActiveTemplates(Array.isArray(activeData) ? activeData : []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
      setActiveTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadArchivedTemplates = async () => {
    if (archivedTemplates.length > 0) return; // Already loaded
    
    setLoadingArchived(true);
    try {
      const archivedData = await TemplateService.getArchivedTemplates();
      setArchivedTemplates(Array.isArray(archivedData) ? archivedData : []);
    } catch (error) {
      console.error('Failed to load archived templates:', error);
      toast.error('Failed to load archived templates');
      setArchivedTemplates([]);
    } finally {
      setLoadingArchived(false);
    }
  };
  
  const handleArchive = async (templateId: string) => {
    toast.promise(
      TemplateService.archiveTemplate(templateId),
      {
        loading: 'Archiving template...',
        success: () => {
          // Move from active to archived
          const templateToArchive = activeTemplates.find(t => t.id === templateId);
          if (templateToArchive) {
            const updatedActive = activeTemplates.filter(t => t.id !== templateId);
            setActiveTemplates(updatedActive);
            
            // Add to archived with archive metadata
            const archivedTemplate = {
              ...templateToArchive,
              archived_at: new Date().toISOString()
            };
            setArchivedTemplates(prev => [archivedTemplate, ...prev]);
          }
          return 'Template archived successfully';
        },
        error: 'Failed to archive template'
      }
    );
  };

  const handleRestore = async (templateId: string) => {
    toast.promise(
      TemplateService.restoreTemplate(templateId),
      {
        loading: 'Restoring template...',
        success: () => {
          // Move from archived to active
          const templateToRestore = archivedTemplates.find(t => t.id === templateId);
          if (templateToRestore) {
            const updatedArchived = archivedTemplates.filter(t => t.id !== templateId);
            setArchivedTemplates(updatedArchived);
            
            // Add to active without archive metadata
            const restoredTemplate = {
              ...templateToRestore,
              archived_at: undefined,
              archived_by: undefined
            };
            setActiveTemplates(prev => [restoredTemplate, ...prev]);
          }
          return 'Template restored successfully';
        },
        error: 'Failed to restore template'
      }
    );
  };

  const handleDelete = async (templateId: string) => {
    // Only for permanently deleting archived templates (admin feature)
    toast.promise(
      TemplateService.deleteTemplate(templateId),
      {
        loading: 'Permanently deleting template...',
        success: () => {
          setArchivedTemplates(prev => prev.filter(t => t.id !== templateId));
          return 'Template permanently deleted';
        },
        error: 'Failed to delete template'
      }
    );
  };
  
  const handleAddToCart = async (template: SavedTemplate) => {
    // Calculate total price from items
    const total = template.items.reduce((sum, item) => {
      // Use default pricing when specific prices aren't available
      const basePrice = 15; // Default price per item
      const price = item.panSize === 'half' ? basePrice * 0.6 : basePrice;
      return sum + (price * item.quantity);
    }, 0);
    
    // Calculate total servings
    const servings = template.items.reduce((sum, item) => {
      // Use default servings when specific servings aren't available
      const defaultServings = 12; // Default servings per item
      const serving = item.panSize === 'half' ? defaultServings * 0.5 : defaultServings;
      return sum + (serving * item.quantity);
    }, 0);
    
    // Add to cart
    addItem({
      type: 'template',
      name: template.name,
      quantity: 1,
      unitPrice: total,
      servings: servings,
      includedItems: template.items.map(item => ({
        name: item.name || 'Unknown Item',
        quantity: `${item.quantity} ${item.panSize === 'half' ? 'Half' : 'Full'} Pan${item.quantity > 1 ? 's' : ''}`
      }))
    });
    
    // Update usage count
    await TemplateService.incrementUsage(template.id);
    
    toast.success('Added to cart');
  };
  
  const filteredActiveTemplates = (activeTemplates || []).filter(template =>
    template?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchivedTemplates = (archivedTemplates || []).filter(template =>
    template?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleArchived = () => {
    setShowArchived(!showArchived);
    if (!showArchived && archivedTemplates.length === 0) {
      loadArchivedTemplates();
    }
  };

  // Template Card Component
  const TemplateCard = ({ template, isArchived = false }: { template: SavedTemplate, isArchived?: boolean }) => (
    <div className={`bg-white dark:bg-navy rounded-lg shadow-lg p-6 ${isArchived ? 'opacity-80 bg-gradient-to-br from-gray-50 to-gray-100' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {template.name}
            {isArchived && (
              <Archive className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
            )}
          </h3>
          {template.description && (
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mt-1">
              {template.description}
            </p>
          )}
        </div>
        
        <div className="flex gap-1 ml-2">
          {isArchived ? (
            <>
              <button
                onClick={() => handleRestore(template.id)}
                className="p-2 hover:bg-green-500/10 rounded transition-colors"
                title="Restore template"
              >
                <RotateCcw className="w-4 h-4 text-green-600" />
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="p-2 hover:bg-red-500/10 rounded transition-colors"
                title="Permanently delete"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </>
          ) : (
            <button
              onClick={() => handleArchive(template.id)}
              className="p-2 hover:bg-[var(--md-sys-color-surface-container)] rounded transition-colors"
              title="Archive template"
            >
              <Archive className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="md3-body-small text-navy/60 dark:text-white/60">
          {template.items.length} items • {
            template.items.reduce((sum, item) => {
              const defaultServings = 12;
              const serving = item.panSize === 'half' ? defaultServings * 0.5 : defaultServings;
              return sum + (serving * item.quantity);
            }, 0)
          } total servings
        </p>
        
        {!isArchived && template.times_used > 0 && (
          <div className="flex items-center gap-2 md3-label-small text-green-600 dark:text-green-400">
            <TrendingUp className="w-3 h-3" />
            Used {template.times_used} time{template.times_used !== 1 ? 's' : ''}
          </div>
        )}
        
        {template.last_used_at && (
          <div className="flex items-center gap-2 md3-label-small text-navy/50 dark:text-white/50">
            <Clock className="w-3 h-3" />
            Last used {format(new Date(template.last_used_at), 'MMM d')}
          </div>
        )}

        {isArchived && template.archived_at && (
          <div className="flex items-center gap-2 md3-label-small text-[var(--md-sys-color-on-surface-variant)]">
            <Archive className="w-3 h-3" />
            Archived {format(new Date(template.archived_at), 'MMM d, yyyy')}
          </div>
        )}
      </div>
      
      {/* Show first few items */}
      <div className="mb-4 p-3 bg-smoke/10 dark:bg-smoke/20 rounded md3-label-small space-y-1">
        {template.items.slice(0, 3).map((item, idx) => (
          <p key={idx} className="text-navy/70 dark:text-white/70">
            • {item.name || 'Unknown Item'} ({item.quantity} {item.panSize || 'full'} pan{item.quantity > 1 ? 's' : ''})
          </p>
        ))}
        {template.items.length > 3 && (
          <p className="text-navy/50 dark:text-white/50">
            +{template.items.length - 3} more items
          </p>
        )}
      </div>
      
      {!isArchived && (
        <div className="flex gap-2">
          <button
            onClick={() => handleAddToCart(template)}
            className="flex-1 md-filled-button md3-body-small flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Saved Templates</h1>
          <p className="md3-body-small text-navy/60 dark:text-white/60 mt-1">
            Your custom meal combinations ready to reorder
          </p>
        </div>
        <Link href="/new-order" className="md-filled-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Template
        </Link>
      </div>
      
      <Card variant="filled" className="mb-6">
        <CardContent className="p-4">
          <TextFieldV2
            type="text"
            placeholder="Search saved templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={<Search className="w-5 h-5" />}
            variant="outlined"
            fullWidth
          />
        </CardContent>
      </Card>
      
      {/* Active Templates Section */}
      {filteredActiveTemplates.length === 0 && !showArchived ? (
        <div className="text-center py-12 bg-smoke/10 dark:bg-smoke/20 rounded-lg">
          <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-electric-blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No saved templates yet</h3>
          <p className="md3-body-small text-navy/60 dark:text-white/60 mb-4">
            Create your first template to quickly reorder your favorite combinations
          </p>
          <Link href="/new-order" className="md-outlined-button">
            Create Your First Template
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Templates */}
          {filteredActiveTemplates.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Active Templates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredActiveTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} isArchived={false} />
                ))}
              </div>
            </div>
          )}

          {/* Archived Section - Trello Style */}
          <div className="border-t pt-6">
            <button
              onClick={handleToggleArchived}
              className="flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] transition-colors mb-4"
            >
              {showArchived ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <Archive className="w-4 h-4" />
              <span className="font-medium">
                Archived Templates {archivedTemplates.length > 0 && `(${archivedTemplates.length})`}
              </span>
              {loadingArchived && (
                <div className="w-4 h-4 border-2 border-[var(--md-sys-color-primary)] border-t-transparent rounded-full animate-spin ml-2" />
              )}
            </button>

            {showArchived && (
              <div>
                {filteredArchivedTemplates.length === 0 ? (
                  <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-600 mb-1">No archived templates</h3>
                    <p className="md3-body-small text-gray-500">
                      Templates you archive will appear here for future reference
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArchivedTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} isArchived={true} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}