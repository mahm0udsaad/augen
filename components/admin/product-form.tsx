"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { uploadProductImage } from "@/lib/product-service"
import { Upload, Loader2 } from "lucide-react"

interface Category {
  id: string
  name: string
  name_ar: string | null
}

interface Subcategory {
  id: string
  name: string
  name_ar: string | null
  category_id: string
}

interface ProductFormProps {
  product?: Product
  onSubmit: (product: Product) => void
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<Product>(
    product || {
      id: "",
      name: "",
      style: "",
      price: 0,
      quantity: 0,
      image: "",
      description: "",
      material: "",
      color: "",
      category: "classic",
      category_id: "",
      subcategory_id: "",
      colorOptions: [
        { name: "", hex: "#000000" },
        { name: "", hex: "#000000" },
        { name: "", hex: "#000000" },
      ],
    },
  )
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Load categories and subcategories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingCategories(true)
        
        // Fetch categories
        const categoriesRes = await fetch('/api/admin/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }
        
        // Fetch subcategories
        const subcategoriesRes = await fetch('/api/admin/subcategories')
        if (subcategoriesRes.ok) {
          const subcategoriesData = await subcategoriesRes.json()
          setSubcategories(subcategoriesData)
        }
      } catch (error) {
        console.error('Error loading categories/subcategories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }
    
    loadData()
  }, [])

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      const filtered = subcategories.filter(
        (sub) => sub.category_id === formData.category_id
      )
      setFilteredSubcategories(filtered)
    } else {
      setFilteredSubcategories([])
    }
  }, [formData.category_id, subcategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.category_id) {
      alert("يرجى اختيار الفئة")
      return
    }
    
    try {
      let imageUrl = formData.image

      // Upload image if a new file was selected
      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadProductImage(imageFile)
      }

      // Prepare data - ensure no empty strings for UUID fields
      const productData = {
        ...formData,
        image: imageUrl,
        category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id : undefined,
        subcategory_id: formData.subcategory_id && formData.subcategory_id.trim() !== '' ? formData.subcategory_id : undefined,
      }
      
      console.log('Form data being submitted:', productData)

      onSubmit(productData)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("فشل رفع الصورة. يرجى المحاولة مرة أخرى.")
    } finally {
      setUploading(false)
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setFormData({ ...formData, image: previewUrl })
    }
  }

  const updateColorOption = (index: number, field: "name" | "hex", value: string) => {
    const newColorOptions = [...(formData.colorOptions || [])]
    newColorOptions[index] = {
      ...newColorOptions[index],
      [field]: value,
    }
    setFormData({ ...formData, colorOptions: newColorOptions })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
        {/* Basic Info */}
        <div className="space-y-2">
          <Label htmlFor="name">اسم المنتج *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="مثال: نظارة ذهبية كلاسيكية"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">الشكل *</Label>
          <Input
            id="style"
            value={formData.style}
            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
            required
            placeholder="مثال: إطار بيضاوي"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">السعر (ج.م) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
            required
            placeholder="299"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">الكمية المتاحة *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity || 0}
            onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 0 })}
            required
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">عدد القطع المتاحة في المخزون</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">الفئة *</Label>
          <Select
            value={formData.category_id || ""}
            onValueChange={(value) => setFormData({ 
              ...formData, 
              category_id: value,
              subcategory_id: "" // Reset subcategory when category changes
            })}
            disabled={loadingCategories}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCategories ? "جاري التحميل..." : "اختر الفئة"} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name_ar || cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">الفئة الفرعية</Label>
          <Select
            value={formData.subcategory_id || ""}
            onValueChange={(value) => setFormData({ ...formData, subcategory_id: value })}
            disabled={!formData.category_id || filteredSubcategories.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !formData.category_id 
                  ? "اختر الفئة أولاً" 
                  : filteredSubcategories.length === 0 
                    ? "لا توجد فئات فرعية" 
                    : "اختر الفئة الفرعية"
              } />
            </SelectTrigger>
            <SelectContent>
              {filteredSubcategories.map((sub) => (
                <SelectItem key={sub.id} value={sub.id}>
                  {sub.name_ar || sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">المادة *</Label>
          <Input
            id="material"
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            required
            placeholder="مثال: تيتانيوم مطلي بالذهب"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">اللون *</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            required
            placeholder="مثال: ذهبي مع لمسات بنفسجية"
          />
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2" dir="rtl">
        <Label>صورة المنتج *</Label>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="image-file"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploading}
                className="cursor-pointer"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-file")?.click()}
              disabled={uploading}
            >
              <Upload className="w-4 h-4 ml-2" />
              رفع صورة
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            أو أدخل رابط الصورة:
          </div>
          
        <Input
            id="image-url"
            value={imageFile ? "" : formData.image}
            onChange={(e) => {
              setImageFile(null)
              setFormData({ ...formData, image: e.target.value })
            }}
          placeholder="https://..."
          type="url"
            disabled={uploading || !!imageFile}
        />
          
        {formData.image && (
            <div className="relative">
          <img
            src={formData.image || "/placeholder.svg"}
            alt="Preview"
                className="h-48 w-48 object-cover rounded-lg"
              />
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2" dir="rtl">
        <Label htmlFor="description">الوصف *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="وصف المنتج..."
          rows={4}
        />
      </div>

      {/* Color Options */}
      <div className="space-y-3" dir="rtl">
        <Label>خيارات الألوان</Label>
        <div className="space-y-3">
          {(formData.colorOptions || []).map((option, index) => (
            <div key={index} className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor={`color-name-${index}`} className="text-xs">
                  اسم اللون
                </Label>
                <Input
                  id={`color-name-${index}`}
                  value={option.name}
                  onChange={(e) => updateColorOption(index, "name", e.target.value)}
                  placeholder="مثال: ذهبي"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor={`color-hex-${index}`} className="text-xs">
                  كود اللون
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`color-hex-${index}`}
                    value={option.hex}
                    onChange={(e) => updateColorOption(index, "hex", e.target.value)}
                    placeholder="#D4AF37"
                  />
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: option.hex }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t" dir="rtl">
        <Button type="button" variant="outline" onClick={onCancel} disabled={uploading}>
          إلغاء
        </Button>
        <Button type="submit" disabled={uploading || !formData.category_id}>
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>{product ? "تحديث المنتج" : "إضافة المنتج"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
