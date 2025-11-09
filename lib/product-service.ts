import { supabase } from './supabase'
import type { Product } from './products'

export interface SupabaseProduct {
  id: string
  name: string
  style: string
  price: number
  quantity: number
  image: string
  description: string
  material: string
  color: string
  category: string
  category_id: string | null
  subcategory_id: string | null
  color_options: Array<{ name: string; hex: string }>
  created_at: string
  updated_at: string
}

// Convert Supabase product to app Product type
function toProduct(dbProduct: SupabaseProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    style: dbProduct.style,
    price: dbProduct.price,
    quantity: dbProduct.quantity,
    image: dbProduct.image,
    description: dbProduct.description,
    material: dbProduct.material,
    color: dbProduct.color,
    category: dbProduct.category,
    category_id: dbProduct.category_id || undefined,
    subcategory_id: dbProduct.subcategory_id || undefined,
    colorOptions: dbProduct.color_options,
  }
}

// Convert app Product to Supabase format
function toSupabaseProduct(product: Partial<Product>): Partial<SupabaseProduct> {
  const supabaseProduct: any = { ...product }
  
  // Remove id if it's empty (let database auto-generate)
  if ('id' in supabaseProduct && (!supabaseProduct.id || supabaseProduct.id.trim() === '')) {
    delete supabaseProduct.id
  }
  
  if (product.colorOptions !== undefined) {
    supabaseProduct.color_options = product.colorOptions
    delete supabaseProduct.colorOptions
  }
  
  // Handle category_id - convert empty strings and undefined to null
  if ('category_id' in product) {
    const catId = product.category_id
    supabaseProduct.category_id = (catId && typeof catId === 'string' && catId.trim() !== '') ? catId : null
  }
  
  // Handle subcategory_id - convert empty strings and undefined to null
  if ('subcategory_id' in product) {
    const subId = product.subcategory_id
    supabaseProduct.subcategory_id = (subId && typeof subId === 'string' && subId.trim() !== '') ? subId : null
  }
  
  return supabaseProduct
}

// Get all products
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:category_id (
        id,
        name,
        name_ar
      ),
      subcategories:subcategory_id (
        id,
        name,
        name_ar
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  return data.map(toProduct)
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data ? toProduct(data) : null
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    throw error
  }

  return data.map(toProduct)
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
