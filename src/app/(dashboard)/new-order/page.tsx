'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ShoppingCart, Plus } from 'lucide-react';
import { useSupabase } from '@/lib/supabase/client';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';
import CustomizeTemplateModal from '@/components/templates/CustomizeTemplateModal';

export default function NewOrderPage() {
  const { supabase } = useSupabase();
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const { items: cartItems, addItem: addToCart, toggleCart, itemCount } = useCartStore();

  const CUISINES = [
    { value: 'all', label: 'All Cuisines' },
    { value: 'mediterranean', label: 'Mediterranean' },
    { value: 'mexican', label: 'Mexican' },
    { value: 'asian', label: 'Asian' },
    { value: 'italian', label: 'Italian' },
    { value: 'american', label: 'American' },
    { value: 'breakfast', label: 'Breakfast' }
  ];

  const SAMPLE_TEMPLATES = [
    { id: '1', name: 'BYO MED BOWL', cuisine_type: 'Mediterranean', bundle_price: 2940, serves_count: 60 },
    { id: '2', name: 'BYO BURRITO BOWL', cuisine_type: 'Mexican', bundle_price: 2400, serves_count: 60 },
    { id: '3', name: 'BYO ASIAN BOWL', cuisine_type: 'Asian', bundle_price: 2600, serves_count: 60 },
    { id: '4', name: 'LITTLE ITALY', cuisine_type: 'Italian', bundle_price: 3200, serves_count: 60 },
    { id: '5', name: 'THE CHOPHOUSE', cuisine_type: 'American', bundle_price: 3800, serves_count: 60 },
    { id: '6', name: 'BREAKFAST ESSENTIALS', cuisine_type: 'Breakfast', bundle_price: 1800, serves_count: 60 }
  ];

  useEffect(() => {
    setTemplates(SAMPLE_TEMPLATES);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || 
                           template.cuisine_type.toLowerCase() === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  const handleCustomizeTemplate = (template: any) => {
    setSelectedTemplate(template);
    setCustomizeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">New Order</h1>
          <p className="text-navy/60 dark:text-white/60 mt-1">
            Choose from our premade templates or build your own
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

      <div className="md-card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-navy/50 dark:text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="md-text-field pl-10"
            />
          </div>
          
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="md-text-field lg:w-48"
          >
            {CUISINES.map(cuisine => (
              <option key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Meal Templates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            onClick={() => setCreateModalOpen(true)}
            className="md-card border-2 border-dashed border-electric-blue/50 hover:border-electric-blue cursor-pointer transition-colors"
          >
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-electric-blue" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Your Own</h3>
              <p className="text-sm text-navy/60 dark:text-white/60 text-center">
                Build a custom template with any items from our menu
              </p>
            </div>
          </div>
          
          {filteredTemplates.map(template => (
            <div key={template.id} className="md-card hover:shadow-md-elevation-2 transition-shadow">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-1 bg-electric-blue/10 text-electric-blue rounded-full">
                      {template.cuisine_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete meal package with proteins, sides, and beverages
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-electric-blue">
                      ${template.bundle_price.toLocaleString()}
                    </p>
                    <p className="text-xs text-navy/60 dark:text-white/60">
                      Serves {template.serves_count} people
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart({
                      type: 'template',
                      templateId: template.id,
                      name: template.name,
                      quantity: 1,
                      unitPrice: template.bundle_price,
                      servings: template.serves_count,
                      includedItems: [
                        { name: 'Grilled Chicken Breast', quantity: '2 full pans' },
                        { name: 'Quinoa Power Bowl Base', quantity: '1 full pan' },
                        { name: 'Fresh Garden Salad Mix', quantity: '2 full pans' },
                        { name: 'Recovery Smoothie Base', quantity: '60 servings' }
                      ]
                    })}
                    className="md-filled-button flex-1 text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleCustomizeTemplate({
                      id: template.id,
                      name: template.name,
                      price: template.bundle_price,
                      servings: template.serves_count,
                      items: [
                        { id: 'item_001', name: 'Grilled Chicken Breast', category: 'Protein', quantity: '2', panSize: 'full', canSubstitute: true },
                        { id: 'item_002', name: 'Quinoa Power Bowl Base', category: 'Grain', quantity: '1', panSize: 'full', canSubstitute: true },
                        { id: 'item_003', name: 'Fresh Garden Salad Mix', category: 'Vegetable', quantity: '2', panSize: 'full', canSubstitute: true },
                        { id: 'item_004', name: 'Recovery Smoothie Base', category: 'Beverage', quantity: '60', panSize: 'full', canSubstitute: true }
                      ]
                    })}
                    className="md-outlined-button text-sm px-3"
                    title="Customize this template"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Template Modal */}
      <CreateTemplateModal 
        open={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
      />

      {/* Customize Template Modal */}
      <CustomizeTemplateModal 
        open={customizeModalOpen} 
        onClose={() => setCustomizeModalOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
}