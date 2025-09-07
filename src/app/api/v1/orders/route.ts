import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createOrderSchema, getOrdersQuerySchema } from '@/lib/validation/api-schemas';
import { 
  withBodyValidation, 
  withQueryValidation,
  createSuccessResponse,
  AuthenticationError,
  ValidationError,
  generateRequestId
} from '@/lib/validation/api-middleware';
import { withAdaptiveRateLimit, adaptivePresets } from '@/lib/middleware/adaptive-rate-limit';
import { withOrderSanitization } from '@/lib/middleware/sanitization-middleware';

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const POST = withOrderSanitization(
  withAdaptiveRateLimit(adaptivePresets.strict)(
    withBodyValidation(
      createOrderSchema,
      async (request: NextRequest, orderData) => {
    const requestId = generateRequestId();
    
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new AuthenticationError('Authentication required');
      }

      // Get user profile and validate team membership
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id, role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile?.team_id) {
        throw new ValidationError('User must be associated with a team', profileError);
      }

      // Calculate pricing with proper validation
      let subtotal = 0;
      orderData.items.forEach(item => {
        if (item.unitPrice < 0 || item.quantity < 1) {
          throw new ValidationError('Invalid item pricing or quantity', { item, unitPrice: item.unitPrice, quantity: item.quantity });
        }
        subtotal += item.unitPrice * item.quantity;
      });

      // Business logic validation
      const deliveryDate = new Date(orderData.deliveryDate);
      const now = new Date();
      const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const minimumDeliveryDate = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // 24 hours from now
      
      let rushFee = 0;
      let isRushOrder = false;
      
      if (hoursUntilDelivery < 72) {
        if (hoursUntilDelivery < 24) {
          throw new ValidationError('Orders must be placed at least 24 hours in advance', { delivery_date: orderData.deliveryDate, minimum_date: minimumDeliveryDate.toISOString() });
        }
        isRushOrder = true;
        rushFee = subtotal * 0.25; // 25% rush fee
      }

      // Calculate tax (should come from system settings in the future)
      const taxAmount = subtotal * 0.0875; // 8.75% tax
      const totalAmount = subtotal + taxAmount + rushFee;

      // Generate unique order number
      const orderNumber = `AL${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      // Create order record
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          team_id: profile.team_id,
          created_by: session.user.id,
          status: 'pending',
          contact_name: orderData.contactName,
          contact_phone: orderData.contactPhone,
          contact_email: orderData.contactEmail,
          delivery_date: orderData.deliveryDate,
          delivery_time: orderData.deliveryTime,
          delivery_address: orderData.deliveryLocation,
          delivery_instructions: orderData.notes,
          estimated_guests: orderData.estimatedGuests,
          subtotal,
          tax_rate: 0.0875,
          tax_amount: taxAmount,
          rush_fee: rushFee,
          total_amount: totalAmount,
          is_rush_order: isRushOrder,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      // TODO: Create order items in separate table
      // TODO: Send order confirmation email
      // TODO: Create Stripe payment intent

      return createSuccessResponse(
        { 
          order: {
            ...order,
            items: orderData.items // Include items in response
          }
        }, 
        201,
        { requestId }
      );

    } catch (error) {
      console.error(`Order creation failed [${requestId}]:`, error);
      throw error; // Re-throw for middleware to handle
    }
  })
  )
);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get orders with filtering
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, preparing, delivered, cancelled]
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
export const GET = withAdaptiveRateLimit(adaptivePresets.api)(
  withQueryValidation(
    getOrdersQuerySchema,
    async (request: NextRequest, query) => {
    const requestId = generateRequestId();
    
    try {
      const supabase = createRouteHandlerClient({ cookies });
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new AuthenticationError('Authentication required');
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('team_id, role')
        .eq('id', session.user.id)
        .single();

      if (!profile?.team_id) {
        throw new ValidationError('User must be associated with a team', { reason: 'missing_team_id' });
      }

      // Build query with filters
      let ordersQuery = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('team_id', profile.team_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (query.status) {
        ordersQuery = ordersQuery.eq('status', query.status);
      }

      if (query.startDate) {
        ordersQuery = ordersQuery.gte('delivery_date', query.startDate);
      }

      if (query.endDate) {
        ordersQuery = ordersQuery.lte('delivery_date', query.endDate);
      }

      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 50;
      const offset = (page - 1) * limit;
      ordersQuery = ordersQuery.range(offset, offset + limit - 1);

      const { data: orders, error, count } = await ordersQuery;

      if (error) {
        throw new Error(`Failed to fetch orders: ${error.message}`);
      }

      // Calculate pagination metadata
      const totalPages = Math.ceil((count || 0) / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return createSuccessResponse(
        {
          orders: orders || [],
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || 0,
            totalPages,
            hasNextPage,
            hasPreviousPage,
          },
        },
        200,
        { requestId }
      );

    } catch (error) {
      console.error(`Orders fetch failed [${requestId}]:`, error);
      throw error;
    }
  })
);