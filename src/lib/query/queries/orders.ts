import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheUtils } from '../query-client';
import { cachedOrdersApi, cacheInvalidation } from '@/lib/cache/cached-api';

// Types
interface Order {
  id: string;
  order_number: string;
  team_id: string;
  created_by: string;
  status: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  delivery_date: string;
  delivery_time: string;
  delivery_address: any;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface CreateOrderData {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: any;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    customizations?: string;
  }>;
  estimatedGuests: number;
  notes?: string;
}

// API functions with caching
const ordersApi = {
  async getOrders(teamId: string, filters?: OrderFilters): Promise<OrdersResponse> {
    return await cachedOrdersApi.getOrders(teamId, filters);
  },

  async getOrderById(orderId: string): Promise<Order> {
    return await cachedOrdersApi.getOrderById(orderId);
  },

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.order;
  },

  async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    const response = await fetch(`/api/v1/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.order;
  },
};

// Query hooks
export function useOrders(teamId: string, filters?: OrderFilters) {
  return useQuery({
    queryKey: queryKeys.ordersList(filters),
    queryFn: () => ordersApi.getOrders(teamId, filters),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // Orders data is stale after 2 minutes
    gcTime: 1000 * 60 * 10, // Keep cached for 10 minutes
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: queryKeys.ordersById(orderId),
    queryFn: () => ordersApi.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 1000 * 60 * 5, // Single order data is stale after 5 minutes
  });
}

// Mutation hooks
export function useCreateOrder(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: async (newOrder) => {
      // Invalidate Redis cache for orders and analytics
      await cacheInvalidation.onOrderChange(teamId);
      
      // Invalidate React Query cache
      cacheUtils.invalidateOrders();
      
      // Add the new order to React Query cache
      queryClient.setQueryData(queryKeys.ordersById(newOrder.id), newOrder);
      
      // Update orders list cache optimistically
      const ordersQueryKey = queryKeys.ordersList();
      const previousData = queryClient.getQueryData<OrdersResponse>(ordersQueryKey);
      
      if (previousData) {
        queryClient.setQueryData<OrdersResponse>(ordersQueryKey, {
          ...previousData,
          orders: [newOrder, ...previousData.orders],
          pagination: {
            ...previousData.pagination,
            total: previousData.pagination.total + 1,
          },
        });
      }
      
      // Invalidate dashboard analytics
      cacheUtils.invalidateDashboard();
    },
  });
}

export function useUpdateOrder(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, updates }: { orderId: string; updates: Partial<Order> }) =>
      ordersApi.updateOrder(orderId, updates),
    onSuccess: async (updatedOrder) => {
      // Invalidate Redis cache for orders and analytics
      await cacheInvalidation.onOrderChange(teamId, updatedOrder.id);
      
      // Update the specific order in React Query cache
      queryClient.setQueryData(queryKeys.ordersById(updatedOrder.id), updatedOrder);
      
      // Update the order in all orders lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.orders },
        (oldData: any) => {
          if (!oldData?.orders) return oldData;
          
          return {
            ...oldData,
            orders: oldData.orders.map((order: Order) =>
              order.id === updatedOrder.id ? updatedOrder : order
            ),
          };
        }
      );
      
      // Invalidate analytics if status changed
      cacheUtils.invalidateDashboard();
    },
  });
}

// Prefetch utility
export function usePrefetchOrder() {
  const queryClient = useQueryClient();

  return (orderId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.ordersById(orderId),
      queryFn: () => ordersApi.getOrderById(orderId),
      staleTime: 1000 * 60 * 5,
    });
  };
}