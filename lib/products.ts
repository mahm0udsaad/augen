import type { ParentCategory, Subcategory } from "./constants"

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  color_name: string
  color_hex: string
  color_type?: "color" | "tiger"
  tiger_type?: string | null
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  price: number
  quantity: number
  image: string // primary thumbnail image
  video_url?: string | null
  parent_category: ParentCategory
  subcategory: Subcategory
  created_at: string
  updated_at: string
  images?: ProductImage[] // associated color images
}

// Legacy mock data - keeping for backward compatibility during migration
// This will be removed once all data is in Supabase
export const products: Product[] = []
