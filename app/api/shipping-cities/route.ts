import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("shipping_cities")
      .select("id, name_en, name_ar, shipping_fee, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name_en", { ascending: true })

    if (error) {
      throw error
    }

    const normalized = (data || []).map((city) => ({
      ...city,
      shipping_fee: Number(city.shipping_fee),
    }))

    return NextResponse.json({ cities: normalized })
  } catch (error) {
    console.error("Error fetching shipping cities:", error)
    return NextResponse.json({ error: "تعذر تحميل مدن الشحن" }, { status: 500 })
  }
}
