import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("subcategories")
      .select(`
        *,
        categories (
          id,
          name,
          name_ar
        )
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching subcategories:", error)
    return NextResponse.json({ error: "تعذر جلب التصنيفات الفرعية" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from("subcategories")
      .insert([{
        name: body.name,
        name_ar: body.name_ar || null,
        category_id: body.category_id,
        description: body.description || null,
        description_ar: body.description_ar || null,
        icon: body.icon || null,
        color: body.color || '#3b82f6',
      }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating subcategory:", error)
    return NextResponse.json({ error: "تعذر إنشاء التصنيف الفرعي" }, { status: 500 })
  }
}
