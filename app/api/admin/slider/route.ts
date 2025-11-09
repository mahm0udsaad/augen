import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("carousel_slides")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching carousel slides:", error)
    return NextResponse.json({ error: "فشل في جلب الشرائح" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image_url, mobile_image_url, sort_order, is_active } = body

    if (!image_url) {
      return NextResponse.json({ error: "مطلوب رفع صورة" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("carousel_slides")
      .insert({
        image_url,
        mobile_image_url: mobile_image_url || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating carousel slide:", error)
    return NextResponse.json({ error: "فشل في إنشاء الشريحة" }, { status: 500 })
  }
}

