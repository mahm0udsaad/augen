import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity } = body as { productId?: string; quantity?: number; note?: string }

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
    }

    // Ensure product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, quantity")
      .eq("id", productId)
      .single()
    if (productError || !product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }
    if (product.quantity < quantity) {
      return NextResponse.json({ error: "الكمية غير متوفرة في المخزون" }, { status: 400 })
    }

    // Decrement inventory
    const { error: decError } = await supabase.rpc("decrement_inventory", {
      p_product_id: productId,
      p_quantity: quantity,
    })
    if (decError) {
      console.error("decrement_inventory error", decError)
      return NextResponse.json({ error: "تعذر تحديث المخزون" }, { status: 500 })
    }

    // Return updated product
    const { data: updated, error: updatedError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single()
    if (updatedError) {
      return NextResponse.json({ error: "تم التحديث لكن تعذر جلب البيانات" }, { status: 200 })
    }

    return NextResponse.json({ success: true, product: updated }, { status: 200 })
  } catch (e) {
    console.error("Error in POST /api/admin/sell:", e)
    return NextResponse.json({ error: "خطأ داخلي في الخادم" }, { status: 500 })
  }
}


