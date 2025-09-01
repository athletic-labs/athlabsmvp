'use client';

import { useState } from 'react';
import { Clock, Users, ChevronRight, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { MealTemplate } from '@/lib/data/meal-templates';
import TemplateDetailsModal from './TemplateDetailsModal';

interface OptimalTemplateCardProps {
  template: MealTemplate;
}

export default function OptimalTemplateCard({ template }: OptimalTemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();

  const handleQuickAdd = async () => {
    setIsAdding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
    
    setIsAdding(false);
    
    // Show success feedback
    const button = document.getElementById(`added-${template.id}`);
    if (button) {
      button.classList.remove('hidden');
      setTimeout(() => button.classList.add('hidden'), 2000);
    }
  };

  const getCuisineColor = (cuisine: string) => {
    const colors: Record<string, string> = {
      'Mediterranean': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'Mexican': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
      'Asian': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      'Italian': 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
      'Latin': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
      'American': 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      'Premium': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
      'Breakfast': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    };
    return colors[cuisine] || 'bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400';
  };

  // Get first 2 substitutable items to display
  const substitutableItems = template.substitutableItems || [];

  return (
    <>
      <div className="h-[280px] w-full bg-white dark:bg-navy border border-smoke/20 dark:border-smoke/30 rounded-xl hover:shadow-lg transition-all flex flex-col">
        {/* Card Header with Price */}
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm leading-tight text-navy dark:text-white flex-1 mr-2">
              {template.name}
            </h3>
            <span className="text-lg font-bold text-electric-blue whitespace-nowrap">
              ${template.bundle_price.toLocaleString()}
            </span>
          </div>
          
          {/* Cuisine Badge */}
          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getCuisineColor(template.cuisine_type)}`}>
            {template.cuisine_type}
          </span>
        </div>

        {/* Card Body */}
        <div className="px-4 flex-1 flex flex-col">
          {/* Description */}
          <p className="text-xs text-navy/70 dark:text-white/70 mb-2 line-clamp-2">
            {template.description}
          </p>

          {/* Quick Info */}
          <div className="flex items-center gap-3 text-xs text-navy/50 dark:text-white/50 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {template.serves_count}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {template.min_order_hours}h notice
            </span>
          </div>

          {/* Substitutable Items Preview */}
          {substitutableItems.length > 0 && (
            <div className="mb-2 flex-1">
              <p className="text-xs text-navy/60 dark:text-white/60">Available add-ons:</p>
              <div className="mt-1">
                {substitutableItems.slice(0, 2).map((item: string, idx: number) => (
                  <p key={idx} className="text-xs text-electric-blue">
                    {item}
                  </p>
                ))}
                {substitutableItems.length > 2 && (
                  <p className="text-xs text-navy/50 dark:text-white/50">
                    +{substitutableItems.length - 2} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Card Actions - Fixed at bottom */}
        <div className="p-4 pt-2 mt-auto">
          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-1.5 border border-electric-blue text-electric-blue rounded-lg text-xs font-medium hover:bg-electric-blue/5 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="flex-1 px-3 py-1.5 bg-electric-blue text-white rounded-lg text-xs font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Quick Add'}
            </button>
            
            {/* Success indicator */}
            <div
              id={`added-${template.id}`}
              className="hidden absolute inset-0 bg-green-500 rounded-lg flex items-center justify-center"
            >
              <span className="text-white text-xs font-medium">Added!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <TemplateDetailsModal
          template={template}
          open={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}