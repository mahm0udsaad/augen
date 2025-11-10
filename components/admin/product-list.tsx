"use client"

import { useState } from "react"
import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2, Tag } from "lucide-react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [sellOpen, setSellOpen] = useState(false)
  const [sellProduct, setSellProduct] = useState<Product | null>(null)
  const [sellQuantity, setSellQuantity] = useState<number>(1)
  const [sellNote, setSellNote] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  const openSell = (product: Product) => {
    setSellProduct(product)
    setSellQuantity(1)
    setSellNote("")
    setSellOpen(true)
  }

  const submitSell = async () => {
    if (!sellProduct) return
    if (sellQuantity <= 0) {
      toast({
        title: "خطأ",
        description: "الكمية يجب أن تكون أكبر من صفر",
        variant: "destructive",
      })
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: sellProduct.id,
          quantity: sellQuantity,
          note: sellNote,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "فشل تسجيل عملية البيع")
      }
      toast({
        title: "تم",
        description: "تم تسجيل البيع وتحديث المخزون",
      })
      setSellOpen(false)
    } catch (e: any) {
      toast({
        title: "خطأ",
        description: e.message || "تعذر إتمام العملية",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }
  if (products.length === 0) {
    return (
      <Card className="p-12 text-center" dir="rtl">
        <p className="text-muted-foreground">لا توجد منتجات بعد. أضف أول منتج الآن!</p>
      </Card>
    )
  }

  return (
    <>
    <div className="grid gap-4" dir="rtl">
      {products.map((product) => (
        <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="grid grid-cols-1 md:grid-cols-[100px_1fr_auto] gap-4 items-center">
            {/* Image */}
            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-secondary">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>

            {/* Info */}
            <div className="space-y-2">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.style}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">السعر: </span>
                  <span className="font-medium">{product.price} ج.م</span>
                </div>
                <div>
                  <span className="text-muted-foreground">المادة: </span>
                  <span className="font-medium">{product.material}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">التصنيف: </span>
                  <span className="font-medium capitalize">{product.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">اللون: </span>
                  <span className="font-medium">{product.color}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => openSell(product)} className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">بيع</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(product)} className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">تعديل</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">حذف</span>
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تسجيل بيع خارج الموقع</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded border p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المنتج</span>
                <span className="font-medium">{sellProduct?.name}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-muted-foreground">المخزون الحالي</span>
                <span className="font-medium">{sellProduct?.quantity}</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">الكمية</label>
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                value={sellQuantity}
                onChange={(e) => setSellQuantity(parseInt(e.target.value || "1"))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">ملاحظة (اختياري)</label>
              <textarea
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={sellNote}
                onChange={(e) => setSellNote(e.target.value)}
                placeholder="تفاصيل عملية البيع"
              />
            </div>
            <Button onClick={submitSell} className="w-full" disabled={submitting}>
              {submitting ? "جارٍ الحفظ..." : "تسجيل البيع وتحديث المخزون"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
