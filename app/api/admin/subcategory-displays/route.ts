import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subcategory_displays")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching subcategory displays:", error)
    return NextResponse.json({ error: "فشل في جلب بيانات الفئات الفرعية" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { parent_category, subcategory_key, image_url, mobile_image_url, sort_order } = body

    if (!parent_category || !subcategory_key || !image_url) {
      return NextResponse.json({ error: "الرجاء تزويد جميع الحقول المطلوبة" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("subcategory_displays")
      .upsert(
        {
          parent_category,
          subcategory_key,
          image_url,
          mobile_image_url: mobile_image_url || null,
          sort_order: sort_order || 0,
        },
        { onConflict: "parent_category,subcategory_key" },
      )
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error saving subcategory display:", error)
    return NextResponse.json({ error: "فشل في الحفظ" }, { status: 500 })
  }
}
