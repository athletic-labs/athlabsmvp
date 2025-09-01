'use client';

import { useState } from 'react';
import { Plus, Search, Info, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { MEAL_TEMPLATES } from '@/lib/data/meal-templates';
import OptimalTemplateCard from '@/components/orders/OptimalTemplateCard';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';
import CartDrawer from '@/components/cart/CartDrawer';
import CartSummaryPanel from '@/components/cart/CartSummaryPanel';
import { useCartStore } from '@/lib/store/enhanced-cart-store';

// Cart Button Component
function CartButton() {
  const [showCart, setShowCart] = useState(false);
  const { itemCount, subtotal } = useCartStore();

  return (
    <>
      <button
        onClick={() => setShowCart(true)}
        className="relative p-2.5 bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded-lg hover:shadow-md transition-all group"
      >
        <ShoppingCart className="w-5 h-5 text-navy dark:text-white group-hover:text-electric-blue transition-colors" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-electric-blue text-white text-xs font-medium rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
        {subtotal > 0 && (
          <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-navy/60 dark:text-white/60 whitespace-nowrap">
            ${subtotal.toLocaleString()}
          </span>
        )}
      </button>
      
      {/* Cart Drawer */}
      <CartDrawer open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}

export default function NewOrderPage() {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  
  const { itemCount, subtotal } = useCartStore();
  
  const cuisineTypes = ['all', ...Array.from(new Set(MEAL_TEMPLATES.map(t => t.cuisine_type)))];
  
  const filteredTemplates = MEAL_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'all' || template.cuisine_type === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="min-h-screen bg-smoke/5 dark:bg-navy/95">
      {/* Sticky Header with Context */}
      <div className="bg-white dark:bg-navy border-b border-smoke dark:border-smoke/30 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-navy dark:text-white">New Order</h1>
              <p className="text-sm text-navy/60 dark:text-white/60 mt-0.5">
                {filteredTemplates.length + 1} templates available • Minimum order $500
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-navy/50" />
                <span className="text-navy/60 dark:text-white/60 hidden md:inline">All templates serve 60 people</span>
              </div>
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/50 transition-all"
            />
          </div>
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-blue/50"
          >
            {cuisineTypes.map(cuisine => (
              <option key={cuisine} value={cuisine}>
                {cuisine === 'all' ? 'All Cuisines' : cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Templates Grid - Fixed sizing, no stretching */}
        <div className="flex gap-6">
          {/* Main Templates Area */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1200px]">
              {/* Create Your Own - Always First */}
              <button
                onClick={() => setShowCreateTemplate(true)}
                className="h-[240px] w-full max-w-[280px] bg-white dark:bg-navy border-2 border-dashed border-electric-blue/50 hover:border-electric-blue rounded-xl hover:shadow-lg transition-all group"
              >
                <div className="h-full flex flex-col items-center justify-center p-4">
                  <div className="w-14 h-14 bg-electric-blue/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-electric-blue/20 transition-colors">
                    <Plus className="w-7 h-7 text-electric-blue" />
                  </div>
                  <h3 className="font-semibold text-base text-navy dark:text-white mb-1">
                    Create Your Own
                  </h3>
                  <p className="text-xs text-navy/60 dark:text-white/60 text-center">
                    Build a custom template from individual items
                  </p>
                </div>
              </button>

              {/* Template Cards */}
              {filteredTemplates.map((template) => (
                <div key={template.id} className="w-full max-w-[280px]">
                  <OptimalTemplateCard template={template} />
                </div>
              ))}
            </div>
          </div>

          {/* Persistent Cart Summary Panel - Desktop Only */}
          <div className="hidden xl:block w-80 sticky top-24 h-fit flex-shrink-0">
            <CartSummaryPanel onViewCart={() => setShowCart(true)} />
          </div>
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-navy/60 dark:text-white/60">
              No templates found matching "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-electric-blue hover:underline text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>

      {/* Floating Cart Summary (shows when items in cart) */}
      {itemCount > 0 && !showCart && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-6 right-6 bg-white dark:bg-navy shadow-xl rounded-lg p-4 z-20 border border-smoke dark:border-smoke/30 xl:hidden"
        >
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-navy dark:text-white">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
              </p>
              <p className="text-lg font-bold text-electric-blue">
                ${subtotal.toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="px-4 py-2 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 transition-colors flex items-center gap-2"
            >
              View Cart
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <CreateTemplateModal
          open={showCreateTemplate}
          onClose={() => setShowCreateTemplate(false)}
        />
      )}
    </div>
  );
}