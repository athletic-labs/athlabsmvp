'use client';

import { useRouter } from 'next/navigation';
import { X, Minus, Plus, ChevronDown, ChevronUp, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '@/lib/store/cart-store';

interface CartSidePanelProps {
  onClose: () => void;
}

export default function CartSidePanel({ onClose }: CartSidePanelProps) {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  
  // Fix price formatting - divide by 100 for cents to dollars
  const formatPrice = (cents: number) => {
    return `${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Calculate totals correctly
  const subtotal = items.reduce((acc, item) => {
    const itemTotal = item.unitPrice * item.quantity;
    return acc + itemTotal;
  }, 0);
  
  const tax = subtotal * 0.0875; // 8.75% tax
  const total = subtotal + tax;
  const minimumOrder = 50000; // $500 in cents
  const belowMinimum = subtotal < minimumOrder;
  const amountNeeded = minimumOrder - subtotal;
  
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleCheckout = () => {
    // Check minimum order requirement
    if (subtotal < minimumOrder) {
      alert(`Please add $${formatPrice(amountNeeded)} more to meet the minimum order requirement.`);
      return;
    }

    // Save cart data to localStorage for checkout page
    const checkoutData = {
      items,
      subtotal,
      tax,
      total,
      timestamp: Date.now()
    };
    localStorage.setItem('checkout-data', JSON.stringify(checkoutData));

    // Navigate to checkout page
    router.push('/checkout');
    
    // Optionally close the cart panel
    onClose();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-electric-blue" />
          <h2 className="text-lg font-semibold">Cart ({items.length})</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Your cart is empty</p>
            <p className="text-sm mt-1">Add templates to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Serves {item.servings || 60} people
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Included Items Toggle */}
                {item.includedItems && item.includedItems.length > 0 && (
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 mb-2"
                  >
                    {expandedItems.has(item.id) ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                    Included items ({item.includedItems.length})
                  </button>
                )}
                
                {/* Expanded Items List */}
                {expandedItems.has(item.id) && item.includedItems && (
                  <div className="text-xs text-gray-500 mb-2 pl-4 space-y-0.5">
                    {item.includedItems.map((included, idx) => (
                      <div key={idx}>• {included.name} ({included.quantity})</div>
                    ))}
                  </div>
                )}
                
                {/* Quantity and Price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border rounded hover:bg-gray-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-semibold">
                    ${formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with Totals */}
      <div className="border-t p-4 space-y-3">
        {/* Minimum Order Warning */}
        {belowMinimum && items.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-amber-900">Below minimum order</p>
                <p className="text-amber-700">Add ${formatPrice(amountNeeded)} more</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (8.75%)</span>
            <span>${formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-electric-blue">${formatPrice(total)}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <button
          onClick={handleCheckout}
          disabled={belowMinimum || items.length === 0}
          className="w-full py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Proceed to Checkout
        </button>
        
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="w-full py-2 text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        )}
      </div>
    </div>
  );
}