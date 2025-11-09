"use client"

import type { Product } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"

interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card className="p-12 text-center" dir="rtl">
        <p className="text-muted-foreground">لا توجد منتجات بعد. أضف أول منتج الآن!</p>
      </Card>
    )
  }

  return (
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
  )
}
