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
    images: Array<{ image_url: string; color_name: string; color_hex: string; sort_order: number }>
  ) => {
    try {
      setSubmitting(true)
      
      if (editingProduct) {
        // Update existing product
        const updated = await updateProduct(editingProduct.id, product)
        
        // Add new images if any
        if (images.length > 0) {
          await addProductImages(updated.id, images)
        }
        
        // Reload product to get updated images
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
        if (images.length > 0) {
          await addProductImages(created.id, images)
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
