import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("carousel_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Error fetching carousel slides:", error)
    return NextResponse.json({ error: "Failed to fetch carousel slides" }, { status: 500 })
  }
}

