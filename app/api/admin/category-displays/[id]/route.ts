import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const {
      category_key,
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

    let { data, error } = await supabaseAdmin
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
      .maybeSingle()

    if ((error && error.code === "PGRST116") || !data) {
      const fallbackKey = category_key
      if (fallbackKey) {
        const fallback = await supabaseAdmin
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
          .eq("category_key", fallbackKey)
          .select()
          .maybeSingle()

        data = fallback.data
        error = fallback.error
      }
    }

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating category display:", error)
    return NextResponse.json({ error: "فشل في التحديث" }, { status: 500 })
  }
}
