import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        name: body.name,
        name_ar: body.name_ar || null,
        description: body.description || null,
        description_ar: body.description_ar || null,
        icon: body.icon || null,
        color: body.color || '#3b82f6',
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ error: "تعذر تحديث التصنيف" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "تعذر حذف التصنيف" }, { status: 500 })
  }
}
