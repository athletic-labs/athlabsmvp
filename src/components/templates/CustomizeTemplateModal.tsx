'use client';

import { useState, useEffect } from 'react';
import { X, Replace, ArrowRight, Check, AlertTriangle, Utensils, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store/cart-store';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
  panSize: 'half' | 'full';
  canSubstitute: boolean;
  substitutes?: Array<{
    id: string;
    name: string;
    priceAdjustment: number;
  }>;
}

interface Substitution {
  originalItemId: string;
  substituteItemId: string;
  originalName: string;
  substituteName: string;
  priceAdjustment: number;
}

interface CustomizeTemplateModalProps {
  open: boolean;
  onClose: () => void;
  template?: {
    id: string;
    name: string;
    price: number;
    servings: number;
    items: TemplateItem[];
  };
}

export default function CustomizeTemplateModal({ open, onClose, template }: CustomizeTemplateModalProps) {
  const { addItem } = useCartStore();
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [notes, setNotes] = useState('');
  const [servingSize, setServingSize] = useState(template?.servings || 60);

  // Mock template data if none provided
  const defaultTemplate = {
    id: 'template_001',
    name: 'Mediterranean Power Bowl',
    price: 2940,
    servings: 60,
    items: [
      {
        id: 'item_001',
        name: 'Grilled Chicken Breast',
        category: 'Protein',
        quantity: '2',
        panSize: 'full' as const,
        canSubstitute: true,
        substitutes: [
          { id: 'sub_001', name: 'Grilled Salmon', priceAdjustment: 15 },
          { id: 'sub_002', name: 'Plant-Based Protein', priceAdjustment: -5 },
          { id: 'sub_003', name: 'Turkey Breast', priceAdjustment: 0 }
        ]
      },
      {
        id: 'item_002',
        name: 'Quinoa Power Bowl Base',
        category: 'Grain',
        quantity: '1',
        panSize: 'full' as const,
        canSubstitute: true,
        substitutes: [
          { id: 'sub_004', name: 'Brown Rice Base', priceAdjustment: -10 },
          { id: 'sub_005', name: 'Wild Rice Pilaf', priceAdjustment: 5 },
          { id: 'sub_006', name: 'Cauliflower Rice', priceAdjustment: 0 }
        ]
      },
      {
        id: 'item_003',
        name: 'Fresh Garden Salad Mix',
        category: 'Vegetable',
        quantity: '2',
        panSize: 'full' as const,
        canSubstitute: true,
        substitutes: [
          { id: 'sub_007', name: 'Roasted Seasonal Vegetables', priceAdjustment: 8 },
          { id: 'sub_008', name: 'Mediterranean Couscous Salad', priceAdjustment: 12 },
          { id: 'sub_009', name: 'Greek Village Salad', priceAdjustment: 15 }
        ]
      },
      {
        id: 'item_004',
        name: 'Recovery Smoothie Base',
        category: 'Beverage',
        quantity: '60',
        panSize: 'full' as const,
        canSubstitute: true,
        substitutes: [
          { id: 'sub_010', name: 'Fresh Fruit Infused Water', priceAdjustment: -20 },
          { id: 'sub_011', name: 'Protein Shake Bar', priceAdjustment: 25 },
          { id: 'sub_012', name: 'Green Juice Cleanse', priceAdjustment: 30 }
        ]
      }
    ]
  };

  const currentTemplate = template || defaultTemplate;

  const addSubstitution = (originalItemId: string, substitute: { id: string; name: string; priceAdjustment: number }) => {
    const originalItem = currentTemplate.items.find(item => item.id === originalItemId);
    if (!originalItem) return;

    setSubstitutions(prev => {
      const filtered = prev.filter(sub => sub.originalItemId !== originalItemId);
      return [...filtered, {
        originalItemId,
        substituteItemId: substitute.id,
        originalName: originalItem.name,
        substituteName: substitute.name,
        priceAdjustment: substitute.priceAdjustment
      }];
    });
  };

  const removeSubstitution = (originalItemId: string) => {
    setSubstitutions(prev => prev.filter(sub => sub.originalItemId !== originalItemId));
  };

  const calculateAdjustedPrice = () => {
    const basePrice = currentTemplate.price;
    const substitutionAdjustments = substitutions.reduce((total, sub) => total + sub.priceAdjustment, 0);
    const servingAdjustment = (servingSize / currentTemplate.servings - 1) * basePrice * 0.1;
    return basePrice + substitutionAdjustments + servingAdjustment;
  };

  const handleAddToCart = () => {
    const adjustedPrice = calculateAdjustedPrice();
    
    addItem({
      type: 'template',
      templateId: currentTemplate.id,
      name: `${currentTemplate.name}${substitutions.length > 0 ? ' (Customized)' : ''}`,
      quantity: 1,
      unitPrice: adjustedPrice,
      servings: servingSize,
      includedItems: currentTemplate.items.map(item => {
        const substitution = substitutions.find(sub => sub.originalItemId === item.id);
        return {
          name: substitution ? substitution.substituteName : item.name,
          quantity: `${item.quantity} ${item.panSize} pan${parseInt(item.quantity) > 1 ? 's' : ''}`
        };
      }),
      substitutions: substitutions.map(sub => ({
        original: sub.originalName,
        replacement: sub.substituteName
      })),
      notes
    });

    onClose();
    setSubstitutions([]);
    setNotes('');
    setServingSize(currentTemplate.servings);
  };

  const resetModal = () => {
    setSubstitutions([]);
    setNotes('');
    setServingSize(currentTemplate.servings);
  };

  useEffect(() => {
    if (!open) {
      resetModal();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col max-h-screen"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-2xl font-bold">Customize Template</h2>
                <p className="md3-body-small text-gray-600 dark:text-gray-400 mt-1">
                  {currentTemplate.name} - Make substitutions to fit your team's needs
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Serving Size Adjustment */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Adjust Serving Size</h3>
                </div>
                <div className="flex items-center gap-4">
                  <label className="md3-body-small font-medium">People to serve:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setServingSize(Math.max(12, servingSize - 12))}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-bold">{servingSize}</span>
                    <button
                      onClick={() => setServingSize(servingSize + 12)}
                      className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Template Items & Substitutions */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Template Items & Substitutions</h3>
                <div className="space-y-4">
                  {currentTemplate.items.map(item => {
                    const hasSubstitution = substitutions.find(sub => sub.originalItemId === item.id);
                    
                    return (
                      <div
                        key={item.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="md3-label-small px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                                {item.category}
                              </span>
                              <span className="md3-label-small text-gray-500">{item.quantity} {item.panSize} pan{parseInt(item.quantity) > 1 ? 's' : ''}</span>
                            </div>
                            <h4 className="font-medium">{item.name}</h4>
                            
                            {hasSubstitution && (
                              <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded flex items-center gap-2">
                                <Replace className="w-4 h-4 text-orange-600" />
                                <span className="md3-body-small text-orange-700 dark:text-orange-300">
                                  Will be replaced with: <strong>{hasSubstitution.substituteName}</strong>
                                  {hasSubstitution.priceAdjustment !== 0 && (
                                    <span className={`ml-1 ${hasSubstitution.priceAdjustment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      ({hasSubstitution.priceAdjustment > 0 ? '+' : ''}${hasSubstitution.priceAdjustment})
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {hasSubstitution && (
                            <button
                              onClick={() => removeSubstitution(item.id)}
                              className="ml-3 px-3 py-1 md3-body-small bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              Reset
                            </button>
                          )}
                        </div>

                        {/* Substitution Options */}
                        {item.canSubstitute && item.substitutes && (
                          <div>
                            <h5 className="md3-body-small font-medium mb-2">Available Substitutions:</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.substitutes.map(substitute => (
                                <button
                                  key={substitute.id}
                                  onClick={() => addSubstitution(item.id, substitute)}
                                  disabled={hasSubstitution?.substituteItemId === substitute.id}
                                  className={`p-3 text-left rounded-lg border transition-colors ${
                                    hasSubstitution?.substituteItemId === substitute.id
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="md3-body-small font-medium">{substitute.name}</span>
                                    {hasSubstitution?.substituteItemId === substitute.id && (
                                      <Check className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  {substitute.priceAdjustment !== 0 && (
                                    <span className={`md3-label-small ${
                                      substitute.priceAdjustment > 0 ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                      {substitute.priceAdjustment > 0 ? '+' : ''}${substitute.priceAdjustment} per pan
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Notes */}
              <div>
                <label className="block md3-body-small font-medium mb-2">Special Instructions (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special dietary requirements, cooking preferences, or delivery instructions..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                />
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-semibold mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Template Price:</span>
                    <span>${currentTemplate.price.toFixed(2)}</span>
                  </div>
                  
                  {substitutions.length > 0 && (
                    <div className="space-y-1">
                      <div className="md3-body-small font-medium text-gray-600 dark:text-gray-400">Substitution Adjustments:</div>
                      {substitutions.map(sub => (
                        <div key={sub.originalItemId} className="flex justify-between md3-body-small pl-4">
                          <span>{sub.originalName} → {sub.substituteName}</span>
                          <span className={sub.priceAdjustment >= 0 ? 'text-red-600' : 'text-green-600'}>
                            {sub.priceAdjustment >= 0 ? '+' : ''}${sub.priceAdjustment}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {servingSize !== currentTemplate.servings && (
                    <div className="flex justify-between md3-body-small">
                      <span>Serving Size Adjustment:</span>
                      <span className={servingSize > currentTemplate.servings ? 'text-red-600' : 'text-green-600'}>
                        {servingSize > currentTemplate.servings ? '+' : ''}${((servingSize / currentTemplate.servings - 1) * currentTemplate.price * 0.1).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Price:</span>
                      <span className="text-blue-600">${calculateAdjustedPrice().toFixed(2)}</span>
                    </div>
                    <div className="md3-body-small text-gray-600 dark:text-gray-400">
                      Serves {servingSize} people
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md3-body-small text-gray-600 dark:text-gray-400">
                  <Utensils className="w-4 h-4" />
                  <span>
                    {substitutions.length} substitution{substitutions.length !== 1 ? 's' : ''} made
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="md-filled-button flex items-center gap-2"
                  >
                    Add Custom Template to Cart
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}