'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ShoppingCart, Clock, TrendingUp, Search, Star } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { TemplateService, SavedTemplate } from '@/lib/services/template-service';
import { useCartStore } from '@/lib/store/enhanced-cart-store';

export default function SavedTemplatesPage() {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCartStore();
  
  useEffect(() => {
    loadTemplates();
  }, []);
  
  const loadTemplates = async () => {
    try {
      const data = await TemplateService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await TemplateService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };
  
  const handleAddToCart = async (template: SavedTemplate) => {
    // Calculate total price from items
    const total = template.items.reduce((sum, item) => {
      const price = item.panSize === 'half' ? item.priceHalf : item.priceFull;
      return sum + (price * item.quantity);
    }, 0);
    
    // Calculate total servings
    const servings = template.items.reduce((sum, item) => {
      const serving = item.panSize === 'half' ? item.servingsHalf : item.servingsFull;
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
        name: item.name,
        quantity: `${item.quantity} ${item.panSize === 'half' ? 'Half' : 'Full'} Pan${item.quantity > 1 ? 's' : ''}`
      }))
    });
    
    // Update usage count
    await TemplateService.incrementUsage(template.id);
    
    toast.success('Added to cart');
  };
  
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <p className="text-sm text-navy/60 dark:text-white/60 mt-1">
            Your custom meal combinations ready to reorder
          </p>
        </div>
        <Link href="/new-order" className="md-filled-button flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Template
        </Link>
      </div>
      
      <div className="md-card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/50 dark:text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="Search saved templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md-text-field pl-10"
          />
        </div>
      </div>
      
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-smoke/10 dark:bg-smoke/20 rounded-lg">
          <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-electric-blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No saved templates yet</h3>
          <p className="text-sm text-navy/60 dark:text-white/60 mb-4">
            Create your first template to quickly reorder your favorite combinations
          </p>
          <Link href="/new-order" className="md-outlined-button">
            Create Your First Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-navy rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="p-1 hover:bg-red-500/10 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-navy/60 dark:text-white/60">
                  {template.items.length} items • {
                    template.items.reduce((sum, item) => {
                      const serving = item.panSize === 'half' ? item.servingsHalf : item.servingsFull;
                      return sum + (serving * item.quantity);
                    }, 0)
                  } total servings
                </p>
                
                {template.times_used > 0 && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    Used {template.times_used} time{template.times_used !== 1 ? 's' : ''}
                  </div>
                )}
                
                {template.last_used_at && (
                  <div className="flex items-center gap-2 text-xs text-navy/50 dark:text-white/50">
                    <Clock className="w-3 h-3" />
                    Last used {format(new Date(template.last_used_at), 'MMM d')}
                  </div>
                )}
              </div>
              
              {/* Show first few items */}
              <div className="mb-4 p-3 bg-smoke/10 dark:bg-smoke/20 rounded text-xs space-y-1">
                {template.items.slice(0, 3).map((item, idx) => (
                  <p key={idx} className="text-navy/70 dark:text-white/70">
                    • {item.name} ({item.quantity} {item.panSize})
                  </p>
                ))}
                {template.items.length > 3 && (
                  <p className="text-navy/50 dark:text-white/50">
                    +{template.items.length - 3} more items
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddToCart(template)}
                  className="flex-1 md-filled-button text-sm flex items-center justify-center"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}