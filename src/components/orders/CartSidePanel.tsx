'use client';

import { X, Plus, Minus, Trash2, ShoppingCart, ChevronRight, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';

interface CartSidePanelProps {
  onClose: () => void;
}

export default function CartSidePanel({ onClose }: CartSidePanelProps) {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal, tax, total } = useCartStore();
  
  const MINIMUM_ORDER = 500;
  const belowMinimum = subtotal < MINIMUM_ORDER;
  const remainingForMinimum = MINIMUM_ORDER - subtotal;
  
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-electric-blue" />
          <h2 className="text-lg font-semibold">Cart ({itemCount})</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium mb-2">Your cart is empty</p>
            <p className="text-sm text-gray-600">Add templates to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {item.servings && (
                      <p className="text-xs text-gray-600 mt-1">
                        Serves {item.servings} people
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
                
                {/* Included Items */}
                {item.includedItems && item.includedItems.length > 0 && (
                  <div className="mb-3 text-xs">
                    <details className="cursor-pointer">
                      <summary className="text-gray-600 font-medium">
                        Included items ({item.includedItems.length})
                      </summary>
                      <div className="mt-1 pl-3 space-y-0.5">
                        {item.includedItems.map((included, idx) => (
                          <p key={idx} className="text-gray-500">
                            • {included.name} ({included.quantity})
                          </p>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
                
                {/* Quantity and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white hover:bg-gray-100 rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${formatPrice(item.unitPrice * item.quantity * 100)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      {items.length > 0 && (
        <div className="border-t p-4 space-y-4">
          {/* Minimum Order Warning */}
          {belowMinimum && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-900">Below minimum order</p>
                  <p className="text-orange-700">Add ${remainingForMinimum.toFixed(2)} more</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${formatPrice(subtotal * 100)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8.75%)</span>
              <span>${formatPrice(tax * 100)}</span>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-xl text-electric-blue">
                  ${formatPrice(total * 100)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="space-y-2">
            <button
              disabled={belowMinimum}
              className="w-full py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Proceed to Checkout
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={clearCart}
              className="w-full text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}