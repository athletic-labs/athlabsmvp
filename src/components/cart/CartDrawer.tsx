'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, ChevronRight, Tag, Clock, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { format, addDays } from 'date-fns';
import Link from 'next/link';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal, tax, total } = useCartStore();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  
  const MINIMUM_ORDER = 500;
  const rushFee = 0; // Calculate based on delivery date
  
  const finalTotal = total - promoDiscount + rushFee;
  const belowMinimum = subtotal < MINIMUM_ORDER;

  const handleApplyPromo = () => {
    // Validate promo code
    if (promoCode.toUpperCase() === 'FIRST10') {
      setPromoDiscount(subtotal * 0.1);
      setPromoApplied(true);
    }
  };

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
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold">Your Cart</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                    Add items from the menu to get started
                  </p>
                  <button 
                    onClick={onClose}
                    className="md-filled-button"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.type === 'template' && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Serves {item.servings} people
                            </p>
                          )}
                          {item.type === 'individual' && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.panSize === 'half' ? 'Half Pan (12 servings)' : 'Full Pan (24 servings)'}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      
                      {/* Show included items for templates */}
                      {item.type === 'template' && (
                        <div className="mt-2 text-xs space-y-1">
                          {item.includedItems && item.includedItems.length > 0 && (
                            <details className="cursor-pointer">
                              <summary className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium">
                                Included items ({item.includedItems.length})
                              </summary>
                              <div className="mt-1 pl-3 space-y-0.5">
                                {item.includedItems.map((included, idx) => (
                                  <p key={idx} className="text-gray-500 dark:text-gray-500">
                                    • {included.name} ({included.quantity})
                                  </p>
                                ))}
                              </div>
                            </details>
                          )}
                          
                          {/* Show add-ons if any */}
                          {item.addOns && item.addOns.length > 0 && (
                            <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-electric-blue font-medium">Add-ons:</p>
                              {item.addOns.map((addOn, idx) => (
                                <p key={idx} className="text-gray-600 dark:text-gray-400 pl-3">
                                  • {addOn.name} x{addOn.quantity} (+${(addOn.price * addOn.quantity).toFixed(2)})
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Show substitutions */}
                      {item.substitutions && item.substitutions.length > 0 && (
                        <div className="mb-3 text-xs">
                          <p className="text-orange-600 dark:text-orange-400">
                            Substitutions: {item.substitutions.map(s => s.replacement).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${((item.unitPrice * item.quantity) + (item.addOnsTotal || 0)).toFixed(2)}
                          </p>
                          {item.addOnsTotal && item.addOnsTotal > 0 && (
                            <p className="text-xs text-gray-500">
                              Base: ${(item.unitPrice * item.quantity).toFixed(2)} + Add-ons: ${item.addOnsTotal.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Promo Code */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                        />
                      </div>
                      <button
                        onClick={handleApplyPromo}
                        disabled={promoApplied || !promoCode}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
                      >
                        {promoApplied ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                    {promoApplied && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        <Info className="w-3 h-3 inline mr-1" />
                        Promo code applied successfully
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Summary */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
                {/* Minimum Order Warning */}
                {belowMinimum && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-orange-900 dark:text-orange-100">
                          Minimum order not met
                        </p>
                        <p className="text-orange-700 dark:text-orange-300">
                          Add ${(MINIMUM_ORDER - subtotal).toFixed(2)} more to meet the $500 minimum
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Promo Discount</span>
                      <span>-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax (8.75%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  {rushFee > 0 && (
                    <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                      <span>Rush Fee (25%)</span>
                      <span>${rushFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-xl text-blue-600">
                        ${finalTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="space-y-2">
                  <Link
                    href={belowMinimum ? "#" : "/checkout"}
                    onClick={belowMinimum ? (e) => e.preventDefault() : onClose}
                    className={`w-full md-filled-button flex items-center justify-center ${belowMinimum ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Proceed to Checkout
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                  <button
                    onClick={clearCart}
                    className="w-full text-sm text-red-600 hover:text-red-700 transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
                
                {/* Delivery Estimate */}
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-700 dark:text-blue-300">
                      Earliest delivery: {format(addDays(new Date(), 3), 'EEEE, MMM d')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}