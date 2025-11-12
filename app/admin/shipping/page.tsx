"use client"

import { useEffect, useState } from "react"
import { Loader2, Pencil, PlusCircle, RefreshCw, Trash2 } from "lucide-react"
import AdminHeader from "@/components/admin-header"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ShippingCity } from "@/types/shipping"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"

interface AdminShippingCity extends ShippingCity {
  is_active: boolean
}

const initialFormState = {
  id: "",
  nameEn: "",
  nameAr: "",
  shippingFee: "",
  sortOrder: 0,
  isActive: true,
}

export default function ShippingManagementPage() {
  const { isAuthed, isLoading: authLoading } = useAdminAuth()
  const [cities, setCities] = useState<AdminShippingCity[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [createFormState, setCreateFormState] = useState(initialFormState)
  const [editFormState, setEditFormState] = useState(initialFormState)
  const [editingCity, setEditingCity] = useState<AdminShippingCity | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const loadCities = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/shipping-cities")
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "فشل في تحميل مدن الشحن")
      }
      setCities(data.cities || [])
    } catch (error) {
      console.error(error)
      toast.error("فشل في تحميل مدن الشحن")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthed) {
      loadCities()
    }
  }, [isAuthed])

  const submitCity = async (
    event: React.FormEvent<HTMLFormElement>,
    formState: typeof initialFormState,
    resetForm: () => void
  ) => {
    event.preventDefault()
    if (!formState.nameEn.trim()) {
      toast.error("يرجى إدخال اسم المدينة باللغة الإنجليزية")
      return
    }

    const shippingFeeNumber = Number(formState.shippingFee)
    if (Number.isNaN(shippingFeeNumber) || shippingFeeNumber < 0) {
      toast.error("يرجى إدخال قيمة شحن صحيحة")
      return
    }

    setSaving(true)
    try {
      const payload = {
        nameEn: formState.nameEn.trim(),
        nameAr: formState.nameAr.trim() || null,
        shippingFee: shippingFeeNumber,
        sortOrder: formState.sortOrder,
        isActive: formState.isActive,
      }

      const isEditing = Boolean(formState.id)
      const url = isEditing
        ? `/api/admin/shipping-cities/${formState.id}`
        : "/api/admin/shipping-cities"
      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "حدث خطأ غير متوقع")
      }

      toast.success(isEditing ? "تم تحديث المدينة" : "تمت إضافة المدينة")
      resetForm()
      if (isEditing) {
        setEditingCity(null)
        setIsEditorOpen(false)
      }
      loadCities()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "فشل حفظ المدينة")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (city: AdminShippingCity) => {
    setEditingCity(city)
    setEditFormState({
      id: city.id,
      nameEn: city.name_en,
      nameAr: city.name_ar || "",
      shippingFee: String(city.shipping_fee ?? 0),
      sortOrder: city.sort_order ?? 0,
      isActive: city.is_active,
    })
    setIsEditorOpen(true)
  }

  const closeEditor = () => {
    setIsEditorOpen(false)
    setEditingCity(null)
    setEditFormState(initialFormState)
  }

  const handleEditorOpenChange = (open: boolean) => {
    if (!open) {
      closeEditor()
    } else {
      setIsEditorOpen(true)
    }
  }

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) =>
    submitCity(event, createFormState, () => setCreateFormState(initialFormState))

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) =>
    submitCity(event, editFormState, () => setEditFormState(initialFormState))

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه المدينة؟")
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/shipping-cities/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "تعذر حذف المدينة")
      }
      toast.success("تم حذف المدينة")
      loadCities()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "تعذر حذف المدينة")
    }
  }

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(
      value || 0
    )

  const showFullScreenLoader = authLoading || (loading && cities.length === 0)

  if (showFullScreenLoader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthed) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 pt-24 space-y-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">إدارة تكاليف الشحن</h1>
              <p className="text-muted-foreground mt-1">
                أضف مدن الشحن في مصر وحدد رسوم الشحن لكل مدينة
              </p>
            </div>
            <Button variant="outline" onClick={loadCities} disabled={loading}>
              <RefreshCw className="w-4 h-4 ml-2" /> تحديث
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              <h2 className="text-xl font-semibold">إضافة مدينة جديدة</h2>
            </div>
            <form className="space-y-4" onSubmit={handleCreateSubmit}>
              <div className="space-y-2">
                <Label htmlFor="nameEn">اسم المدينة (EN)</Label>
                <Input
                  id="nameEn"
                  value={createFormState.nameEn}
                  onChange={(e) => setCreateFormState({ ...createFormState, nameEn: e.target.value })}
                  placeholder="Cairo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameAr">اسم المدينة (AR)</Label>
                <Input
                  id="nameAr"
                  value={createFormState.nameAr}
                  onChange={(e) => setCreateFormState({ ...createFormState, nameAr: e.target.value })}
                  placeholder="القاهرة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shippingFee">رسوم الشحن (ج.م)</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={createFormState.shippingFee}
                  onChange={(e) => setCreateFormState({ ...createFormState, shippingFee: e.target.value })}
                  placeholder="50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sortOrder">ترتيب العرض</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={createFormState.sortOrder}
                  onChange={(e) =>
                    setCreateFormState({ ...createFormState, sortOrder: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex items-center justify-between border rounded-md px-3 py-2">
                <div>
                  <Label className="text-sm font-medium">حالة التفعيل</Label>
                  <p className="text-xs text-muted-foreground">إظهار المدينة للعملاء</p>
                </div>
                <Switch
                  checked={createFormState.isActive}
                  onCheckedChange={(checked) =>
                    setCreateFormState({ ...createFormState, isActive: checked })
                  }
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                إضافة المدينة
              </Button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-card border rounded-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">قائمة المدن</h2>
              <Badge variant="secondary">{cities.length} مدينة</Badge>
            </div>
            <div className="p-4 overflow-x-auto">
              {cities.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  لا توجد مدن شحن بعد
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المدينة</TableHead>
                      <TableHead>الرسوم</TableHead>
                      <TableHead>الترتيب</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-left">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell>
                          <div className="font-semibold">{city.name_en}</div>
                          <div className="text-sm text-muted-foreground">
                            {city.name_ar || '—'}
                          </div>
                        </TableCell>
                        <TableCell>{formatPrice(Number(city.shipping_fee) || 0)}</TableCell>
                        <TableCell>{city.sort_order ?? 0}</TableCell>
                        <TableCell>
                          {city.is_active ? (
                            <Badge className="bg-green-600 hover:bg-green-600">مفعل</Badge>
                          ) : (
                            <Badge variant="outline">مخفي</Badge>
                          )}
                        </TableCell>
                        <TableCell className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(city)}
                          >
                            <Pencil className="w-4 h-4 ml-1" /> تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(city.id)}
                          >
                            <Trash2 className="w-4 h-4 ml-1" /> حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingCity && (
        isDesktop ? (
          <Dialog open={isEditorOpen} onOpenChange={handleEditorOpenChange}>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle>تعديل {editingCity.name_ar || editingCity.name_en}</DialogTitle>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleEditSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="edit-name-en">اسم المدينة (EN)</Label>
                  <Input
                    id="edit-name-en"
                    value={editFormState.nameEn}
                    onChange={(e) => setEditFormState({ ...editFormState, nameEn: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name-ar">اسم المدينة (AR)</Label>
                  <Input
                    id="edit-name-ar"
                    value={editFormState.nameAr}
                    onChange={(e) => setEditFormState({ ...editFormState, nameAr: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-shipping-fee">رسوم الشحن (ج.م)</Label>
                  <Input
                    id="edit-shipping-fee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editFormState.shippingFee}
                    onChange={(e) => setEditFormState({ ...editFormState, shippingFee: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sort-order">ترتيب العرض</Label>
                  <Input
                    id="edit-sort-order"
                    type="number"
                    value={editFormState.sortOrder}
                    onChange={(e) =>
                      setEditFormState({ ...editFormState, sortOrder: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between border rounded-md px-3 py-2">
                  <div>
                    <Label className="text-sm font-medium">حالة التفعيل</Label>
                    <p className="text-xs text-muted-foreground">إظهار المدينة للعملاء</p>
                  </div>
                  <Switch
                    checked={editFormState.isActive}
                    onCheckedChange={(checked) =>
                      setEditFormState({ ...editFormState, isActive: checked })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={closeEditor}>
                    إلغاء
                  </Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                    تحديث المدينة
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={isEditorOpen} onOpenChange={handleEditorOpenChange}>
            <DrawerContent dir="rtl">
              <DrawerHeader className="text-right">
                <DrawerTitle>تعديل {editingCity.name_ar || editingCity.name_en}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 pb-8">
                <form className="space-y-4" onSubmit={handleEditSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="drawer-edit-name-en">اسم المدينة (EN)</Label>
                    <Input
                      id="drawer-edit-name-en"
                      value={editFormState.nameEn}
                      onChange={(e) => setEditFormState({ ...editFormState, nameEn: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drawer-edit-name-ar">اسم المدينة (AR)</Label>
                    <Input
                      id="drawer-edit-name-ar"
                      value={editFormState.nameAr}
                      onChange={(e) => setEditFormState({ ...editFormState, nameAr: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drawer-edit-shipping-fee">رسوم الشحن (ج.م)</Label>
                    <Input
                      id="drawer-edit-shipping-fee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editFormState.shippingFee}
                      onChange={(e) => setEditFormState({ ...editFormState, shippingFee: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="drawer-edit-sort-order">ترتيب العرض</Label>
                    <Input
                      id="drawer-edit-sort-order"
                      type="number"
                      value={editFormState.sortOrder}
                      onChange={(e) =>
                        setEditFormState({ ...editFormState, sortOrder: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div>
                      <Label className="text-sm font-medium">حالة التفعيل</Label>
                      <p className="text-xs text-muted-foreground">إظهار المدينة للعملاء</p>
                    </div>
                    <Switch
                      checked={editFormState.isActive}
                      onCheckedChange={(checked) =>
                        setEditFormState({ ...editFormState, isActive: checked })
                      }
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="button" variant="outline" className="flex-1" onClick={closeEditor}>
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex-1" disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
                      تحديث المدينة
                    </Button>
                  </div>
                </form>
              </div>
            </DrawerContent>
          </Drawer>
        )
      )}
    </div>
  )
}
