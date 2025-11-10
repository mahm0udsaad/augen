"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

interface CheckoutBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  customerInfo: {
    name: string
    whatsapp: string
    email: string
    address: string
    notes: string
  }
  onCustomerInfoChange: (info: any) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
  isOrderSubmitted: boolean
  orderNumber: string
  totalPrice: string
}

export default function CheckoutBottomSheet({
  isOpen,
  onClose,
  customerInfo,
  onCustomerInfoChange,
  onSubmitOrder,
  isSubmitting,
  isOrderSubmitted,
  orderNumber,
  totalPrice,
}: CheckoutBottomSheetProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden"
      // Set viewport height to prevent iOS Safari issues
      document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`)
    } else {
      setIsAnimating(false)
      document.body.style.overflow = ""
      document.documentElement.style.removeProperty("--vh")
    }

    return () => {
      document.body.style.overflow = ""
      document.documentElement.style.removeProperty("--vh")
    }
  }, [isOpen])

  if (!mounted || (!isOpen && !isAnimating)) return null

  const sheet = (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[60] bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          maxHeight: "calc(var(--vh, 1vh) * 90)",
          height: "auto",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
        dir="rtl"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-bold">
            {isOrderSubmitted ? "تم الطلب بنجاح!" : "إتمام الطلب"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 pb-6 flex-1" style={{ paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}>
          {isOrderSubmitted ? (
            <div className="text-center py-8 space-y-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              <div className="space-y-4">
                <p className="text-lg">
                  رقم الطلب: <span className="font-bold text-primary">{orderNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  سيتواصل معك فريق المبيعات قريباً عبر الواتساب لتأكيد الطلب
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/categories" className="w-full">
                  <Button size="lg" className="w-full min-h-[48px]">
                    مواصلة التسوق
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={onClose} className="w-full min-h-[48px]">
                  إغلاق
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  الاسم الكامل <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, name: e.target.value })
                  }
                  placeholder="أدخل اسمك الكامل"
                  required
                  className="min-h-[48px] text-base"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-base">
                  رقم الواتساب <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  type="tel"
                  value={customerInfo.whatsapp}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, whatsapp: e.target.value })
                  }
                  placeholder="+20 1234567890"
                  required
                  className="min-h-[48px] text-base"
                  autoComplete="tel"
                />
                <p className="text-xs text-muted-foreground">
                  سيتم التواصل معك عبر هذا الرقم
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  البريد الإلكتروني (اختياري)
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, email: e.target.value })
                  }
                  placeholder="example@domain.com"
                  className="min-h-[48px] text-base"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-base">
                  العنوان (اختياري)
                </Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, address: e.target.value })
                  }
                  placeholder="أدخل عنوانك الكامل"
                  rows={3}
                  className="text-base resize-none"
                  autoComplete="street-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  ملاحظات إضافية (اختياري)
                </Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, notes: e.target.value })
                  }
                  placeholder="أي ملاحظات خاصة بالطلب"
                  rows={3}
                  className="text-base resize-none"
                />
              </div>

              <div className="border-t pt-4 mt-6 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>المجموع الكلي:</span>
                  <span className="text-primary">{totalPrice}</span>
                </div>
                <Button
                  onClick={onSubmitOrder}
                  className="w-full min-h-[52px] text-base"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )

  return createPortal(sheet, document.body)
}

