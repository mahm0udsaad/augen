import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("category_displays")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching category displays:", error)
    return NextResponse.json({ error: "Failed to fetch category displays" }, { status: 500 })
  }
}

