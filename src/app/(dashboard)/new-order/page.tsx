'use client';

import { useState } from 'react';
import { Search, ShoppingCart, Plus } from 'lucide-react';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { MEAL_TEMPLATES } from '@/lib/data/meal-templates';
import TemplateCard from '@/components/orders/TemplateCard';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';

export default function NewOrderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const { toggleCart, itemCount } = useCartStore();
  
  // Get unique cuisine types
  const cuisineTypes = ['all', ...Array.from(new Set(MEAL_TEMPLATES.map(t => t.cuisine_type)))];
  
  // Filter templates
  const filteredTemplates = MEAL_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || template.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });
  
  // Group templates by category for better display
  const mainMealTemplates = filteredTemplates.filter(t => 
    !['Breakfast', 'Premium'].includes(t.cuisine_type)
  );
  const breakfastTemplates = filteredTemplates.filter(t => 
    t.cuisine_type === 'Breakfast'
  );
  const premiumTemplates = filteredTemplates.filter(t => 
    t.cuisine_type === 'Premium'
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">New Order</h1>
          <p className="text-navy/60 dark:text-white/60 mt-1">
            Choose from our premade templates or create your own custom combination
          </p>
        </div>
        
        <button 
          onClick={toggleCart}
          className="md-filled-button relative"
        >
          <ShoppingCart className="w-6 h-6" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-navy/50" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-smoke rounded-lg"
          />
        </div>
        <select
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
          className="px-4 py-2 border border-smoke rounded-lg"
        >
          {cuisineTypes.map(cuisine => (
            <option key={cuisine} value={cuisine}>
              {cuisine === 'all' ? 'All Cuisines' : cuisine}
            </option>
          ))}
        </select>
      </div>
      
      {/* Create Your Own Template Card */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Custom Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="bg-white dark:bg-navy rounded-lg shadow-lg p-6 hover:shadow-xl transition-all border-2 border-dashed border-electric-blue"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mb-3">
                <Plus className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="font-semibold text-lg">Create Your Own</h3>
              <p className="text-sm text-navy/60 dark:text-white/60 mt-1">
                Build a custom template
              </p>
            </div>
          </button>
        </div>
      </div>
      
      {/* Main Meal Templates (Templates 1-7) */}
      {mainMealTemplates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Main Meal Templates ({mainMealTemplates.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mainMealTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
      
      {/* Premium Template (Template 8) */}
      {premiumTemplates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Premium Experience
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {premiumTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
      
      {/* Breakfast Templates (Templates 9-11) */}
      {breakfastTemplates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            Breakfast Templates ({breakfastTemplates.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {breakfastTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
      
      {/* Show message if no templates found */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-navy/60 dark:text-white/60">
            No templates found matching your search
          </p>
        </div>
      )}
      
      {/* Total count */}
      <div className="mt-6 text-sm text-navy/60 dark:text-white/60 text-center">
        Showing {filteredTemplates.length} of {MEAL_TEMPLATES.length} templates
      </div>
      
      {/* Create Template Modal */}
      <CreateTemplateModal 
        open={showCreateTemplate} 
        onClose={() => setShowCreateTemplate(false)} 
      />
    </div>
  );
}