'use client';

import { useState } from 'react';
import { ShoppingCart, Users, Clock, Star, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { MealTemplate } from '@/lib/data/meal-templates';

interface TemplateCardProps {
  template: MealTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    addItem({
      type: 'template',
      name: template.name,
      unitPrice: template.bundle_price,
      quantity: 1,
      servings: template.serves_count,
      templateId: template.id,
      includedItems: template.includedItems?.map(item => ({
        name: item.name,
        quantity: item.quantity
      })) || [],
      notes: template.description
    });
    
    toast.success(`${template.name} added to cart`);
  };

  const getCuisineColor = (cuisine: string) => {
    const colors: Record<string, string> = {
      Mediterranean: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      Mexican: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      Asian: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      Italian: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      Latin: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      American: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      Premium: 'bg-gold-100 text-gold-800 dark:bg-gold-900/30 dark:text-gold-300',
      Breakfast: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colors[cuisine] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="bg-white dark:bg-navy rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 border border-smoke/20 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              {template.cuisine_type === 'Premium' && (
                <Star className="w-4 h-4 text-gold-500 fill-current" />
              )}
            </div>
            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getCuisineColor(template.cuisine_type)}`}>
              {template.cuisine_type}
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-electric-blue">${template.bundle_price.toFixed(2)}</p>
            <p className="text-xs text-navy/60 dark:text-white/60">for {template.serves_count} people</p>
          </div>
        </div>
        
        <p className="text-sm text-navy/70 dark:text-white/70 mb-4">
          {template.description}
        </p>
        
        {/* Key Info */}
        <div className="flex items-center gap-4 text-xs text-navy/60 dark:text-white/60 mb-4">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>Serves {template.serves_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{template.min_order_hours}h notice</span>
          </div>
        </div>
        
        {/* Substitutable Items Preview */}
        {template.substitutableItems && template.substitutableItems.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-navy/80 dark:text-white/80 mb-1">
              Customizable:
            </p>
            <div className="flex flex-wrap gap-1">
              {template.substitutableItems.slice(0, 2).map((item, idx) => (
                <span key={idx} className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs rounded">
                  {item}
                </span>
              ))}
              {template.substitutableItems.length > 2 && (
                <span className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                  +{template.substitutableItems.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Expandable Details */}
      {showDetails && template.includedItems && (
        <div className="border-t border-smoke/20 p-6 pt-4">
          <h4 className="font-medium text-sm mb-3">Included Items:</h4>
          <div className="space-y-2">
            {template.includedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className={item.canSubstitute ? 'text-red-600 dark:text-red-400' : ''}>
                  {item.name}
                  {item.canSubstitute && <span className="text-xs ml-1">(customizable)</span>}
                </span>
                <span className="text-navy/60 dark:text-white/60">{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="p-6 pt-0">
        <div className="flex gap-2">
          {template.includedItems && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex-1 md-outlined-button text-sm flex items-center justify-center"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
          )}
          <button
            onClick={handleAddToCart}
            className="flex-1 md-filled-button text-sm flex items-center justify-center"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}