import { supabase } from "./supabase"
import type { ParentCategory, Subcategory } from "./constants"
import type { CategoryVisualOverride, SubcategoryVisualOverride } from "./category-visuals"

export interface CategoryDisplayRecord {
  id: string
  category_key: ParentCategory
  title_ar: string
  title_en: string | null
  slogan_ar: string | null
  slogan_en: string | null
  background_image: string
  mobile_background_image: string | null
  is_visible: boolean
  sort_order: number
  updated_at?: string
}

export interface SubcategoryDisplayRecord {
  id: string
  parent_category: ParentCategory
  subcategory_key: Subcategory
  image_url: string
  mobile_image_url: string | null
  sort_order: number
}

function appendCacheBuster(url: string | null | undefined, version: string | undefined): string | null {
  if (!url) return null
  if (!version) return url
  const hasQuery = url.includes("?")
  const separator = hasQuery ? "&" : "?"
  return `${url}${separator}v=${encodeURIComponent(version)}`
}

export async function fetchCategoryDisplays(): Promise<CategoryDisplayRecord[]> {
  const { data, error } = await supabase
    .from("category_displays")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching category displays:", error)
    return []
  }

  return data as CategoryDisplayRecord[]
}

export async function fetchSubcategoryDisplays(): Promise<SubcategoryDisplayRecord[]> {
  const { data, error } = await supabase
    .from("subcategory_displays")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching subcategory displays:", error)
    return []
  }

  return data as SubcategoryDisplayRecord[]
}

export async function getCategoryVisualOverrides() {
  const [categories, subcategories] = await Promise.all([
    fetchCategoryDisplays(),
    fetchSubcategoryDisplays(),
  ])

  const categoryOverrides: Partial<Record<ParentCategory, CategoryVisualOverride>> = {}
  categories.forEach((entry) => {
    const version = entry.updated_at ? String(new Date(entry.updated_at).getTime()) : undefined
    categoryOverrides[entry.category_key] = {
      title: entry.title_en || entry.title_ar,
      description: entry.slogan_en || entry.slogan_ar,
      backgroundImage: appendCacheBuster(entry.background_image, version) || entry.background_image,
      mobileBackgroundImage:
        appendCacheBuster(entry.mobile_background_image, version) || entry.mobile_background_image,
    }
  })

  const subcategoryOverrides: Partial<Record<Subcategory, SubcategoryVisualOverride>> = {}
  subcategories.forEach((entry) => {
    subcategoryOverrides[entry.subcategory_key] = {
      backgroundImage: entry.image_url,
      mobileBackgroundImage: entry.mobile_image_url,
    }
  })

  return { categoryOverrides, subcategoryOverrides }
}
