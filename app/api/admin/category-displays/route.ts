import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("category_displays")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching category displays:", error)
    return NextResponse.json({ error: "فشل في جلب البيانات" }, { status: 500 })
  }
}

