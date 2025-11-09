import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function GET() {
  try {
    // Get total products and price statistics
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("products")
      .select("price")

    if (statsError) throw statsError

    const totalProducts = stats?.length || 0
    const prices = stats?.map((p) => Number(p.price) || 0) || []
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0

    // Get parent category breakdown
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("products")
      .select("parent_category, subcategory")

    if (categoryError) throw categoryError

    const categoryBreakdown = categoryData?.reduce((acc: any[], curr) => {
      const key = `${curr.parent_category}_${curr.subcategory}`
      const existing = acc.find((item) => item.category === key)
      if (existing) {
        existing.count++
      } else {
        acc.push({ category: key, count: 1 })
      }
      return acc
    }, []) || []

    // Total categories is hardcoded (2 parents: sunglasses, optical_glasses)
    const totalCategories = 2

    return NextResponse.json({
      totalProducts,
      totalCategories,
      avgPrice,
      minPrice,
      maxPrice,
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.count - a.count),
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "تعذر جلب بيانات التحليلات" }, { status: 500 })
  }
}
