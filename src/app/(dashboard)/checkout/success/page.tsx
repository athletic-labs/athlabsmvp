'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Calendar, Clock, MapPin, Package } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      // Get order from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = orders.find((o: any) => o.id === orderId);
      setOrder(foundOrder);
    }
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-electric-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Your order has been successfully placed and is being processed.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {order.id}
            </span>
          </div>

          {/* Delivery Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Delivery Date</p>
                <p className="font-medium">{order.deliveryDate}</p>
              </div>
            </div>
            
            {order.deliveryTime && (
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Time</p>
                  <p className="font-medium">{order.deliveryTime}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Meal Context</p>
                <p className="font-medium capitalize">{order.deliveryTiming?.replace('-', ' ')}</p>
              </div>
            </div>
            
            {order.deliveryLocation && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{order.deliveryLocation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Order Items:</h3>
            <div className="space-y-2">
              {order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.servings && (
                      <p className="text-sm text-gray-600">Serves {item.servings} people</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax (8.75%):</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-electric-blue">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Special Instructions */}
          {order.notes && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Special Instructions:</h4>
              <p className="text-yellow-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              You'll receive a confirmation email within 15 minutes
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Our kitchen team will prepare your order
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              We'll notify you when your order is ready for delivery
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link 
            href="/order-history"
            className="flex-1 bg-electric-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-electric-blue/90 transition-colors text-center"
          >
            View Order History
          </Link>
          <Link 
            href="/new-order"
            className="flex-1 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
          >
            Place Another Order
          </Link>
        </div>
      </div>
    </div>
  );
}