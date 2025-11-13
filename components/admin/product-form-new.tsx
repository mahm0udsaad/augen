"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadField } from "@/components/admin/upload-field"
import { uploadProductImage, uploadProductVideo } from "@/lib/product-service"
import { X, Video, Image as ImageIcon, Plus, Loader2 } from "lucide-react"
import { PARENT_CATEGORIES, SUBCATEGORIES, TIGER_BADGE_COLORS } from "@/lib/constants"
import type { ParentCategory, Subcategory } from "@/lib/constants"
import type { ProductImageInput } from "@/lib/product-service"

interface ProductFormProps {
  product?: Product | null
  onSubmit: (
    product: Partial<Product>,
    images: ProductImageInput[]
  ) => Promise<void> | void
  onCancel: () => void
}

interface ImageWithColor {
  id: string
  file?: File
  url: string
  color_name: string
  color_hex: string
  color_type: "color" | "tiger"
  tiger_type?: string | null
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
    product?.images?.map((img, index) => {
      const mode = (img.color_type as "color" | "tiger") || "color"
      return {
        id: img.id,
        url: img.image_url,
        color_name: img.color_name,
        color_type: mode,
        color_hex: mode === "tiger" ? img.color_hex || TIGER_BADGE_COLORS.base : img.color_hex || "#000000",
        tiger_type: img.tiger_type || "",
        sort_order: index,
      }
    }) || []
  )

  const [uploading, setUploading] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [saving, setSaving] = useState(false)

  const getDisplayName = (img: ImageWithColor) =>
    img.color_name?.trim() || img.tiger_type?.trim() || ""

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
          color_type: "color",
          tiger_type: "",
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

  const handleImageFieldChange = (
    index: number,
    field: keyof ImageWithColor,
    value: any
  ) => {
    const newImages = [...images]
    const current = newImages[index]
    if (!current) return

    if (field === "color_type") {
      const nextType = value as "color" | "tiger"
      newImages[index] = {
        ...current,
        color_type: nextType,
        color_hex: nextType === "tiger" ? TIGER_BADGE_COLORS.base : current.color_hex || "#000000",
        tiger_type: nextType === "tiger" ? current.tiger_type || "" : "",
      }
    } else if (field === "tiger_type") {
      newImages[index] = { ...current, tiger_type: value }
      if (!current.color_name?.trim()) {
        newImages[index].color_name = value
      }
    } else if (field === "color_hex" && current.color_type === "tiger") {
      // Tiger badge color is fixed
      return
    } else {
      newImages[index] = { ...current, [field]: value }
    }

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
      const displayName = getDisplayName(img)

      if (!displayName) {
        alert("يرجى إضافة اسم لكل لون أو نقشة")
        return
      }

      if (img.color_type === "color" && !img.color_hex) {
        alert("يرجى اختيار لون الشارة لكل صورة")
        return
      }

      if (img.color_type === "tiger" && !img.tiger_type?.trim()) {
        alert("يرجى إدخال اسم لنوع التايجر")
        return
      }
    }

    const imagesToSave: ProductImageInput[] = images.map((img, index) => ({
      id: img.id.startsWith("temp-") ? undefined : img.id,
      image_url: img.url,
      color_name: getDisplayName(img),
      color_hex:
        img.color_type === "tiger"
          ? TIGER_BADGE_COLORS.base
          : img.color_hex || "#000000",
      sort_order: index,
      color_type: img.color_type,
      tiger_type: img.color_type === "tiger" ? img.tiger_type || img.color_name : null,
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
                <div className="flex-1 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">الاسم الظاهر للعميل *</Label>
                      <Input
                        value={image.color_name}
                        onChange={(e) => handleImageFieldChange(index, "color_name", e.target.value)}
                        placeholder="ذهبي / Black"
                        className="h-9"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        سيُعرض هذا الاسم تحت الصور وفي صفحة المنتج.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">طريقة التمييز</Label>
                      <RadioGroup
                        className="flex flex-col gap-3 md:flex-row"
                        value={image.color_type}
                        onValueChange={(value) =>
                          handleImageFieldChange(index, "color_type", value as "color" | "tiger")
                        }
                      >
                        <label className="flex items-start gap-2 text-xs font-medium cursor-pointer rounded-lg border px-3 py-2">
                          <RadioGroupItem value="color" id={`color-mode-${image.id}-color`} />
                          <div>
                            <p className="font-semibold text-xs">لون ثابت</p>
                            <p className="text-[11px] text-muted-foreground">اختر كود لون مخصص لهذه الصورة.</p>
                          </div>
                        </label>
                        <label className="flex items-start gap-2 text-xs font-medium cursor-pointer rounded-lg border px-3 py-2">
                          <RadioGroupItem value="tiger" id={`color-mode-${image.id}-tiger`} />
                          <div>
                            <p className="font-semibold text-xs">نقشة تايجر</p>
                            <p className="text-[11px] text-muted-foreground">أضف اسم النقشة وسيظهر للعملاء.</p>
                          </div>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>

                  {image.color_type === "tiger" && (
                    <div className="space-y-1">
                      <Label className="text-xs">اسم نوع التايجر *</Label>
                      <Input
                        value={image.tiger_type || ""}
                        onChange={(e) => handleImageFieldChange(index, "tiger_type", e.target.value)}
                        placeholder="Classic Tiger / Zebra"
                        className="h-10"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        سيُستخدم هذا الاسم مع بطاقة التايجر ويظهر فوق الكولكشن.
                      </p>
                    </div>
                  )}

                  {image.color_type === "tiger" ? (
                    <div className="space-y-1">
                      <Label className="text-xs">لون شارة التايجر *</Label>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-16 rounded-lg border"
                          style={{
                            backgroundImage: `linear-gradient(135deg, ${TIGER_BADGE_COLORS.base}, ${TIGER_BADGE_COLORS.highlight})`,
                          }}
                        />
                        <div className="text-[11px] text-muted-foreground leading-tight">
                          <p>لون ثابت لضمان تناسق مظهر نقشة التايجر.</p>
                          <p>{TIGER_BADGE_COLORS.base} → {TIGER_BADGE_COLORS.highlight}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">كود اللون *</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={image.color_hex || "#000000"}
                          onChange={(e) => handleImageFieldChange(index, "color_hex", e.target.value)}
                          className="h-10 w-16 cursor-pointer"
                        />
                        <Input
                          value={image.color_hex}
                          onChange={(e) => handleImageFieldChange(index, "color_hex", e.target.value)}
                          placeholder="#D4AF37"
                          className="h-10 flex-1"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">يُستخدم هذا اللون لعنصر الاختيار.</p>
                    </div>
                  )}
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
