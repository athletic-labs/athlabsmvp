'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { ShoppingCart, Calendar, Clock, MapPin, FileText } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTiming, setDeliveryTiming] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If no items in cart, redirect back
    if (items.length === 0) {
      router.push('/new-order');
    }
  }, [items.length, router]);

  const handleSubmitOrder = async () => {
    if (!deliveryDate || !deliveryTiming) {
      alert('Please select delivery date and timing');
      return;
    }

    setSubmitting(true);

    const orderData = {
      items,
      deliveryDate,
      deliveryTiming,
      deliveryTime,
      deliveryLocation,
      notes,
      subtotal: calculateSubtotal(),
      tax: calculateTax(),
      total: calculateTotal(),
      timestamp: Date.now(),
      status: 'pending'
    };

    try {
      // Save order to localStorage (replace with API call)
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push({ ...orderData, id: `order-${Date.now()}` });
      localStorage.setItem('orders', JSON.stringify(orders));

      // Clear cart and redirect
      clearCart();
      router.push('/order-history?status=success');
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.0875; // 8.75% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatPrice = (cents: number) => {
    return `${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-gray-600">Review your order and schedule delivery</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold">Order Summary</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between py-2 border-b border-gray-100">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600"> x{item.quantity}</span>
                  {item.servings && (
                    <p className="text-xs text-gray-500">Serves {item.servings} people</p>
                  )}
                </div>
                <span className="font-medium">${formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          
          <div className="space-y-2 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>${formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8.75%)</span>
              <span>${formatPrice(calculateTax())}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-electric-blue">${formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-electric-blue" />
            <h2 className="text-lg font-semibold">Delivery Details</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Delivery Date *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Meal Context *
              </label>
              <select
                value={deliveryTiming}
                onChange={(e) => setDeliveryTiming(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
                required
              >
                <option value="">Select meal context</option>
                <option value="arrival">Arrival (Team arrival meals)</option>
                <option value="pre-game">Pre-Game (3-4 hours before)</option>
                <option value="post-game">Post-Game (After game/training)</option>
                <option value="flight-out">Flight Out (Before departure)</option>
                <option value="intermission">Meeting/Event (During breaks)</option>
                <option value="custom">Custom Context</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Delivery Time
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
              >
                <option value="">Select specific time</option>
                <option value="06:00">6:00 AM</option>
                <option value="06:30">6:30 AM</option>
                <option value="07:00">7:00 AM</option>
                <option value="07:30">7:30 AM</option>
                <option value="08:00">8:00 AM</option>
                <option value="08:30">8:30 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="09:30">9:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="12:30">12:30 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="13:30">1:30 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="14:30">2:30 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="15:30">3:30 PM</option>
                <option value="16:00">4:00 PM</option>
                <option value="16:30">4:30 PM</option>
                <option value="17:00">5:00 PM</option>
                <option value="17:30">5:30 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="18:30">6:30 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="19:30">7:30 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="20:30">8:30 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Delivery Location
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="e.g., Team Facility, Training Complex"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Special Instructions
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special dietary requirements, setup instructions, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-electric-blue"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          onClick={handleSubmitOrder}
          disabled={!deliveryDate || !deliveryTime || submitting}
          className="w-full py-3 bg-electric-blue text-white rounded-lg font-medium hover:bg-electric-blue/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Order...
            </div>
          ) : (
            `Place Order - $${formatPrice(calculateTotal())}`
          )}
        </button>
        
        <button
          onClick={() => router.back()}
          className="w-full mt-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}