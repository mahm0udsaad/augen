"use client"

import { useState, useEffect } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import AdminHeader from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Edit, 
  ArrowRight,
  Tags,
  Save,
  X
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { IconPicker } from "@/components/admin/icon-picker"
import { ColorPicker } from "@/components/admin/color-picker"

interface Category {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export default function CategoriesPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    description: "",
    description_ar: "",
    icon: "glasses",
    color: "#3b82f6"
  })

  useEffect(() => {
    if (isAuthed) {
      loadCategories()
    }
  }, [isAuthed])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('فشل في تحميل التصنيفات')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل التصنيفات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('فشل في حفظ التصنيف')
      
      toast({
        title: "نجح",
        description: editingCategory ? "تم تحديث التصنيف بنجاح" : "تم إضافة التصنيف بنجاح",
      })
      
      loadCategories()
      handleCancel()
    } catch (error) {
      console.error("خطأ أثناء حفظ التصنيف:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ التصنيف",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      name_ar: category.name_ar || "",
      description: category.description || "",
      description_ar: category.description_ar || "",
      icon: category.icon || "glasses",
      color: category.color || "#3b82f6"
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return
    
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('فشل في حذف التصنيف')
      
      toast({
        title: "نجح",
        description: "تم حذف التصنيف بنجاح",
      })
      
      loadCategories()
    } catch (error) {
      console.error("خطأ أثناء حذف التصنيف:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف التصنيف",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
    setFormData({
      name: "",
      name_ar: "",
      description: "",
      description_ar: "",
      icon: "glasses",
      color: "#3b82f6"
    })
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
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
                className="mb-2 -mr-2"
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                العودة للوحة التحكم
              </Button>
              <h1 className="text-3xl font-bold text-right">إدارة التصنيفات</h1>
              <p className="text-muted-foreground mt-1 text-right">إدارة التصنيفات الرئيسية للمنتجات</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="flex items-center gap-2" 
              size="lg"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "إلغاء" : "إضافة تصنيف"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right">
                  {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right block">الاسم بالإنجليزية *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Classic"
                        required
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name_ar" className="text-right block">الاسم بالعربية</Label>
                      <Input
                        id="name_ar"
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                        placeholder="كلاسيك"
                        className="text-right"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-right block">الوصف بالإنجليزية</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Classic eyewear styles"
                        rows={3}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description_ar" className="text-right block">الوصف بالعربية</Label>
                      <Textarea
                        id="description_ar"
                        value={formData.description_ar}
                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                        placeholder="نظارات بتصاميم كلاسيكية"
                        rows={3}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <IconPicker
                      value={formData.icon}
                      onChange={(icon) => setFormData({ ...formData, icon })}
                      label="اختر الأيقونة"
                    />
                    
                    <ColorPicker
                      value={formData.color}
                      onChange={(color) => setFormData({ ...formData, color })}
                      label="اختر اللون"
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {editingCategory ? "تحديث" : "إضافة"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Categories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-right">
                      <CardTitle className="flex items-center gap-2 justify-end">
                        {category.name_ar || category.name}
                        <Tags className="w-5 h-5" />
                      </CardTitle>
                      <CardDescription className="text-right mt-1">
                        {category.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-right mb-4">
                    {category.description_ar || category.description || "لا يوجد وصف"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Tags className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد تصنيفات حتى الآن</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول تصنيف
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
