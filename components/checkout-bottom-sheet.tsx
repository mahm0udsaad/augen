"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import type { ShippingCity } from "@/types/shipping"
import Link from "next/link"

const egpFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EGP",
})

interface CheckoutBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  customerInfo: {
    name: string
    whatsapp: string
    email: string
    address: string
    notes: string
    shippingCityId?: string
  }
  onCustomerInfoChange: (info: any) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
  isOrderSubmitted: boolean
  orderNumber: string
  shippingCities: ShippingCity[]
  shippingError?: string | null
  selectedShippingCityId?: string
  onShippingCityChange: (cityId: string) => void
  isLoadingShippingCities?: boolean
  totals: {
    items: string
    shipping: string
    grand: string
  }
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
  shippingCities,
  shippingError = null,
  selectedShippingCityId,
  onShippingCityChange,
  isLoadingShippingCities = false,
  totals,
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

  const shippingSelectionDisabled =
    isLoadingShippingCities || !!shippingError || shippingCities.length === 0

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
        dir="ltr"
      >
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background z-10">
          <h2 className="text-xl font-bold">
            {isOrderSubmitted ? "Order Successful!" : "Complete Order"}
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
                  Order Number: <span className="font-bold text-primary">{orderNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  Our sales team will contact you soon via WhatsApp to confirm your order
                </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/categories" className="w-full">
                  <Button size="lg" className="w-full min-h-[48px]">
                    Continue Shopping
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={onClose} className="w-full min-h-[48px]">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                  required
                  className="min-h-[48px] text-base"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-base">
                  WhatsApp Number <span className="text-destructive">*</span>
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
                  We will contact you via this number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email (optional)
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
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={customerInfo.address}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, address: e.target.value })
                  }
                  placeholder="Enter your full address"
                  rows={3}
                  className="text-base resize-none"
                  autoComplete="street-address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-base">
                  Additional Notes (optional)
                </Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    onCustomerInfoChange({ ...customerInfo, notes: e.target.value })
                  }
                  placeholder="Any special notes for the order"
                  rows={3}
                  className="text-base resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">
                  Shipping City <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedShippingCityId}
                  onValueChange={onShippingCityChange}
                  disabled={shippingSelectionDisabled}
                >
                  <SelectTrigger className="min-h-[48px] text-base">
                    <SelectValue
                      placeholder={
                        isLoadingShippingCities
                          ? "Loading shipping cities..."
                          : shippingError
                          ? "Shipping unavailable"
                          : shippingCities.length === 0
                          ? "No shipping cities"
                          : "Select your city"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[70]" position="popper">
                    {shippingCities.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        <div className="flex flex-col text-start">
                          <span className="font-medium">{city.name_en}</span>
                          <span className="text-xs text-muted-foreground">
                            {(city.name_ar || '').trim() || city.name_en} • {egpFormatter.format(city.shipping_fee)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Shipping fees vary by city and are added to your total
                </p>
                {shippingError && !isLoadingShippingCities && (
                  <p className="text-xs text-destructive">
                    Shipping options are unavailable right now. Please try again later.
                  </p>
                )}
              </div>

              <div className="border-t pt-4 mt-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items Subtotal</span>
                    <span className="font-semibold">{totals.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="font-semibold">{totals.shipping}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Total</span>
                    <span className="text-primary">{totals.grand}</span>
                  </div>
                </div>
                <Button
                  onClick={onSubmitOrder}
                  className="w-full min-h-[52px] text-base"
                  size="lg"
                  disabled={
                    isSubmitting ||
                    shippingSelectionDisabled ||
                    !selectedShippingCityId
                  }
                >
                  {isSubmitting ? "Submitting..." : "Confirm Order"}
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
