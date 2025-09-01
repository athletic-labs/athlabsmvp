'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Package, ChevronDown, Eye, Repeat, Download, Calendar, Clock, CheckCircle, XCircle, Truck, MapPin, Plus } from 'lucide-react';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  servings?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
  deliveryDate: Date;
  deliveryLocation: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
}

export default function OrderHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check for success redirect from checkout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('status') === 'success') {
        setShowSuccess(true);
        // Remove the query parameter
        window.history.replaceState({}, '', '/order-history');
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      }
    }
  }, []);

  // Mock order data
  const orders: Order[] = [
    {
      id: 'ord_001',
      orderNumber: 'ORD-2024-001',
      date: subDays(new Date(), 2),
      status: 'delivered',
      deliveryDate: subDays(new Date(), 1),
      deliveryLocation: 'Athletic Training Center',
      items: [
        { id: 'item_1', name: 'Mediterranean Power Bowl', quantity: 1, unitPrice: 2940, servings: 60 },
        { id: 'item_2', name: 'Recovery Smoothie Base', quantity: 60, unitPrice: 65 }
      ],
      subtotal: 6840,
      tax: 599,
      total: 7439,
      notes: 'Please deliver to main kitchen entrance'
    },
    {
      id: 'ord_002',
      orderNumber: 'ORD-2024-002',
      date: subDays(new Date(), 5),
      status: 'delivered',
      deliveryDate: subDays(new Date(), 4),
      deliveryLocation: 'Team Dining Hall',
      items: [
        { id: 'item_3', name: 'BYO Asian Bowl', quantity: 1, unitPrice: 2600, servings: 60 }
      ],
      subtotal: 2600,
      tax: 228,
      total: 2828
    },
    {
      id: 'ord_003',
      orderNumber: 'ORD-2024-003',
      date: subDays(new Date(), 10),
      status: 'delivered',
      deliveryDate: subDays(new Date(), 9),
      deliveryLocation: 'Athletic Training Center',
      items: [
        { id: 'item_4', name: 'Breakfast Essentials', quantity: 1, unitPrice: 1800, servings: 60 },
        { id: 'item_5', name: 'Fresh Garden Salad Mix', quantity: 2, unitPrice: 350 }
      ],
      subtotal: 2500,
      tax: 219,
      total: 2719
    },
    {
      id: 'ord_004',
      orderNumber: 'ORD-2024-004',
      date: new Date(),
      status: 'confirmed',
      deliveryDate: subDays(new Date(), -2),
      deliveryLocation: 'Stadium Complex',
      items: [
        { id: 'item_6', name: 'Pre-Game Fuel Package', quantity: 1, unitPrice: 3200, servings: 60 }
      ],
      subtotal: 3200,
      tax: 280,
      total: 3480,
      notes: 'Pre-game meal - deliver 3 hours before kickoff'
    }
  ];

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle },
    preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: Package },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const reorderOrder = (order: Order) => {
    // This would typically add all items from the order to the cart
    console.log('Reordering:', order);
    // For now, just navigate to new order page
    window.location.href = '/new-order';
  };

  const downloadInvoice = (order: Order) => {
    // Mock download functionality
    console.log('Downloading invoice for:', order.orderNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy dark:text-white">Order History</h1>
          <p className="text-navy/60 dark:text-white/60 mt-1">
            View and manage your past orders
          </p>
        </div>
        <Link 
          href="/new-order" 
          className="flex items-center gap-2 px-4 py-2 text-sm bg-electric-blue text-white rounded-lg hover:bg-electric-blue/90 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Place New Order
        </Link>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">Order Placed Successfully!</h3>
              <p className="text-sm text-green-700">Your order has been submitted and will appear in your history below.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-3 mb-6">
        {/* Search bar - better proportions */}
        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-electric-blue"
          />
        </div>
        
        {/* Status dropdown - compact width */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-electric-blue bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        
        {/* More Filters - less prominent */}
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 text-gray-500" />
          <span>More Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Additional Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Date Range</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-electric-blue bg-white">
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>This year</option>
                  <option>All time</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order Value</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-electric-blue bg-white">
                  <option>Any amount</option>
                  <option>Under $1,000</option>
                  <option>$1,000 - $5,000</option>
                  <option>Over $5,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Delivery Location</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-electric-blue bg-white">
                  <option>All locations</option>
                  <option>Athletic Training Center</option>
                  <option>Team Dining Hall</option>
                  <option>Stadium Complex</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-electric-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-electric-blue" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery || statusFilter !== 'all' ? 'No matching orders found' : 'No orders yet'}
          </h3>
          <p className="text-navy/60 dark:text-white/60 mb-6">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Your order history will appear here once you place your first order'
            }
          </p>
          <Link href="/new-order" className="md-filled-button">
            Place Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusInfo = statusConfig[order.status];
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="md-card hover:shadow-md-elevation-2 transition-shadow"
              >
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{order.orderNumber}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Ordered: {format(order.date, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="w-4 h-4" />
                          Delivery: {format(order.deliveryDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 text-sm border border-electric-blue text-electric-blue rounded-lg hover:bg-electric-blue/10"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => reorderOrder(order)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Reorder
                      </button>
                      <button
                        onClick={() => downloadInvoice(order)}
                        className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Invoice
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Items</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map(item => (
                          <p key={item.id} className="text-sm font-medium">
                            {item.name} ({item.quantity})
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-xs text-gray-500">+{order.items.length - 2} more items</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Location</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium">{order.deliveryLocation}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-xl font-bold text-blue-600">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col max-h-screen"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedOrder.orderNumber} - {format(selectedOrder.date, 'MMM d, yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Status and Timeline */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3">Order Status</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${statusConfig[selectedOrder.status].color}`}>
                        {(() => {
                          const StatusIcon = statusConfig[selectedOrder.status].icon;
                          return <StatusIcon className="w-4 h-4" />;
                        })()}
                        {statusConfig[selectedOrder.status].label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.servings && (
                              <p className="text-sm text-gray-500">Serves {item.servings} people</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div>
                    <h3 className="font-semibold mb-3">Delivery Details</h3>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                          <p className="font-medium">{format(selectedOrder.deliveryDate, 'EEEE, MMM d, yyyy')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-medium">{selectedOrder.deliveryLocation}</p>
                        </div>
                      </div>
                      {selectedOrder.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Special Instructions</p>
                          <p className="text-sm">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div>
                    <h3 className="font-semibold mb-3">Payment Summary</h3>
                    <div className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${selectedOrder.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8.75%)</span>
                          <span>${selectedOrder.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-blue-600">${selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <button
                    onClick={() => downloadInvoice(selectedOrder)}
                    className="md-outlined-button"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </button>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="md-outlined-button"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        reorderOrder(selectedOrder);
                        setSelectedOrder(null);
                      }}
                      className="md-filled-button"
                    >
                      <Repeat className="w-4 h-4 mr-2" />
                      Reorder
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}