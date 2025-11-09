import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .select(`
        *,
        subcategories (*)
      `)
      .order("created_at", { ascending: false })
      .order("created_at", { ascending: false, foreignTable: "subcategories" })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "تعذر جلب التصنيفات" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([{
        name: body.name,
        name_ar: body.name_ar || null,
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
    console.error("Error creating category:", error)
    return NextResponse.json({ error: "تعذر إنشاء التصنيف" }, { status: 500 })
  }
}
