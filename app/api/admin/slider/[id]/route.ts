import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { image_url, mobile_image_url, sort_order, is_active } = body

    if (!image_url) {
      return NextResponse.json({ error: "مطلوب رفع صورة" }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from("carousel_slides")
      .update({
        image_url,
        mobile_image_url: mobile_image_url || null,
        sort_order: sort_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating carousel slide:", error)
    return NextResponse.json({ error: "فشل في تحديث الشريحة" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const { error } = await supabaseAdmin.from("carousel_slides").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting carousel slide:", error)
    return NextResponse.json({ error: "فشل في حذف الشريحة" }, { status: 500 })
  }
}

