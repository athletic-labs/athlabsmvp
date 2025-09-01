'use client';

import { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import TemplateDetailsModalEnhanced from './TemplateDetailsModalEnhanced';
import { MealTemplate } from '@/lib/data/actual-menu-templates';

interface TemplateCardProps {
  template: MealTemplate;
}

export default function OptimalTemplateCard({ template }: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const { addItem } = useCartStore();
  
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  const handleQuickAdd = async () => {
    setIsQuickAdding(true);
    const baseItems = template.items?.filter(item => item.section === 'Base' && item.includedInBundle) || [];
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addItem({
      type: 'template',
      name: template.name,
      quantity: 1,
      unitPrice: template.bundlePrice,
      servings: template.servesCount,
      templateId: template.id,
      includedItems: baseItems.map(item => ({
        name: item.name,
        quantity: item.notes
      })),
      notes: template.description
    });
    
    setIsQuickAdding(false);
  };
  
  const getCuisineColor = (type: string) => {
    const colors: Record<string, string> = {
      'Mediterranean': 'text-blue-600 bg-blue-50',
      'Mexican': 'text-orange-600 bg-orange-50',
      'Asian': 'text-purple-600 bg-purple-50',
      'Italian': 'text-green-600 bg-green-50',
      'Latin': 'text-red-600 bg-red-50',
      'American': 'text-red-700 bg-red-50',
      'Premium': 'text-purple-700 bg-purple-50',
      'Breakfast': 'text-amber-600 bg-amber-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  return (
    <>
      <div className="bg-white dark:bg-navy-light rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col min-h-[320px]">
        <div className="p-5 flex-1 flex flex-col">
          {/* Header with title and price */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-base leading-tight flex-1">
              {template.name}
            </h3>
            <span className="text-xl font-bold text-electric-blue ml-2 whitespace-nowrap">
              {formatPrice(template.bundlePrice)}
            </span>
          </div>
          
          {/* Cuisine Type Badge */}
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getCuisineColor(template.cuisineType)} mb-3 self-start`}>
            {template.cuisineType}
          </span>
          
          {/* Description - flexible height */}
          <p className="text-sm text-navy/70 dark:text-white/70 mb-4 flex-1 line-clamp-2">
            {template.description || `${template.cuisineType} cuisine for your team`}
          </p>
          
          {/* Info Row */}
          <div className="flex items-center gap-4 text-xs text-navy/60 dark:text-white/60 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{template.servesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{template.minOrderHours}h notice</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-2 border border-electric-blue text-electric-blue rounded-lg text-sm font-medium hover:bg-electric-blue/5 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isQuickAdding}
              className="flex-1 px-3 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-70"
            >
              {isQuickAdding ? 'Adding...' : 'Quick Add'}
            </button>
          </div>
        </div>
      </div>
      
      <TemplateDetailsModalEnhanced
        template={template}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}