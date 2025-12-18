import { supabase } from './supabase'
import type { Product, ProductImage } from './products'
import type { ParentCategory, Subcategory } from './constants'

export interface SupabaseProduct {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  video_url: string | null
  parent_category: ParentCategory
  subcategory: Subcategory
  created_at: string
  updated_at: string
  product_images?: any[]
}

export interface PaginationOptions {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Convert Supabase product to app Product type
function toProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    quantity: dbProduct.quantity,
    image: dbProduct.image,
    video_url: dbProduct.video_url,
    parent_category: dbProduct.parent_category,
    subcategory: dbProduct.subcategory,
    created_at: dbProduct.created_at,
    updated_at: dbProduct.updated_at,
    images: dbProduct.product_images || [],
  }
}

// Convert app Product to Supabase format
function toSupabaseProduct(product: Partial<Product>): any {
  const supabaseProduct: any = { ...product }
  
  // Remove id if it's empty (let database auto-generate)
  if ('id' in supabaseProduct && (!supabaseProduct.id || supabaseProduct.id.trim() === '')) {
    delete supabaseProduct.id
  }
  
  // Remove images array (handled separately)
  if ('images' in supabaseProduct) {
    delete supabaseProduct.images
  }
  
  return supabaseProduct
}

export interface ProductImageInput {
  id?: string
  image_url: string
  color_name: string
  color_hex: string
  sort_order: number
  color_type?: 'color' | 'tiger'
  tiger_type?: string | null
}

// Get all products (legacy - loads all at once)
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return (data || []).map(toProduct)
}

// Get products with pagination
export async function getProductsPaginated(options: PaginationOptions = {}): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 12 } = options
  const offset = (page - 1) * limit

  // First get the total count
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('Error fetching product count:', countError)
    throw countError
  }

  // Then get the paginated data
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching paginated products:', error)
    throw error
  }

  const total = count || 0
  const products = (data || []).map(toProduct)

  return {
    data: products,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data ? toProduct(data) : null
}

// Get products by parent category
export async function getProductsByParentCategory(parentCategory: ParentCategory): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .eq('parent_category', parentCategory)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by parent category:', error)
    throw error
  }

  return (data || []).map(toProduct)
}

// Get products by parent category and subcategory
export async function getProductsByCategories(
  parentCategory: ParentCategory,
  subcategory?: Subcategory
): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .eq('parent_category', parentCategory)

  if (subcategory) {
    query = query.eq('subcategory', subcategory)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by categories:', error)
    throw error
  }

  return (data || []).map(toProduct)
}

// Get products by categories with pagination
export async function getProductsByCategoriesPaginated(
  parentCategory: ParentCategory,
  subcategory?: Subcategory,
  options: PaginationOptions = {}
): Promise<PaginatedResponse<Product>> {
  const { page = 1, limit = 12 } = options
  const offset = (page - 1) * limit

  // Build the base query for counting
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('parent_category', parentCategory)

  if (subcategory) {
    countQuery = countQuery.eq('subcategory', subcategory)
  }

  const { count, error: countError } = await countQuery

  if (countError) {
    console.error('Error fetching product count by categories:', countError)
    throw countError
  }

  // Build the query for data
  let dataQuery = supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        product_id,
        image_url,
        color_name,
        color_hex,
        sort_order,
        created_at,
        color_type,
        tiger_type
      )
    `)
    .eq('parent_category', parentCategory)

  if (subcategory) {
    dataQuery = dataQuery.eq('subcategory', subcategory)
  }

  const { data, error } = await dataQuery
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching paginated products by categories:', error)
    throw error
  }

  const total = count || 0
  const products = (data || []).map(toProduct)

  return {
    data: products,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  }
}

// Create product
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const supabaseProduct = toSupabaseProduct(product)
  
  console.log('Creating product with data:', JSON.stringify(supabaseProduct, null, 2))
  
  const { data, error } = await supabase
    .from('products')
    .insert([supabaseProduct])
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    console.error('Attempted to insert:', supabaseProduct)
    throw error
  }

  return toProduct(data)
}

// Update product
export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const supabaseProduct = toSupabaseProduct(product)
  
  const { data, error } = await supabase
    .from('products')
    .update(supabaseProduct)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating product:', error)
    throw error
  }

  return toProduct(data)
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Upload image to Supabase storage via API route
export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-product-image', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Error uploading image:', error)
    throw new Error(error.error || 'تعذر رفع الصورة')
  }

  const data = await response.json()
  return data.url
}

// Upload video to Supabase storage
export async function uploadProductVideo(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/upload-product-video', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Error uploading video:', error)
    throw new Error(error.error || 'تعذر رفع الفيديو')
  }

  const data = await response.json()
  return data.url
}

// Add product images
export async function addProductImages(productId: string, images: ProductImageInput[]): Promise<ProductImage[]> {
  if (!images.length) return []

  const imagesToInsert = images.map((img) => ({
    product_id: productId,
    image_url: img.image_url,
    color_name: img.color_name,
    color_hex: img.color_hex,
    sort_order: img.sort_order,
    color_type: img.color_type ?? 'color',
    tiger_type: img.tiger_type ?? null,
  }))

  const { data, error } = await supabase
    .from('product_images')
    .insert(imagesToInsert)
    .select()

  if (error) {
    console.error('Error adding product images:', error)
    throw error
  }

  return data || []
}

export async function upsertProductImages(productId: string, images: ProductImageInput[]): Promise<ProductImage[]> {
  if (!images.length) return []

  const payload = images.map((img) => ({
    ...(img.id ? { id: img.id } : {}),
    product_id: productId,
    image_url: img.image_url,
    color_name: img.color_name,
    color_hex: img.color_hex,
    sort_order: img.sort_order,
    color_type: img.color_type ?? 'color',
    tiger_type: img.tiger_type ?? null,
  }))

  const { data, error } = await supabase
    .from('product_images')
    .upsert(payload, { onConflict: 'id' })
    .select()

  if (error) {
    console.error('Error syncing product images:', error)
    throw error
  }

  return data || []
}

export async function deleteProductImagesByIds(imageIds: string[]): Promise<void> {
  if (!imageIds.length) return

  const { error } = await supabase
    .from('product_images')
    .delete()
    .in('id', imageIds)

  if (error) {
    console.error('Error deleting product images:', error)
    throw error
  }
}

// Delete product image
export async function deleteProductImageById(imageId: string): Promise<void> {
  const { error } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)

  if (error) {
    console.error('Error deleting product image:', error)
    throw error
  }
}

// Delete image from Supabase storage
export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]

    // Call API route to delete image
    const response = await fetch('/api/delete-product-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileName }),
    })

    if (!response.ok) {
      console.error('Error deleting image via API')
      // Don't throw error for image deletion failures
    }
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}
