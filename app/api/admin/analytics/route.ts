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

    // Get category breakdown
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("products")
      .select("category")

    if (categoryError) throw categoryError

    const categoryBreakdown = categoryData?.reduce((acc: any[], curr) => {
      const existing = acc.find((item) => item.category === curr.category)
      if (existing) {
        existing.count++
      } else {
        acc.push({ category: curr.category, count: 1 })
      }
      return acc
    }, []) || []

    // Get total categories count
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from("categories")
      .select("id")

    if (categoriesError) throw categoriesError

    const totalCategories = categories?.length || 0

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
