'use client';

import { useState } from 'react';
import { Clock, Users, ChevronRight, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { MealTemplateComplete } from '@/lib/data/meal-templates-complete';
import TemplateDetailsModalEnhanced from './TemplateDetailsModalEnhanced';

interface OptimalTemplateCardProps {
  template: MealTemplateComplete;
}

export default function OptimalTemplateCard({ template }: OptimalTemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCartStore();

  const handleQuickAdd = async () => {
    setIsAdding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const baseItems = template.items?.filter(item => item.section === 'Base' && item.includedInBundle) || [];
    
    addItem({
      type: 'template',
      name: template.name,
      unitPrice: template.bundlePrice,
      quantity: 1,
      servings: template.servesCount,
      templateId: template.id,
      includedItems: baseItems.map(item => ({
        name: item.name,
        quantity: item.notes
      })),
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

  return (
    <>
      <div className="aspect-[4/5] bg-white dark:bg-navy border border-smoke/20 dark:border-smoke/30 rounded-xl hover:shadow-lg transition-all group flex flex-col">
        {/* Card Header with Price */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-base leading-tight text-navy dark:text-white flex-1 mr-2">
              {template.name}
            </h3>
            <span className="text-xl font-bold text-electric-blue whitespace-nowrap">
              ${template.bundlePrice.toLocaleString()}
            </span>
          </div>
          
          {/* Cuisine Badge */}
          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getCuisineColor(template.cuisine_type)}`}>
            {template.cuisine_type}
          </span>
        </div>

        {/* Card Body */}
        <div className="px-5 flex-1 flex flex-col">
          {/* Description */}
          <p className="text-sm text-navy/70 dark:text-white/70 mb-4 line-clamp-2">
            {template.description}
          </p>

          {/* Quick Info */}
          <div className="flex items-center gap-4 text-xs text-navy/50 dark:text-white/50 mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {template.servesCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {template.min_order_hours}h notice
            </span>
          </div>

          {/* Add-Ons Preview */}
          {(() => {
            const addOnItems = template.items?.filter(item => 
              item.section === 'Add-Ons / Alternatives' && !item.includedInBundle
            ) || [];
            
            return addOnItems.length > 0 && (
              <div className="mb-4 flex-1">
                <p className="text-xs font-medium text-navy/60 dark:text-white/60 mb-1.5">
                  Available add-ons:
                </p>
                <div className="flex flex-wrap gap-1">
                  {addOnItems.slice(0, 2).map((item, idx: number) => (
                    <span key={idx} className="text-xs px-2 py-0.5 bg-electric-blue/10 text-electric-blue rounded">
                      {item.name}
                    </span>
                  ))}
                  {addOnItems.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-smoke/20 dark:bg-smoke/30 text-navy/60 dark:text-white/60 rounded">
                      +{addOnItems.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Card Actions - Fixed at bottom */}
        <div className="p-5 pt-0 mt-auto">
          <div className="flex gap-2 relative">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 border border-electric-blue text-electric-blue rounded-lg text-sm font-medium hover:bg-electric-blue/5 transition-colors flex items-center justify-center"
            >
              View Details
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="flex-1 px-3 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="flex items-center justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Adding...
                </span>
              ) : (
                'Quick Add'
              )}
            </button>
            
            {/* Success indicator */}
            <div
              id={`added-${template.id}`}
              className="hidden absolute inset-0 bg-green-500 rounded-lg flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-white mr-1" />
              <span className="text-white font-medium">Added!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && (
        <TemplateDetailsModalEnhanced
          template={template}
          open={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
}