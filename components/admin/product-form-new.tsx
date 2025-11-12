"use client"

import { useState, useEffect } from "react"
import type { Product, ProductImage } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadField } from "@/components/admin/upload-field"
import { uploadProductImage, uploadProductVideo, addProductImages } from "@/lib/product-service"
import { X, Video, Image as ImageIcon, Plus, Loader2 } from "lucide-react"
import { PARENT_CATEGORIES, SUBCATEGORIES } from "@/lib/constants"
import type { ParentCategory, Subcategory } from "@/lib/constants"

interface ProductFormProps {
  product?: Product | null
  onSubmit: (
    product: Partial<Product>,
    images: Array<{ image_url: string; color_name: string; color_hex: string; sort_order: number }>
  ) => Promise<void> | void
  onCancel: () => void
}

interface ImageWithColor {
  id: string
  file?: File
  url: string
  color_name: string
  color_hex: string
  sort_order: number
}

export function ProductFormNew({ product, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    parent_category: product?.parent_category || ("sunglasses" as ParentCategory),
    subcategory: product?.subcategory || ("man" as Subcategory),
    image: product?.image || "",
    video_url: product?.video_url || "",
  })

  const [images, setImages] = useState<ImageWithColor[]>(
    product?.images?.map((img, index) => ({
      id: img.id,
      url: img.image_url,
      color_name: img.color_name,
      color_hex: img.color_hex,
      sort_order: index,
    })) || []
  )

  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleImageUpload = async (file: File, index?: number) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)

      if (index !== undefined) {
        // Replace existing image
        const newImages = [...images]
        newImages[index] = { ...newImages[index], url, file }
        setImages(newImages)
      } else {
        // Add new image
        const newImage: ImageWithColor = {
          id: `temp-${Date.now()}`,
          file,
          url,
          color_name: "",
          color_hex: "#000000",
          sort_order: images.length,
        }
        setImages([...images, newImage])
      }

      // Set primary image if first one
      if (images.length === 0 && !formData.image) {
        setFormData({ ...formData, image: url })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("فشل في رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (file: File | null) => {
    if (!file) return
    setUploadingVideo(true)
    try {
      const url = await uploadProductVideo(file)
      setFormData({ ...formData, video_url: url })
    } catch (error) {
      console.error("Error uploading video:", error)
      alert("فشل في رفع الفيديو")
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleImageColorChange = (index: number, field: "color_name" | "color_hex", value: string) => {
    const newImages = [...images]
    newImages[index] = { ...newImages[index], [field]: value }
    setImages(newImages)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages.map((img, i) => ({ ...img, sort_order: i })))

    // If removed image was primary, set first image as primary
    if (formData.image === images[index].url && newImages.length > 0) {
      setFormData({ ...formData, image: newImages[0].url })
    }
  }

  const handleSetPrimaryImage = (index: number) => {
    setFormData({ ...formData, image: images[index].url })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.quantity) {
      alert("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    if (images.length === 0) {
      alert("يرجى رفع صورة واحدة على الأقل")
      return
    }

    // Validate that all images have color info
    for (const img of images) {
      if (!img.color_name || !img.color_hex) {
        alert("يرجى إضافة اسم ولون لجميع الصور")
        return
      }
    }

    const imagesToSave = images.map((img) => ({
      image_url: img.url,
      color_name: img.color_name,
      color_hex: img.color_hex,
      sort_order: img.sort_order,
    }))

    try {
      setSaving(true)
      await onSubmit(formData, imagesToSave)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">اسم المنتج (بالعربية) *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="مثال: نظارة شمسية رجالي"
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">السعر (ج.م) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            required
            placeholder="299"
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">الكمية المتاحة *</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            required
            placeholder="10"
          />
        </div>

        {/* Parent Category */}
        <div className="space-y-2">
          <Label htmlFor="parent_category">التصنيف الرئيسي *</Label>
          <Select
            value={formData.parent_category}
            onValueChange={(value) =>
              setFormData({ ...formData, parent_category: value as ParentCategory })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PARENT_CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  {cat.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          <Label htmlFor="subcategory">التصنيف الفرعي *</Label>
          <Select
            value={formData.subcategory}
            onValueChange={(value) => setFormData({ ...formData, subcategory: value as Subcategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUBCATEGORIES).map(([key, sub]) => (
                <SelectItem key={key} value={key}>
                  {sub.name_ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Video Upload */}
        <UploadField
          className="md:col-span-2"
          label="فيديو المنتج (اختياري)"
          accept="video/*"
          uploading={uploadingVideo}
          buttonText={formData.video_url ? "تغيير الفيديو" : "رفع فيديو"}
          placeholder="MP4 أو MOV حتى 60 ثانية"
          icon={<Video className="w-4 h-4" />}
          status={
            formData.video_url && <span className="text-sm text-green-600">✓ تم رفع الفيديو</span>
          }
          onFileSelect={(file) => handleVideoUpload(file)}
          helperText="اختياري - يساعد على إبراز تفاصيل المنتج"
        />
      </div>

      {/* Images with Colors */}
      <div className="space-y-4">
        <UploadField
          label="صور المنتج مع الألوان *"
          accept="image/*"
          multiple
          icon={<Plus className="w-4 h-4" />}
          buttonText="إضافة صورة"
          placeholder="PNG أو JPG بدقة عالية"
          uploading={uploading}
          helperText={
            images.length > 0
              ? `تمت إضافة ${images.length} ${images.length === 1 ? "صورة" : "صور"}`
              : "يمكنك إضافة أكثر من صورة لكل لون"
          }
          onFileSelect={(file) => file && handleImageUpload(file)}
          onFilesSelect={(files) => {
            if (!files || files.length === 0) return
            ;(async () => {
              try {
                // coarse-grained uploading indicator for batch
                // inner calls also toggle uploading; this ensures the button stays disabled for the whole batch
                setUploading(true)
                for (const f of files) {
                  await handleImageUpload(f)
                }
              } finally {
                setUploading(false)
              }
            })()
          }}
        />

        <div className="grid grid-cols-1 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-4">
                {/* Image Preview */}
                <div className="relative w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                  <img src={image.url} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                  {formData.image === image.url && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      أساسية
                    </div>
                  )}
                </div>

                {/* Color Info */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">اسم اللون</Label>
                    <Input
                      value={image.color_name}
                      onChange={(e) => handleImageColorChange(index, "color_name", e.target.value)}
                      placeholder="ذهبي"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">كود اللون</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={image.color_hex}
                        onChange={(e) => handleImageColorChange(index, "color_hex", e.target.value)}
                        className="h-9 w-16"
                      />
                      <Input
                        value={image.color_hex}
                        onChange={(e) => handleImageColorChange(index, "color_hex", e.target.value)}
                        placeholder="#D4AF37"
                        className="h-9 flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {formData.image !== image.url && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimaryImage(index)}
                    >
                      جعلها أساسية
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {images.length === 0 && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لم يتم إضافة صور بعد</p>
              <p className="text-sm">اضغط على "إضافة صورة" لرفع صور المنتج</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
        <Button type="submit" disabled={uploading || uploadingVideo || saving}>
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جارٍ الحفظ...
            </span>
          ) : product ? (
            "تحديث المنتج"
          ) : (
            "إضافة المنتج"
          )}
        </Button>
      </div>
    </form>
  )
}
