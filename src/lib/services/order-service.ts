import { createSupabaseClient } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number; // in cents
  servings?: number;
  category?: string;
  description?: string;
}

export interface Order {
  id?: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number; // in cents
  tax: number; // in cents
  total: number; // in cents
  delivery_date: string;
  delivery_timing: string;
  delivery_time?: string;
  delivery_location?: string;
  notes?: string;
  special_instructions?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_intent_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  created_at?: string;
  updated_at?: string;
  delivered_at?: string;
}

export class OrderService {
  /**
   * Create a new order in the database
   */
  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<{ order: Order | null; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        return { order: null, error: error.message };
      }

      return { order: data, error: null };
    } catch (err) {
      console.error('Unexpected error creating order:', err);
      return { order: null, error: 'Failed to create order' };
    }
  }

  /**
   * Get order by ID
   */
  static async getOrder(orderId: string): Promise<{ order: Order | null; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return { order: null, error: error.message };
      }

      return { order: data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching order:', err);
      return { order: null, error: 'Failed to fetch order' };
    }
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<{ order: Order | null; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error('Error fetching order by number:', error);
        return { order: null, error: error.message };
      }

      return { order: data, error: null };
    } catch (err) {
      console.error('Unexpected error fetching order by number:', err);
      return { order: null, error: 'Failed to fetch order' };
    }
  }

  /**
   * Get all orders (with optional filtering)
   */
  static async getOrders(filters?: {
    status?: Order['status'];
    delivery_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ orders: Order[]; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.delivery_date) {
        query = query.eq('delivery_date', filters.delivery_date);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], error: error.message };
      }

      return { orders: data || [], error: null };
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      return { orders: [], error: 'Failed to fetch orders' };
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      const updateData: any = { status };
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected error updating order status:', err);
      return { success: false, error: 'Failed to update order status' };
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string, 
    payment_status: Order['payment_status'], 
    payment_intent_id?: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const supabase = createSupabaseClient();
      
      const updateData: any = { payment_status };
      if (payment_intent_id) {
        updateData.payment_intent_id = payment_intent_id;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected error updating payment status:', err);
      return { success: false, error: 'Failed to update payment status' };
    }
  }

  /**
   * Generate unique order number
   */
  static generateOrderNumber(): string {
    const prefix = 'AL'; // Athletic Labs
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
    const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
    return `${prefix}-${timestamp}-${random}`;
  }
}