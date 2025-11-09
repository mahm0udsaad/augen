import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all orders (for admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json(
        { error: 'تعذر جلب الطلبات' },
        { status: 500 }
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      customerName,
      customerWhatsapp,
      customerEmail,
      customerAddress,
      items,
      notes,
    } = body;

    // Validate required fields
    if (!customerName || !customerWhatsapp || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'بعض الحقول الإلزامية مفقودة' },
        { status: 400 }
      );
    }

    // Validate WhatsApp number format (should be numbers only or with +)
    const whatsappRegex = /^[+]?[0-9]{10,15}$/;
    if (!whatsappRegex.test(customerWhatsapp.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'صيغة رقم واتساب غير صحيحة' },
        { status: 400 }
      );
    }

    // Check inventory availability
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.productId)
        .single();

      if (error || !product) {
        return NextResponse.json(
          { error: `المنتج غير موجود: ${item.productName}` },
          { status: 404 }
        );
      }

      if (product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `الكمية غير متوفرة للمنتج: ${item.productName}` },
          { status: 400 }
        );
      }
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.unitPrice * item.quantity,
      0
    );

    // Generate order number
    const { data: orderNumberData, error: orderNumberError } = await supabase
      .rpc('generate_order_number');

    if (orderNumberError) {
      console.error('Error generating order number:', orderNumberError);
      return NextResponse.json(
        { error: 'تعذر إنشاء رقم الطلب' },
        { status: 500 }
      );
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumberData,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        customer_email: customerEmail,
        customer_address: customerAddress,
        total_amount: totalAmount,
        notes: notes,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'تعذر إنشاء الطلب' },
        { status: 500 }
      );
    }

    // Create order items and update inventory
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'تعذر إنشاء عناصر الطلب' },
        { status: 500 }
      );
    }

    // Update inventory for each product
    for (const item of items) {
      const { error: updateError } = await supabase.rpc('decrement_inventory', {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      });

      if (updateError) {
        console.error('Error updating inventory:', updateError);
      }
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          items: orderItems,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/orders:', error);
    return NextResponse.json(
      { error: 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
