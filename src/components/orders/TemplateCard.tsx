'use client';

import { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import TemplateDetailsModalEnhanced from './TemplateDetailsModalEnhanced';
import { MealTemplate } from '@/lib/data/actual-menu-templates';

interface TemplateCardProps {
  template: MealTemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };
  
  const handleQuickAdd = async () => {
    setIsQuickAdding(true);
    const baseItems = template.items?.filter(item => item.section === 'Base' && item.includedInBundle) || [];
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addToCart({
      type: 'template',
      name: template.name,
      quantity: 1,
      unitPrice: template.bundlePrice,
      servings: template.servesCount,
      includedItems: baseItems.map(item => ({
        name: item.name,
        quantity: item.notes
      }))
    });
    
    setIsQuickAdding(false);
  };
  
  const getCuisineColor = (type: string) => {
    const colors: Record<string, string> = {
      'Mediterranean': 'text-blue-600',
      'Mexican': 'text-orange-600',
      'Asian': 'text-purple-600',
      'Italian': 'text-green-600',
      'Latin': 'text-red-600',
      'American': 'text-red-700',
      'Premium': 'text-purple-700',
      'Breakfast': 'text-amber-600'
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-full flex flex-col min-h-[220px] max-h-[240px]">
        <div className="p-4 flex-1 flex flex-col">
          {/* Compact Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-sm leading-tight flex-1">
              {template.name}
            </h3>
            <span className="text-lg font-bold text-electric-blue ml-2 whitespace-nowrap">
              ${formatPrice(template.bundlePrice)}
            </span>
          </div>
          
          {/* Cuisine Badge */}
          <p className={`text-xs font-medium mb-2 ${getCuisineColor(template.cuisineType)}`}>
            {template.cuisineType}
          </p>
          
          {/* Compact Description */}
          <p className="text-xs text-gray-600 mb-3 flex-1 line-clamp-2">
            {template.description}
          </p>
          
          {/* Info Row */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{template.servesCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{template.minOrderHours}h notice</span>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 px-3 py-1.5 border border-electric-blue text-electric-blue rounded-lg text-xs font-medium hover:bg-electric-blue/5 transition-colors"
            >
              View Details
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={isQuickAdding}
              className="flex-1 px-3 py-1.5 bg-electric-blue text-white rounded-lg text-xs font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-70"
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