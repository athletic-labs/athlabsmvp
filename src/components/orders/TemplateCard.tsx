'use client';

import { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import TemplateDetailsModalEnhanced from './TemplateDetailsModalEnhanced';
import { MealTemplate } from '@/lib/data/actual-menu-templates';
import { Card, CardContent, Button, Chip } from '@/lib/design-system/components';

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
  
  const getCuisineVariant = (type: string): 'assist' | 'filter' | 'input' | 'suggestion' => {
    // Use consistent 'assist' variant for all cuisine types for visual consistency
    return 'assist';
  };

  return (
    <>
      <Card variant="elevated" className="h-full flex flex-col min-h-[220px] max-h-[240px] hover:shadow-lg transition-shadow">
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Compact Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="md3-title-medium font-semibold leading-tight flex-1 text-[var(--md-sys-color-on-surface)]">
              {template.name}
            </h3>
            <span className="md3-headline-small font-bold text-[var(--md-sys-color-primary)] ml-2 whitespace-nowrap">
              ${formatPrice(template.bundlePrice)}
            </span>
          </div>
          
          {/* Cuisine Badge */}
          <Chip variant={getCuisineVariant(template.cuisineType)} size="small" className="mb-2 self-start">
            {template.cuisineType}
          </Chip>
          
          {/* Compact Description */}
          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-3 flex-1 line-clamp-2">
            {template.description}
          </p>
          
          {/* Info Row */}
          <div className="flex items-center gap-3 md3-body-small text-[var(--md-sys-color-on-surface-variant)] mb-3">
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
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setShowDetails(true)}
              variant="outlined"
              size="small"
              className="flex-1 min-w-0"
            >
              View Details
            </Button>
            <Button
              onClick={handleQuickAdd}
              disabled={isQuickAdding}
              variant="filled"
              size="small"
              className="flex-1 min-w-0"
            >
              {isQuickAdding ? 'Adding...' : 'Quick Add'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <TemplateDetailsModalEnhanced
        template={template}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}