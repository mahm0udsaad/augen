import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

const normalizeCity = (city: any) => ({
  ...city,
  shipping_fee: Number(city.shipping_fee),
})

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("shipping_cities")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true })

    if (error) throw error

    return NextResponse.json({ cities: (data || []).map(normalizeCity) })
  } catch (error) {
    console.error("Error fetching shipping cities (admin):", error)
    return NextResponse.json({ error: "فشل في تحميل مدن الشحن" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nameEn, nameAr, shippingFee, sortOrder, isActive } = body

    if (!nameEn || typeof shippingFee !== "number" || Number.isNaN(shippingFee)) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 })
    }

    const payload = {
      name_en: nameEn,
      name_ar: nameAr || null,
      shipping_fee: shippingFee,
      sort_order: typeof sortOrder === "number" ? sortOrder : 0,
      is_active: typeof isActive === "boolean" ? isActive : true,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseAdmin
      .from("shipping_cities")
      .insert(payload)
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json({ city: normalizeCity(data) }, { status: 201 })
  } catch (error) {
    console.error("Error creating shipping city:", error)
    return NextResponse.json({ error: "فشل في إنشاء مدينة الشحن" }, { status: 500 })
  }
}
