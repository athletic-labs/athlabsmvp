'use client';

import { useState, useEffect } from 'react';
import { Plus, ShoppingCart, X } from 'lucide-react';
import { ACTUAL_MENU_TEMPLATES } from '@/lib/data/actual-menu-templates';
import TemplateCard from '@/components/orders/TemplateCard';
import CartSidePanel from '@/components/orders/CartSidePanel';
import CreateTemplateModal from '@/components/templates/CreateTemplateModal';
import { useCartStore } from '@/lib/store/cart-store';

export default function NewOrderPage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const itemCount = cartItems.length; // Number of different items
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  return (
    <div className="min-h-screen bg-[var(--md-sys-color-surface-container-lowest)]">
      {/* Header */}
      <div className="bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] p-lg sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="md3-headline-large text-[var(--md-sys-color-on-surface)]" style={{ fontWeight: 500 }}>New Order</h1>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">12 templates available • Minimum order $500</p>
          </div>
          
          {/* Cart Toggle Button with Indicator */}
          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className={`relative p-md rounded-lg transition-standard ${
              itemCount > 0 
                ? 'text-white hover:opacity-90' 
                : 'hover:bg-[var(--md-sys-color-surface-container-low)]'
            }`}
            style={{
              backgroundColor: itemCount > 0 ? 'var(--md-sys-color-primary)' : 'transparent'
            }}
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <>
                <span 
                  className="absolute -top-2 -right-2 text-white md3-label-small rounded-full w-6 h-6 flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'var(--md-sys-color-error)',
                    fontWeight: 600 
                  }}
                >
                  {itemCount}
                </span>
                {/* Pulse animation for new items */}
                <span 
                  className="absolute -top-2 -right-2 rounded-full w-6 h-6 animate-ping opacity-75"
                  style={{ backgroundColor: 'var(--md-sys-color-error)' }}
                ></span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex relative">
        {/* Main Content - Adjust width when cart is open */}
        <div className={`flex-1 p-6 transition-all duration-300 ${
          isCartOpen ? 'lg:mr-96' : ''
        }`}>
          <div className="max-w-full">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <input
                type="search"
                placeholder="Search templates..."
                className="flex-1 px-4 py-2 border border-[var(--md-sys-color-outline)] rounded-lg focus:outline-none focus:border-[var(--md-sys-color-primary)]"
              />
              <select className="px-4 py-2 border border-[var(--md-sys-color-outline)] rounded-lg focus:outline-none focus:border-[var(--md-sys-color-primary)]">
                <option>All Cuisines</option>
                <option>Mediterranean</option>
                <option>Mexican</option>
                <option>Asian</option>
                <option>Italian</option>
                <option>Latin</option>
                <option>American</option>
                <option>Premium</option>
                <option>Breakfast</option>
              </select>
            </div>

            {/* Template Grid - Responsive columns */}
            <div className={`grid gap-4 ${
              isCartOpen 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {/* Create Your Own Card */}
              <div className="bg-[var(--md-sys-color-surface)] rounded-lg shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-[var(--md-sys-color-primary)]/30 min-h-[220px] max-h-[240px] cursor-pointer">
                <button
                  onClick={() => setShowCreateTemplate(true)}
                  className="w-full p-4 h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-12 h-12 bg-[var(--md-sys-color-primary)]/10 rounded-full flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-[var(--md-sys-color-primary)]" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">Create Your Own</h3>
                  <p className="text-xs text-gray-600">Build a custom template from individual items</p>
                </button>
              </div>
              
              {/* Template Cards */}
              {ACTUAL_MENU_TEMPLATES.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </div>

        {/* Side Cart Panel - Fixed position */}
        <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg transition-transform duration-300 z-30 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <CartSidePanel onClose={() => setIsCartOpen(false)} />
        </div>
      </div>

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