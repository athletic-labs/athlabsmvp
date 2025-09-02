'use client';

import { useState, useMemo, useEffect } from 'react';
import { Package, Eye, Repeat, Download, Calendar, Clock, CheckCircle, XCircle, Truck, MapPin, Plus, MoreVertical } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DataTable, Button, Card, CardHeader, CardTitle } from '@/lib/design-system/components';
import type { Column } from '@/lib/design-system/components';

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
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

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
    pending: { 
      label: 'Pending', 
      color: 'bg-[var(--md-saas-color-warning-container)] text-[var(--md-saas-color-on-warning-container)]', 
      icon: Clock 
    },
    confirmed: { 
      label: 'Confirmed', 
      color: 'bg-[var(--md-saas-color-info-container)] text-[var(--md-saas-color-on-info-container)]', 
      icon: CheckCircle 
    },
    preparing: { 
      label: 'Preparing', 
      color: 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]', 
      icon: Package 
    },
    delivered: { 
      label: 'Delivered', 
      color: 'bg-[var(--md-saas-color-success-container)] text-[var(--md-saas-color-on-success-container)]', 
      icon: CheckCircle 
    },
    cancelled: { 
      label: 'Cancelled', 
      color: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]', 
      icon: XCircle 
    }
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    return orders.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [orders, searchQuery]);

  const reorderOrder = (order: Order) => {
    console.log('Reordering:', order);
    window.location.href = '/new-order';
  };

  const downloadInvoice = (order: Order) => {
    console.log('Downloading invoice for:', order.orderNumber);
  };

  const handleBulkReorder = (selectedIds: string[]) => {
    console.log('Bulk reordering:', selectedIds);
    // Implementation for bulk reorder
  };

  const handleBulkDownload = (selectedIds: string[]) => {
    console.log('Bulk downloading invoices:', selectedIds);
    // Implementation for bulk invoice download
  };

  // Define DataTable columns
  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      title: 'Order Number',
      sortable: true,
      width: '150px',
      render: (value: string, order: Order) => (
        <div className="font-medium">
          <div className="md3-label-large">{value}</div>
          <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
            {format(order.date, 'MMM d, yyyy')}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      width: '120px',
      render: (value: string, order: Order) => {
        const statusInfo = statusConfig[order.status];
        const StatusIcon = statusInfo.icon;
        return (
          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full md3-label-small ${statusInfo.color}`}>
            <StatusIcon className="w-4 h-4" />
            {statusInfo.label}
          </span>
        );
      }
    },
    {
      key: 'items',
      title: 'Items',
      render: (value: OrderItem[], order: Order) => (
        <div>
          <div className="md3-body-medium">
            {order.items.slice(0, 2).map(item => item.name).join(', ')}
          </div>
          {order.items.length > 2 && (
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              +{order.items.length - 2} more items
            </div>
          )}
        </div>
      )
    },
    {
      key: 'deliveryLocation',
      title: 'Delivery Location',
      render: (value: string, order: Order) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
          <div>
            <div className="md3-body-medium">{value}</div>
            <div className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              {format(order.deliveryDate, 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      align: 'right',
      width: '100px',
      render: (value: number) => (
        <div className="md3-title-medium font-semibold text-[var(--md-sys-color-primary)]">
          ${value.toFixed(2)}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, order: Order) => (
        <div className="flex gap-1">
          <Button
            variant="text"
            size="small"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => setSelectedOrder(order)}
            className="p-2"
          />
          <Button
            variant="text"
            size="small"
            leftIcon={<Repeat className="w-4 h-4" />}
            onClick={() => reorderOrder(order)}
            className="p-2"
          />
          <Button
            variant="text"
            size="small"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={() => downloadInvoice(order)}
            className="p-2"
          />
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="filled" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="md3-headline-medium font-bold text-[var(--md-sys-color-on-surface)]">
              Order History
            </h1>
            <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mt-1">
              View and manage your past orders
            </p>
          </div>
          <Button
            variant="filled"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => window.location.href = '/new-order'}
            className="mt-4 sm:mt-0"
          >
            Place New Order
          </Button>
        </div>
      </Card>

      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card variant="filled" className="p-4 bg-[var(--md-saas-color-success-container)]">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[var(--md-saas-color-on-success-container)]" />
              <div>
                <h3 className="md3-title-small font-medium text-[var(--md-saas-color-on-success-container)]">
                  Order Placed Successfully!
                </h3>
                <p className="md3-body-medium text-[var(--md-saas-color-on-success-container)]">
                  Your order has been submitted and will appear in your history below.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Data Table */}
      <DataTable
        data={filteredOrders}
        columns={columns}
        loading={loading}
        selectable={true}
        selectedRows={selectedOrders}
        onSelectionChange={setSelectedOrders}
        rowKey="id"
        onRowClick={(order) => setSelectedOrder(order)}
        searchable={true}
        searchPlaceholder="Search orders by number or items..."
        onSearch={setSearchQuery}
        density="comfortable"
        stickyHeader={true}
        emptyState={
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-[var(--md-sys-color-on-primary-container)]" />
            </div>
            <h3 className="md3-title-large font-semibold mb-2">
              {searchQuery ? 'No matching orders found' : 'No orders yet'}
            </h3>
            <p className="md3-body-large text-[var(--md-sys-color-on-surface-variant)] mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'Your order history will appear here once you place your first order'
              }
            </p>
            <Button
              variant="filled"
              onClick={() => window.location.href = '/new-order'}
            >
              Place Your First Order
            </Button>
          </div>
        }
        bulkActions={[
          {
            key: 'reorder',
            label: 'Reorder Selected',
            icon: <Repeat className="w-4 h-4" />,
            onClick: handleBulkReorder
          },
          {
            key: 'download',
            label: 'Download Invoices',
            icon: <Download className="w-4 h-4" />,
            onClick: handleBulkDownload
          }
        ]}
      />

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-[var(--md-sys-color-scrim)]/50 z-40"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 bg-[var(--md-sys-color-surface)] md-elevation-3 rounded-xl z-50 flex flex-col max-h-screen"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                  <h2 className="md3-headline-small font-bold text-[var(--md-sys-color-on-surface)]">
                    Order Details
                  </h2>
                  <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mt-1">
                    {selectedOrder.orderNumber} - {format(selectedOrder.date, 'MMM d, yyyy')}
                  </p>
                </div>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2"
                >
                  ×
                </Button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Status and Timeline */}
                  <Card variant="filled" className="p-4">
                    <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
                      Order Status
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg md3-label-large ${statusConfig[selectedOrder.status].color}`}>
                        {(() => {
                          const StatusIcon = statusConfig[selectedOrder.status].icon;
                          return <StatusIcon className="w-4 h-4" />;
                        })()}
                        {statusConfig[selectedOrder.status].label}
                      </span>
                    </div>
                  </Card>

                  {/* Items */}
                  <Card variant="outlined" className="p-4">
                    <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
                      Order Items
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                          <div>
                            <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                              {item.name}
                            </p>
                            {item.servings && (
                              <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                                Serves {item.servings} people
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="md3-title-small font-semibold text-[var(--md-sys-color-on-surface)]">
                              ${(item.unitPrice * item.quantity).toFixed(2)}
                            </p>
                            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Delivery Details */}
                  <Card variant="outlined" className="p-4">
                    <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
                      Delivery Details
                    </h3>
                    <div className="p-3 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Date</p>
                          <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                            {format(selectedOrder.deliveryDate, 'EEEE, MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">Location</p>
                          <p className="md3-body-medium font-medium text-[var(--md-sys-color-on-surface)]">
                            {selectedOrder.deliveryLocation}
                          </p>
                        </div>
                      </div>
                      {selectedOrder.notes && (
                        <div className="mt-3 pt-3 border-t border-[var(--md-sys-color-outline-variant)]">
                          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
                            Special Instructions
                          </p>
                          <p className="md3-body-medium text-[var(--md-sys-color-on-surface)]">
                            {selectedOrder.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Payment Summary */}
                  <Card variant="outlined" className="p-4">
                    <h3 className="md3-title-medium font-semibold mb-3 text-[var(--md-sys-color-on-surface)]">
                      Payment Summary
                    </h3>
                    <div className="p-3 bg-[var(--md-sys-color-surface-container)] rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]">Subtotal</span>
                          <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]">
                            ${selectedOrder.subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]">Tax (8.75%)</span>
                          <span className="md3-body-medium text-[var(--md-sys-color-on-surface)]">
                            ${selectedOrder.tax.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                          <span className="md3-title-medium font-bold text-[var(--md-sys-color-on-surface)]">Total</span>
                          <span className="md3-title-medium font-bold text-[var(--md-sys-color-primary)]">
                            ${selectedOrder.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-[var(--md-sys-color-outline-variant)]">
                <div className="flex justify-between">
                  <Button
                    variant="outlined"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => downloadInvoice(selectedOrder)}
                  >
                    Download Invoice
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outlined"
                      onClick={() => setSelectedOrder(null)}
                    >
                      Close
                    </Button>
                    <Button
                      variant="filled"
                      leftIcon={<Repeat className="w-4 h-4" />}
                      onClick={() => {
                        reorderOrder(selectedOrder);
                        setSelectedOrder(null);
                      }}
                    >
                      Reorder
                    </Button>
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