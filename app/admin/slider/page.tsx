"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { UploadField } from "@/components/admin/upload-field"
import { Plus, Loader2, Edit, Trash2, GripVertical, Upload } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CarouselSlide {
  id: string
  image_url: string
  mobile_image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  headline?: string | null
  slogan?: string | null
  cta_label?: string | null
  cta_link?: string | null
}

export default function SliderManagementPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const router = useRouter()
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [uploading, setUploading] = useState(false)

  const emptyForm = {
    image_url: "",
    mobile_image_url: "",
    headline: "AUGEN",
    slogan: "",
    cta_label: "Shop Now",
    cta_link: "/categories",
    sort_order: 0,
    is_active: true,
  }

  const [formData, setFormData] = useState(emptyForm)

  useEffect(() => {
    if (isAuthed) {
      loadSlides()
    }
  }, [isAuthed])

  const loadSlides = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/slider")
      if (!response.ok) throw new Error("فشل في تحميل الشرائح")
      const data = await response.json()
      setSlides(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل الشرائح:", error)
      toast.error("فشل في تحميل الشرائح")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File, isMobile = false) => {
    const formData = new FormData()
    formData.append("file", file)

    setUploading(true)
    try {
      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("فشل في رفع الصورة")

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        [isMobile ? "mobile_image_url" : "image_url"]: data.url,
      }))

      toast.success(isMobile ? "تم رفع صورة الموبايل" : "تم رفع الصورة")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("فشل في رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.image_url) {
      toast.error("يرجى رفع صورة على الأقل")
      return
    }

    try {
      const url = editingSlide ? `/api/admin/slider/${editingSlide.id}` : "/api/admin/slider"
      const method = editingSlide ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("فشل في حفظ الشريحة")

      toast.success(editingSlide ? "تم تحديث الشريحة" : "تم إضافة الشريحة")
      setShowForm(false)
      setEditingSlide(null)
      setFormData(emptyForm)
      loadSlides()
    } catch (error) {
      console.error("خطأ أثناء حفظ الشريحة:", error)
      toast.error("فشل في حفظ الشريحة")
    }
  }

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide(slide)
    setFormData({
      image_url: slide.image_url,
      mobile_image_url: slide.mobile_image_url || "",
      headline: slide.headline || "AUGEN",
      slogan: slide.slogan || "",
      cta_label: slide.cta_label || "Shop Now",
      cta_link: slide.cta_link || "/categories",
      sort_order: slide.sort_order,
      is_active: slide.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الشريحة؟")) return

    try {
      const response = await fetch(`/api/admin/slider/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("فشل في حذف الشريحة")

      toast.success("تم حذف الشريحة")
      loadSlides()
    } catch (error) {
      console.error("خطأ أثناء حذف الشريحة:", error)
      toast.error("فشل في حذف الشريحة")
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSlide(null)
    setFormData(emptyForm)
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

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">إدارة شرائح العرض</h1>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? <span>إلغاء</span> : <Plus className="w-4 h-4 ml-2" />}
              {showForm ? "" : "إضافة شريحة"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Desktop Image */}
                  <div className="space-y-2">
                    <UploadField
                      label="صورة سطح المكتب *"
                      accept="image/*"
                      uploading={uploading}
                      buttonText="رفع صورة"
                      placeholder="1920x800 PNG أو JPG"
                      status={
                        formData.image_url && (
                          <span className="text-sm text-green-600">✓ صورة سطح المكتب جاهزة</span>
                        )
                      }
                      helperText="تظهر على الشاشات الكبيرة"
                      onFileSelect={(file) => file && handleImageUpload(file, false)}
                    />
                    {formData.image_url && (
                      <div className="relative w-full h-40 bg-secondary rounded-lg overflow-hidden">
                        <img src={formData.image_url} alt="معاينة" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Mobile Image */}
                  <div className="space-y-2">
                    <UploadField
                      label="صورة الموبايل (اختياري)"
                      accept="image/*"
                      uploading={uploading}
                      buttonText="رفع صورة"
                      placeholder="800x1200 PNG أو JPG"
                      status={
                        formData.mobile_image_url && (
                          <span className="text-sm text-green-600">✓ صورة الموبايل جاهزة</span>
                        )
                      }
                      helperText="تُستخدم على الهواتف"
                      onFileSelect={(file) => file && handleImageUpload(file, true)}
                    />
                    {formData.mobile_image_url && (
                      <div className="relative w-full h-40 bg-secondary rounded-lg overflow-hidden">
                        <img
                          src={formData.mobile_image_url}
                          alt="معاينة الموبايل"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                </div>

                {/* Messaging */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="headline">العنوان العلوي</Label>
                    <Input
                      id="headline"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="AUGEN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta_label">نص زر الدعوة</Label>
                    <Input
                      id="cta_label"
                      value={formData.cta_label}
                      onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="slogan">الشعار</Label>
                    <Textarea
                      id="slogan"
                      rows={3}
                      value={formData.slogan}
                      onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                      placeholder="أطلق أسلوبك مع أحدث إطارات أوغن"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="cta_link">رابط زر الدعوة</Label>
                    <Input
                      id="cta_link"
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      placeholder="/categories"
                    />
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                    <Label htmlFor="sort_order">ترتيب العرض</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                      placeholder="0"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">نشط</Label>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {editingSlide ? "تحديث" : "إضافة"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Slides List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="relative aspect-video bg-secondary">
                  <img src={slide.image_url} alt="شريحة" className="w-full h-full object-cover" />
                  {!slide.is_active && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold">غير نشط</span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.4em]">
                      {slide.headline || "AUGEN"}
                    </p>
                    {slide.slogan && <p className="text-base font-semibold">{slide.slogan}</p>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ترتيب: {slide.sort_order}</span>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(slide)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(slide.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {slides.length === 0 && !showForm && (
            <Card className="p-12 text-center text-muted-foreground">
              <p>لا توجد شرائح بعد. اضغط على "إضافة شريحة" للبدء.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
