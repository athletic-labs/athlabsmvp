'use client';

import { ShoppingCart, X, ChevronRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/enhanced-cart-store';
import { motion, AnimatePresence } from 'framer-motion';

interface CartSummaryPanelProps {
  onViewCart: () => void;
}

export default function CartSummaryPanel({ onViewCart }: CartSummaryPanelProps) {
  const { items, removeItem, subtotal, itemCount, tax, total } = useCartStore();
  const MINIMUM_ORDER = 500;
  
  const belowMinimum = subtotal < MINIMUM_ORDER;
  const remainingForMinimum = MINIMUM_ORDER - subtotal;

  if (items.length === 0) {
    return (
      <div className="bg-white dark:bg-navy rounded-xl border border-smoke dark:border-smoke/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-5 h-5 text-navy dark:text-white" />
          <h3 className="font-semibold text-lg">Cart Summary</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-smoke/20 dark:bg-smoke/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-8 h-8 text-navy/30 dark:text-white/30" />
          </div>
          <p className="text-sm text-navy/60 dark:text-white/60">Your cart is empty</p>
          <p className="text-xs text-navy/50 dark:text-white/50 mt-1">Add templates to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy rounded-xl border border-smoke dark:border-smoke/30 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-smoke dark:border-smoke/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-navy dark:text-white" />
            <h3 className="font-semibold">Cart ({itemCount})</h3>
          </div>
          <button
            onClick={onViewCart}
            className="text-sm text-electric-blue hover:underline"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Items */}
      <div className="max-h-64 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-start justify-between gap-2"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-navy dark:text-white">{item.name}</p>
                <p className="text-xs text-navy/60 dark:text-white/60">
                  Qty: {item.quantity} • ${item.unitPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-3 h-3 text-red-500" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Minimum Order Warning */}
      {belowMinimum && (
        <div className="px-4 pb-3">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-orange-900 dark:text-orange-100">
                  Below minimum order
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Add ${remainingForMinimum.toFixed(2)} more
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 border-t border-smoke dark:border-smoke/30 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-navy/60 dark:text-white/60">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-navy/60 dark:text-white/60">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="pt-2 border-t border-smoke dark:border-smoke/30">
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg text-electric-blue">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-smoke/5 dark:bg-smoke/10">
        <button
          onClick={onViewCart}
          disabled={belowMinimum}
          className="w-full py-2.5 bg-electric-blue text-white rounded-lg text-sm font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          Proceed to Checkout
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
}