import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const {
      title_ar,
      title_en,
      slogan_ar,
      slogan_en,
      background_image,
      mobile_background_image,
      is_visible,
      sort_order,
    } = body

    if (!background_image) {
      return NextResponse.json({ error: "مطلوب رفع صورة خلفية" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("category_displays")
      .update({
        title_ar,
        title_en: title_en || null,
        slogan_ar: slogan_ar || null,
        slogan_en: slogan_en || null,
        background_image,
        mobile_background_image: mobile_background_image || null,
        is_visible: is_visible !== undefined ? is_visible : true,
        sort_order: sort_order || 0,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating category display:", error)
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 })
  }
}
