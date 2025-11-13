"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminHeader from "@/components/admin-header"
import { ProductList } from "@/components/admin/product-list"
import { ProductFormNew } from "@/components/admin/product-form-new"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Loader2, X } from "lucide-react"
import { type Product } from "@/lib/products"
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
  upsertProductImages,
  deleteProductImagesByIds,
  type ProductImageInput,
} from "@/lib/product-service"
import { toast } from "@/hooks/use-toast"

export default function AdminProductsPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load products from Supabase
  useEffect(() => {
    if (isAuthed) {
      loadProducts()
    }
  }, [isAuthed])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل المنتجات:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل المنتجات. يرجى تحديث الصفحة.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthed) {
    return null
  }

  const handleAddProduct = async (
    product: Partial<Product>,
    images: ProductImageInput[]
  ) => {
    try {
      setSubmitting(true)
      
      const normalizedImages: ProductImageInput[] = images.map((img, index) => ({
        ...img,
        id:
          img.id && img.id.startsWith("temp-")
            ? undefined
            : img.id,
        sort_order: index,
        color_type: img.color_type ?? "color",
        tiger_type:
          (img.color_type ?? "color") === "tiger"
            ? img.tiger_type || img.color_name
            : null,
      }))

      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(editingProduct.id, product)

        const existingIds = editingProduct.images?.map((img) => img.id) || []
        const incomingIds = normalizedImages
          .map((img) => img.id)
          .filter((id): id is string => Boolean(id))
        const removedIds = existingIds.filter((id) => !incomingIds.includes(id))

        if (removedIds.length > 0) {
          await deleteProductImagesByIds(removedIds)

          const removedImages = (editingProduct.images || []).filter((img) =>
            removedIds.includes(img.id)
          )

          await Promise.all(
            removedImages.map((img) =>
              img.image_url && img.image_url.includes('supabase.co')
                ? deleteProductImage(img.image_url)
                : Promise.resolve()
            )
          )
        }

        if (normalizedImages.length > 0) {
          await upsertProductImages(updated.id, normalizedImages)
        }

        const refreshed = await getAllProducts()
        setProducts(refreshed)

        toast({
          title: "تم بنجاح",
          description: "تم تحديث المنتج بنجاح",
        })
        setEditingProduct(null)
      } else {
        // Create new product
        const created = await createProduct(product as any)
        
        // Add images
        if (normalizedImages.length > 0) {
          await addProductImages(created.id, normalizedImages)
        }
        
        // Reload products to get the new product with images
        const refreshed = await getAllProducts()
        setProducts(refreshed)
        
        toast({
          title: "تم بنجاح",
          description: "تم إنشاء المنتج بنجاح",
        })
      }
      
      setShowForm(false)
    } catch (error) {
      console.error("خطأ أثناء حفظ المنتج:", error)
      toast({
        title: "خطأ",
        description: "تعذر حفظ المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      try {
        const product = products.find((p) => p.id === id)
        
        // Delete from Supabase
        await deleteProduct(id)
        
        // Delete image if it's from Supabase storage
        if (product?.image && product.image.includes("supabase.co")) {
          await deleteProductImage(product.image)
        }
        
        setProducts(products.filter((p) => p.id !== id))
        toast({
          title: "تم الحذف",
          description: "تم حذف المنتج بنجاح",
        })
      } catch (error) {
        console.error("خطأ أثناء حذف المنتج:", error)
        toast({
          title: "خطأ",
          description: "تعذر حذف المنتج. حاول مرة أخرى.",
          variant: "destructive",
        })
      }
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-right">إدارة المنتجات</h1>
              <p className="text-muted-foreground mt-1 text-right">إدارة مجموعة النظارات</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2" size="lg">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "إلغاء" : "إضافة منتج"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="p-6">
              <ProductFormNew 
                product={editingProduct || undefined} 
                onSubmit={handleAddProduct} 
                onCancel={handleCancel}
              />
            </Card>
          )}

          {/* Product List */}
          <div>
            <ProductList products={products} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
          </div>
        </div>
      </div>
    </div>
  )
}
