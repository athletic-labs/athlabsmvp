'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Package, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Calendar, Eye } from 'lucide-react';
import { Card, Button } from '@/lib/design-system/components';
import { OrderService, Order } from '@/lib/services/order-service';
import { toast } from 'sonner';

// Status configuration with proper design tokens
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'text-[var(--md-sys-color-on-surface-variant)]',
    bg: 'bg-[var(--md-sys-color-surface-container)]'
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle,
    color: 'text-[var(--md-sys-color-primary)]',
    bg: 'bg-[var(--md-sys-color-primary-container)]'
  },
  preparing: {
    label: 'Preparing',
    icon: Package,
    color: 'text-[var(--md-sys-color-on-secondary-container)]',
    bg: 'bg-[var(--md-sys-color-secondary-container)]'
  },
  ready: {
    label: 'Ready',
    icon: CheckCircle,
    color: 'text-[var(--md-sys-color-primary)]',
    bg: 'bg-[var(--md-sys-color-primary-container)]'
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'text-[var(--md-sys-color-primary)]',
    bg: 'bg-[var(--md-sys-color-primary-container)]'
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-[var(--md-sys-color-error)]',
    bg: 'bg-[var(--md-sys-color-error-container)]'
  }
};

// Order History Loading Component with proper design tokens
function OrderHistoryLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="animate-pulse">
        <div className="h-8 bg-[var(--md-sys-color-surface-container)] rounded w-48 mb-2"></div>
        <div className="h-4 bg-[var(--md-sys-color-surface-container)] rounded w-96"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-[var(--md-sys-color-surface-container)] rounded w-24 mb-2"></div>
              <div className="h-6 bg-[var(--md-sys-color-surface-container)] rounded w-16 mb-1"></div>
              <div className="h-3 bg-[var(--md-sys-color-surface-container)] rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table skeleton */}
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-[var(--md-sys-color-surface-container)] rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-[var(--md-sys-color-surface-container)] rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Order row component
function OrderRow({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-surface-container-lowest)] transition-colors">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        {/* Order Number */}
        <div className="font-medium text-[var(--md-sys-color-on-surface)]">
          {order.order_number}
        </div>

        {/* Date */}
        <div className="text-[var(--md-sys-color-on-surface-variant)] text-sm">
          {format(new Date(order.created_at!), 'MMM dd, yyyy')}
        </div>

        {/* Items Count */}
        <div className="text-[var(--md-sys-color-on-surface-variant)] text-sm">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${status.bg}`}>
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
          </div>
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Total */}
        <div className="font-semibold text-[var(--md-sys-color-on-surface)]">
          {formatCurrency(order.total)}
        </div>
      </div>

      {/* View Details Button */}
      <Button
        variant="outlined"
        size="small"
        leftIcon={<Eye className="w-4 h-4" />}
        className="ml-4"
        onClick={() => {
          // TODO: Implement order details modal
          toast.info(`View details for order ${order.order_number}`);
        }}
      >
        View
      </Button>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const { orders: fetchedOrders, error: fetchError } = await OrderService.getOrders(filters);
      
      if (fetchError) {
        setError(fetchError);
        toast.error('Failed to load order history');
      } else {
        setOrders(fetchedOrders);
      }
    } catch (err) {
      setError('Failed to load orders');
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => o.status === 'pending').length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0)
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <OrderHistoryLoading />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="md3-headline-large font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
          Order History
        </h1>
        <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
          Track and manage your past orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
              <Package className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                {stats.total}
              </div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Total Orders
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--md-sys-color-primary-container)] rounded-lg">
              <CheckCircle className="w-5 h-5 text-[var(--md-sys-color-primary)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                {stats.delivered}
              </div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Delivered
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--md-sys-color-surface-container)] rounded-lg">
              <Clock className="w-5 h-5 text-[var(--md-sys-color-on-surface-variant)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                {stats.pending}
              </div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Pending
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--md-sys-color-tertiary-container)] rounded-lg">
              <Package className="w-5 h-5 text-[var(--md-sys-color-on-tertiary-container)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--md-sys-color-on-surface)]">
                {formatCurrency(stats.totalSpent)}
              </div>
              <div className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
                Total Spent
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--md-sys-color-on-surface-variant)]" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--md-sys-color-outline)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
              className="w-full px-3 py-2 border border-[var(--md-sys-color-outline)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--md-sys-color-primary)] focus:border-transparent bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      <Card>
        {error ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-[var(--md-sys-color-error)] mx-auto mb-4" />
            <h3 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
              Failed to Load Orders
            </h3>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">
              {error}
            </p>
            <Button variant="filled" onClick={loadOrders}>
              Try Again
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="w-12 h-12 text-[var(--md-sys-color-on-surface-variant)] mx-auto mb-4" />
            <h3 className="md3-title-medium font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No Orders Found' : 'No Orders Yet'}
            </h3>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Start by placing your first order!'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button variant="filled" onClick={() => window.location.href = '/new-order'}>
                Place First Order
              </Button>
            )}
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] font-medium text-[var(--md-sys-color-on-surface)] text-sm">
              <div>Order Number</div>
              <div>Date</div>
              <div>Items</div>
              <div>Status</div>
              <div>Total</div>
            </div>

            {/* Order Rows */}
            <div>
              {filteredOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}