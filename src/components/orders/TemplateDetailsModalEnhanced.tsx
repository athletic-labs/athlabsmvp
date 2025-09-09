'use client';

import { useState } from 'react';
import { X, Check, Plus, Minus, Info, DollarSign, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store/cart-store';
import { MealTemplate } from '@/lib/data/actual-menu-templates';

interface TemplateDetailsModalEnhancedProps {
  template: MealTemplate;
  open: boolean;
  onClose: () => void;
}

export default function TemplateDetailsModalEnhanced({ template, open, onClose }: TemplateDetailsModalEnhancedProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [addOnQuantities, setAddOnQuantities] = useState<Record<string, number>>({});
  const [removedBaseItems, setRemovedBaseItems] = useState<Set<string>>(new Set());
  
  // Get base items and add-ons
  const baseItems = template.items?.filter(item => item.section === 'Base' && item.includedInBundle) || [];
  const addOnItems = template.items?.filter(item => item.section === 'Add-Ons / Alternatives' && !item.includedInBundle) || [];
  
  // Toggle base item removal
  const toggleBaseItem = (itemName: string) => {
    const newRemoved = new Set(removedBaseItems);
    if (newRemoved.has(itemName)) {
      newRemoved.delete(itemName);
    } else {
      newRemoved.add(itemName);
    }
    setRemovedBaseItems(newRemoved);
  };
  
  const toggleAddOn = (itemName: string) => {
    const newSelected = new Set(selectedAddOns);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
      const newQuantities = { ...addOnQuantities };
      delete newQuantities[itemName];
      setAddOnQuantities(newQuantities);
    } else {
      newSelected.add(itemName);
      setAddOnQuantities({ ...addOnQuantities, [itemName]: 1 });
    }
    setSelectedAddOns(newSelected);
  };
  
  const updateAddOnQuantity = (itemName: string, qty: number) => {
    if (qty <= 0) {
      toggleAddOn(itemName);
    } else {
      setAddOnQuantities({ ...addOnQuantities, [itemName]: qty });
    }
  };
  
  const calculateAddOnsTotal = () => {
    let total = 0;
    selectedAddOns.forEach(itemName => {
      const item = addOnItems.find(i => i.name === itemName);
      if (item?.priceIfAddOn) {
        total += item.priceIfAddOn * (addOnQuantities[itemName] || 1);
      }
    });
    return total;
  };
  
  const calculateTotal = () => {
    return (template.bundlePrice * quantity) + calculateAddOnsTotal();
  };
  
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  const handleAddToCart = () => {
    const selectedAddOnDetails = Array.from(selectedAddOns).map(itemName => {
      const item = addOnItems.find(i => i.name === itemName);
      return {
        name: itemName,
        quantity: addOnQuantities[itemName] || 1,
        price: item?.priceIfAddOn || 0
      };
    });
    
    const activeBaseItems = baseItems.filter(item => !removedBaseItems.has(item.name));
    
    addItem({
      type: 'template',
      name: template.name,
      unitPrice: template.bundlePrice,
      quantity: quantity,
      servings: template.servesCount * quantity,
      includedItems: activeBaseItems.map(item => ({
        name: item.name,
        quantity: item.notes || '1'
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
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white dark:bg-navy rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-smoke dark:border-smoke/30">
              <div>
                <h2 className="text-2xl font-semibold text-navy dark:text-white">{template.name}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <span className="md3-body-small text-navy/60 dark:text-white/60">
                    Base Price: {formatPrice(template.bundlePrice)}
                  </span>
                  <span className="md3-body-small text-navy/60 dark:text-white/60">•</span>
                  <span className="md3-body-small text-navy/60 dark:text-white/60">
                    Serves {template.servesCount}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-smoke/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Exchange Info Banner */}
            <div className="px-6 py-3 bg-electric-blue/10 border-b border-electric-blue/20">
              <div className="flex items-center gap-2 md3-body-small">
                <ArrowRight className="w-4 h-4 text-electric-blue" />
                <span className="text-navy dark:text-white">
                  You can remove items from the left and add alternatives from the right
                </span>
              </div>
            </div>
            
            {/* Content - Two Column Layout */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column - What's Included */}
              <div className="flex-1 p-6 overflow-y-auto border-r border-smoke dark:border-smoke/30">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  What's Included
                </h3>
                <p className="md3-label-small text-navy/60 dark:text-white/60 mb-4">
                  Click to remove items you don't want
                </p>
                
                <div className="space-y-2">
                  {baseItems.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => toggleBaseItem(item.name)}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        removedBaseItems.has(item.name)
                          ? 'bg-red-50/50 dark:bg-red-900/10 opacity-60 line-through'
                          : 'bg-green-50/50 dark:bg-green-900/10 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      <div className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        removedBaseItems.has(item.name) ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {removedBaseItems.has(item.name) ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className={`md3-body-small font-medium text-navy dark:text-white ${
                          removedBaseItems.has(item.name) ? 'opacity-60' : ''
                        }`}>
                          {item.name}
                        </p>
                        {item.notes && (
                          <p className="md3-label-small text-navy/60 dark:text-white/60 mt-0.5">
                            Quantity: {item.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Column - Add-Ons */}
              <div className="flex-1 p-6 overflow-y-auto bg-smoke/5 dark:bg-smoke/10">
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-electric-blue" />
                  Available Add-Ons / Alternatives
                </h3>
                <p className="md3-label-small text-navy/60 dark:text-white/60 mb-4">
                  Add items or use as replacements
                </p>
                
                {addOnItems.length === 0 ? (
                  <div className="text-center py-8 text-navy/60 dark:text-white/60">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="md3-body-small">No add-ons available for this template</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {addOnItems.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedAddOns.has(item.name)
                            ? 'border-electric-blue bg-electric-blue/10'
                            : 'border-smoke/30 dark:border-smoke/50 hover:border-electric-blue/50'
                        }`}
                        onClick={() => toggleAddOn(item.name)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            selectedAddOns.has(item.name)
                              ? 'bg-electric-blue border-electric-blue'
                              : 'border-smoke dark:border-smoke/50'
                          }`}>
                            {selectedAddOns.has(item.name) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="md3-body-small font-medium text-navy dark:text-white">
                              {item.name}
                            </p>
                            <p className="md3-label-small text-electric-blue font-medium mt-0.5">
                              +{formatPrice(item.priceIfAddOn || 0)}
                            </p>
                          </div>
                          {selectedAddOns.has(item.name) && (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => updateAddOnQuantity(item.name, (addOnQuantities[item.name] || 1) - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-smoke/20 rounded"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center md3-body-small font-medium">
                                {addOnQuantities[item.name] || 1}
                              </span>
                              <button
                                onClick={() => updateAddOnQuantity(item.name, (addOnQuantities[item.name] || 1) + 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-smoke/20 rounded"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer with Pricing */}
            <div className="p-6 border-t border-smoke dark:border-smoke/30 bg-white dark:bg-navy">
              <div className="flex items-end justify-between">
                {/* Quantity Selector */}
                <div>
                  <p className="md3-body-small text-navy/60 dark:text-white/60 mb-2">Bundle Quantity</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center bg-smoke/10 hover:bg-smoke/20 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-smoke/10 hover:bg-smoke/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Price Breakdown and Add to Cart */}
                <div className="flex items-end gap-6">
                  <div className="text-right">
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-end gap-4 md3-body-small">
                      <span className="text-navy/60 dark:text-white/60">Bundle ({quantity}x):</span>
                      <span>{formatPrice(template.bundlePrice * quantity)}</span>
                    </div>
                    {selectedAddOns.size > 0 && (
                      <div className="flex items-center justify-end gap-4 md3-body-small">
                        <span className="text-navy/60 dark:text-white/60">Add-ons:</span>
                        <span className="text-electric-blue">+{formatPrice(calculateAddOnsTotal())}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-4 pt-3 border-t border-smoke dark:border-smoke/30">
                    <span className="md3-body-small font-medium">Total:</span>
                    <span className="text-2xl font-bold text-electric-blue">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                  <p className="md3-label-small text-navy/50 dark:text-white/50 mt-1">
                    Serves {template.servesCount * quantity} people
                  </p>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="px-8 py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}