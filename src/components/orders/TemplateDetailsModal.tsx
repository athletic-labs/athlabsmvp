'use client';

import { useState } from 'react';
import { X, Check, Clock, Users, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { MealTemplateComplete } from '@/lib/data/templates-with-items';

interface TemplateDetailsModalProps {
  template: MealTemplateComplete;
  open: boolean;
  onClose: () => void;
}

export default function TemplateDetailsModal({ template, open, onClose }: TemplateDetailsModalProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedSubstitutions, setSelectedSubstitutions] = useState<Record<string, string>>({});
  
  const handleAddToCart = () => {
    addItem({
      type: 'template',
      name: template.name,
      unitPrice: template.bundle_price,
      quantity: quantity,
      servings: template.serves_count * quantity,
      templateId: template.id,
      includedItems: template.items?.map(item => ({
        name: item.name,
        quantity: '1'
      })) || [],
      substitutions: Object.entries(selectedSubstitutions).map(([original, replacement]) => ({
        original,
        replacement
      })),
      notes: template.description
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-[10%] bottom-[10%] max-w-3xl mx-auto bg-white dark:bg-navy rounded-xl shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-smoke dark:border-smoke/30">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-white">{template.name}</h2>
                <p className="text-sm text-navy/60 dark:text-white/60 mt-1">
                  {template.cuisine_type} • ${template.bundle_price.toLocaleString()} per order
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-smoke/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Description */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-navy/70 dark:text-white/70">{template.description}</p>
              </div>
              
              {/* What's Included */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">What's Included</h3>
                <div className="space-y-2">
                  {template.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-smoke/10 dark:bg-smoke/20 rounded-lg">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">
                        {item.name} <span className="text-navy/60 dark:text-white/60">({item.category})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Order Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-electric-blue/5 dark:bg-electric-blue/10 rounded-lg">
                <div>
                  <p className="text-xs text-navy/60 dark:text-white/60 mb-1">Serves</p>
                  <p className="font-semibold">{template.serves_count} people</p>
                </div>
                <div>
                  <p className="text-xs text-navy/60 dark:text-white/60 mb-1">Notice Required</p>
                  <p className="font-semibold">{template.min_order_hours} hours</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-smoke dark:border-smoke/30 bg-smoke/5 dark:bg-smoke/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-navy/60 dark:text-white/60">Quantity</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded hover:bg-smoke/10"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-navy border border-smoke dark:border-smoke/30 rounded hover:bg-smoke/10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-navy/60 dark:text-white/60">Total Price</p>
                  <p className="text-2xl font-bold text-electric-blue">
                    ${(template.bundle_price * quantity).toLocaleString()}
                  </p>
                  <p className="text-xs text-navy/50 dark:text-white/50">
                    Serves {template.serves_count * quantity} people
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="w-full py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}