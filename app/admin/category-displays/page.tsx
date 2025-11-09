"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { UploadField } from "@/components/admin/upload-field"
import { Loader2, Edit, Save, X } from "lucide-react"
import { SUBCATEGORIES } from "@/lib/constants"
import { toast } from "sonner"

interface CategoryDisplay {
  id: string
  category_key: string
  title_ar: string
  title_en: string | null
  slogan_ar: string | null
  slogan_en: string | null
  background_image: string
  mobile_background_image: string | null
  is_visible: boolean
  sort_order: number
}

interface SubcategoryDisplay {
  id: string
  parent_category: string
  subcategory_key: string
  image_url: string
  mobile_image_url: string | null
  sort_order: number
}

export default function CategoryDisplaysPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const [displays, setDisplays] = useState<CategoryDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [subcategoryDisplays, setSubcategoryDisplays] = useState<SubcategoryDisplay[]>([])
  const [subcatUploading, setSubcatUploading] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState<Partial<CategoryDisplay>>({})

  useEffect(() => {
    if (isAuthed) {
      loadDisplays()
      loadSubcategoryDisplays()
    }
  }, [isAuthed])

  const loadDisplays = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/category-displays")
      if (!response.ok) throw new Error("فشل في تحميل البيانات")
      const data = await response.json()
      setDisplays(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل البيانات:", error)
      toast.error("فشل في تحميل البيانات")
    } finally {
      setLoading(false)
    }
  }

  const loadSubcategoryDisplays = async () => {
    try {
      const response = await fetch("/api/admin/subcategory-displays")
      if (!response.ok) throw new Error("فشل في تحميل بيانات الفئات الفرعية")
      const data = await response.json()
      setSubcategoryDisplays(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل بيانات الفئات الفرعية:", error)
    }
  }

  const handleImageUpload = async (file: File, isMobile = false) => {
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    setUploading(true)
    try {
      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) throw new Error("فشل في رفع الصورة")

      const data = await response.json()
      setFormData((prev) => ({
        ...prev,
        [isMobile ? "mobile_background_image" : "background_image"]: data.url,
      }))

      toast.success(isMobile ? "تم رفع صورة الموبايل" : "تم رفع الصورة")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("فشل في رفع الصورة")
    } finally {
      setUploading(false)
    }
  }

  const saveSubcategoryDisplay = async (
    parentKey: string,
    subKey: string,
    updates: Partial<Pick<SubcategoryDisplay, "image_url" | "mobile_image_url" | "sort_order">>,
  ) => {
    const existing = subcategoryDisplays.find(
      (entry) => entry.parent_category === parentKey && entry.subcategory_key === subKey,
    )

    const payload = {
      parent_category: parentKey,
      subcategory_key: subKey,
      image_url: updates.image_url || existing?.image_url,
      mobile_image_url:
        updates.mobile_image_url !== undefined ? updates.mobile_image_url : existing?.mobile_image_url,
      sort_order: updates.sort_order ?? existing?.sort_order ?? 0,
    }

    if (!payload.image_url) {
      toast.error("يرجى رفع صورة سطح المكتب أولاً")
      return
    }

    const response = await fetch("/api/admin/subcategory-displays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) throw new Error("فشل في حفظ بيانات الفئة الفرعية")

    const data = await response.json()
    setSubcategoryDisplays((prev) => {
      const others = prev.filter((entry) => entry.id !== data.id)
      return [...others, data]
    })
  }

  const handleSubcategoryImageUpload = async (
    parentKey: string,
    subKey: string,
    file: File,
    isMobile = false,
  ) => {
    if (!file) return
    const key = `${parentKey}-${subKey}-${isMobile ? "mobile" : "desktop"}`
    const formDataUpload = new FormData()
    formDataUpload.append("file", file)

    setSubcatUploading((prev) => ({ ...prev, [key]: true }))
    try {
      const response = await fetch("/api/upload-product-image", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) throw new Error("فشل في رفع الصورة")

      const data = await response.json()
      await saveSubcategoryDisplay(parentKey, subKey, {
        [isMobile ? "mobile_image_url" : "image_url"]: data.url,
      })

      toast.success("تم تحديث صورة الفئة الفرعية")
    } catch (error) {
      console.error("Error uploading subcategory image:", error)
      toast.error("فشل في رفع صورة الفئة الفرعية")
    } finally {
      setSubcatUploading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const handleEdit = (display: CategoryDisplay) => {
    setEditingId(display.id)
    setFormData(display)
  }

  const getSubcategoryEntry = (parentKey: string, subKey: string) =>
    subcategoryDisplays.find(
      (entry) => entry.parent_category === parentKey && entry.subcategory_key === subKey,
    )

  const isSubcategoryUploading = (parentKey: string, subKey: string, isMobile = false) =>
    subcatUploading[`${parentKey}-${subKey}-${isMobile ? "mobile" : "desktop"}`]

  const handleSave = async () => {
    if (!editingId || !formData.background_image) {
      toast.error("يرجى ملء جميع الحقول المطلوبة")
      return
    }

    try {
      const response = await fetch(`/api/admin/category-displays/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("فشل في الحفظ")

      toast.success("تم التحديث بنجاح")
      setEditingId(null)
      setFormData({})
      loadDisplays()
    } catch (error) {
      console.error("خطأ أثناء الحفظ:", error)
      toast.error("فشل في الحفظ")
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({})
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
          <h1 className="text-3xl font-bold">إدارة عرض التصنيفات</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displays.map((display) => (
              <Card key={display.id} className="overflow-hidden">
                {editingId === display.id ? (
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold mb-4">{display.title_ar}</h3>

                    {/* Background Images */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <UploadField
                          label="صورة الخلفية (سطح المكتب) *"
                          accept="image/*"
                          uploading={uploading}
                          buttonText="رفع صورة"
                          placeholder="صورة عريضة بدقة عالية"
                          status={
                            formData.background_image && (
                              <span className="text-sm text-green-600">✓ صورة سطح المكتب جاهزة</span>
                            )
                          }
                          helperText="تظهر على الشاشات الكبيرة"
                          onFileSelect={(file) => file && handleImageUpload(file, false)}
                        />
                        {formData.background_image && (
                          <div className="relative w-full h-40 bg-secondary rounded-lg overflow-hidden">
                            <img
                              src={formData.background_image}
                              alt="معاينة"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <UploadField
                          label="صورة الخلفية (موبايل)"
                          accept="image/*"
                          uploading={uploading}
                          buttonText="رفع صورة"
                          placeholder="صورة عمودية للهواتف"
                          status={
                            formData.mobile_background_image && (
                              <span className="text-sm text-green-600">✓ صورة الموبايل جاهزة</span>
                            )
                          }
                          helperText="اختياري"
                          onFileSelect={(file) => file && handleImageUpload(file, true)}
                        />
                        {formData.mobile_background_image && (
                          <div className="relative w-full h-40 bg-secondary rounded-lg overflow-hidden">
                            <img
                              src={formData.mobile_background_image}
                              alt="معاينة الموبايل"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subcategory Images */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-lg font-semibold">صور الفئات الفرعية</h4>
                        <p className="text-sm text-muted-foreground">
                          تنعكس هذه الصور في بطاقات الفئات الفرعية داخل الصفحة الرئيسية.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {Object.entries(SUBCATEGORIES).map(([subKey, subcat]) => {
                          const entry = getSubcategoryEntry(display.category_key, subKey)

                          return (
                            <div key={subKey} className="border rounded-lg p-4 space-y-3">
                              <div>
                                <p className="font-semibold">{subcat.name_ar}</p>
                                <p className="text-xs text-muted-foreground">{subcat.description_ar}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <UploadField
                                  label="صورة سطح المكتب"
                                  accept="image/*"
                                  uploading={isSubcategoryUploading(display.category_key, subKey)}
                                  buttonText="رفع صورة"
                                  status={
                                    entry?.image_url && (
                                      <span className="text-sm text-green-600">✓ صورة سطح المكتب جاهزة</span>
                                    )
                                  }
                                  helperText="تظهر على الشاشات العريضة"
                                  onFileSelect={(file) =>
                                    file &&
                                    handleSubcategoryImageUpload(display.category_key, subKey, file, false)
                                  }
                                />
                                <UploadField
                                  label="صورة الموبايل"
                                  accept="image/*"
                                  uploading={isSubcategoryUploading(display.category_key, subKey, true)}
                                  buttonText="رفع صورة"
                                  status={
                                    entry?.mobile_image_url && (
                                      <span className="text-sm text-green-600">✓ صورة الموبايل جاهزة</span>
                                    )
                                  }
                                  helperText="اختياري"
                                  onFileSelect={(file) =>
                                    file &&
                                    handleSubcategoryImageUpload(display.category_key, subKey, file, true)
                                  }
                                />
                              </div>
                              {(entry?.image_url || entry?.mobile_image_url) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {entry?.image_url && (
                                    <div className="relative h-32 rounded-lg overflow-hidden">
                                      <img src={entry.image_url} alt="معاينة سطح المكتب" className="object-cover w-full h-full" />
                                    </div>
                                  )}
                                  {entry?.mobile_image_url && (
                                    <div className="relative h-32 rounded-lg overflow-hidden">
                                      <img
                                        src={entry.mobile_image_url}
                                        alt="معاينة الموبايل"
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Slogan */}
                    <div className="space-y-2">
                      <Label htmlFor="slogan_ar">الشعار (بالعربية)</Label>
                      <Textarea
                        id="slogan_ar"
                        value={formData.slogan_ar || ""}
                        onChange={(e) => setFormData({ ...formData, slogan_ar: e.target.value })}
                        placeholder="أفضل التصاميم وأفضل جودة"
                        rows={2}
                      />
                    </div>

                    {/* Sort Order */}
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">ترتيب العرض</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order || 0}
                        onChange={(e) =>
                          setFormData({ ...formData, sort_order: parseInt(e.target.value) })
                        }
                      />
                    </div>

                    {/* Visibility */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="is_visible"
                        checked={formData.is_visible ?? true}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                      />
                      <Label htmlFor="is_visible">إظهار في الصفحة الرئيسية</Label>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t">
                      <Button onClick={handleSave} disabled={uploading} className="flex-1">
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1">
                        <X className="w-4 h-4 ml-2" />
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="relative h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${display.background_image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
                      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                        <h2 className="text-2xl font-bold mb-2">{display.title_ar}</h2>
                        {display.slogan_ar && <p className="text-lg opacity-90">{display.slogan_ar}</p>}
                      </div>
                      {!display.is_visible && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                          مخفي
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          ترتيب: {display.sort_order}
                        </span>
                        <Button size="sm" onClick={() => handleEdit(display)}>
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
