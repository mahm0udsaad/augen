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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Edit, 
  ArrowRight,
  Layers,
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
}

interface Subcategory {
  id: string
  name: string
  name_ar: string | null
  category_id: string
  description: string | null
  description_ar: string | null
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
  categories?: Category
}

export default function SubcategoriesPage() {
  const { isAuthed, isLoading } = useAdminAuth()
  const router = useRouter()
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    name_ar: "",
    category_id: "",
    description: "",
    description_ar: "",
    icon: "layers",
    color: "#3b82f6"
  })

  useEffect(() => {
    if (isAuthed) {
      loadData()
    }
  }, [isAuthed])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load categories
      const categoriesResponse = await fetch('/api/admin/categories')
      if (!categoriesResponse.ok) throw new Error('فشل في تحميل التصنيفات')
      const categoriesData = await categoriesResponse.json()
      setCategories(categoriesData)
      
      // Load subcategories
      const subcategoriesResponse = await fetch('/api/admin/subcategories')
      if (!subcategoriesResponse.ok) throw new Error('فشل في تحميل التصنيفات الفرعية')
      const subcategoriesData = await subcategoriesResponse.json()
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error("خطأ أثناء تحميل البيانات:", error)
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.category_id) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار التصنيف الرئيسي",
        variant: "destructive",
      })
      return
    }
    
    try {
      const url = editingSubcategory 
        ? `/api/admin/subcategories/${editingSubcategory.id}`
        : '/api/admin/subcategories'
      
      const method = editingSubcategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) throw new Error('فشل في حفظ التصنيف الفرعي')
      
      toast({
        title: "نجح",
        description: editingSubcategory ? "تم تحديث التصنيف الفرعي بنجاح" : "تم إضافة التصنيف الفرعي بنجاح",
      })
      
      loadData()
      handleCancel()
    } catch (error) {
      console.error("خطأ أثناء حفظ التصنيف الفرعي:", error)
      toast({
        title: "خطأ",
        description: "فشل في حفظ التصنيف الفرعي",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory)
    setFormData({
      name: subcategory.name,
      name_ar: subcategory.name_ar || "",
      category_id: subcategory.category_id,
      description: subcategory.description || "",
      description_ar: subcategory.description_ar || "",
      icon: subcategory.icon || "layers",
      color: subcategory.color || "#3b82f6"
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف الفرعي؟")) return
    
    try {
      const response = await fetch(`/api/admin/subcategories/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('فشل في حذف التصنيف الفرعي')
      
      toast({
        title: "نجح",
        description: "تم حذف التصنيف الفرعي بنجاح",
      })
      
      loadData()
    } catch (error) {
      console.error("خطأ أثناء حذف التصنيف الفرعي:", error)
      toast({
        title: "خطأ",
        description: "فشل في حذف التصنيف الفرعي",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSubcategory(null)
    setFormData({
      name: "",
      name_ar: "",
      category_id: "",
      description: "",
      description_ar: "",
      icon: "layers",
      color: "#3b82f6"
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name_ar || category?.name || "غير معروف"
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
              <h1 className="text-3xl font-bold text-right">إدارة التصنيفات الفرعية</h1>
              <p className="text-muted-foreground mt-1 text-right">إدارة التصنيفات الفرعية للمنتجات</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)} 
              className="flex items-center gap-2" 
              size="lg"
            >
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? "إلغاء" : "إضافة تصنيف فرعي"}
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-right">
                  {editingSubcategory ? "تعديل التصنيف الفرعي" : "إضافة تصنيف فرعي جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id" className="text-right block">التصنيف الرئيسي *</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                      required
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue placeholder="اختر التصنيف الرئيسي" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name_ar || category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-right block">الاسم بالإنجليزية *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Round"
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
                        placeholder="دائري"
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
                        placeholder="Round frame styles"
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
                        placeholder="تصاميم الإطارات الدائرية"
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
                      {editingSubcategory ? "تحديث" : "إضافة"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Subcategories List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subcategories.map((subcategory) => (
              <Card key={subcategory.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-right">
                      <CardTitle className="flex items-center gap-2 justify-end">
                        {subcategory.name_ar || subcategory.name}
                        <Layers className="w-5 h-5" />
                      </CardTitle>
                      <CardDescription className="text-right mt-1">
                        {subcategory.name}
                      </CardDescription>
                      <div className="mt-2 inline-block px-2 py-1 bg-primary/10 rounded text-xs text-primary">
                        {getCategoryName(subcategory.category_id)}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-right mb-4">
                    {subcategory.description_ar || subcategory.description || "لا يوجد وصف"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(subcategory)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 ml-2" />
                      تعديل
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(subcategory.id)}
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

          {subcategories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">لا توجد تصنيفات فرعية حتى الآن</p>
                {categories.length === 0 ? (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      يجب إضافة تصنيف رئيسي أولاً
                    </p>
                    <Button onClick={() => router.push('/admin/categories')} variant="outline">
                      إدارة التصنيفات
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setShowForm(true)} className="mt-4">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة أول تصنيف فرعي
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
