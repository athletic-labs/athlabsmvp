import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    let subtotal = 0;
    body.items.forEach((item: { unitPrice: number; quantity: number }) => {
      subtotal += item.unitPrice * item.quantity;
    });

    const deliveryDate = new Date(body.deliveryDate);
    const now = new Date();
    const hoursUntilDelivery = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let rushFee = 0;
    let isRushOrder = false;
    
    if (hoursUntilDelivery < 72) {
      if (hoursUntilDelivery < 24) {
        return NextResponse.json({ error: 'Minimum 24 hours notice required' }, { status: 400 });
      }
      isRushOrder = true;
      rushFee = subtotal * 0.25;
    }

    const taxAmount = subtotal * 0.0875;
    const totalAmount = subtotal + taxAmount + rushFee;

    const orderNumber = `AL${Date.now().toString(36).toUpperCase()}`;

    const { data: profile } = await supabase
      .from('profiles')
      .select('team_id')
      .eq('id', session.user.id)
      .single();

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        team_id: profile.team_id,
        created_by: session.user.id,
        status: 'pending',
        contact_name: body.contactName,
        contact_phone: body.contactPhone,
        contact_email: body.contactEmail,
        delivery_date: body.deliveryDate,
        delivery_address: body.deliveryAddress,
        estimated_guests: body.estimatedGuests,
        subtotal,
        tax_amount: taxAmount,
        rush_fee: rushFee,
        total_amount: totalAmount,
        is_rush_order: isRushOrder
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}