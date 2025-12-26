"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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
    name?: string
    whatsapp?: string
    email?: string
    address?: string
    notes?: string
    shippingCityId?: string
    // New Shopify-style fields
    emailOrPhone?: string
    emailMarketing?: boolean
    firstName?: string
    lastName?: string
    apartment?: string
    city?: string
    postalCode?: string
    country?: string
  }
  onCustomerInfoChange: (info: any) => void
  onSubmitOrder: () => void
  isSubmitting: boolean
  isOrderSubmitted: boolean
  orderNumber: string
  shippingCities: ShippingCity[]
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
    isLoadingShippingCities || shippingCities.length === 0

  // Helper function to detect if input is email or phone
  const detectInputType = (value: string): 'email' | 'phone' | null => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/
    
    if (emailRegex.test(value)) return 'email'
    if (phoneRegex.test(value.replace(/\s/g, ''))) return 'phone'
    return null
  }

  // Handle emailOrPhone change - auto-detect and populate appropriate fields
  const handleEmailOrPhoneChange = (value: string) => {
    const inputType = detectInputType(value)
    const updatedInfo: typeof customerInfo = { ...customerInfo, emailOrPhone: value }
    
    if (inputType === 'email') {
      updatedInfo.email = value
      // Clear whatsapp if user switches to email
      if (!customerInfo.whatsapp) {
        updatedInfo.whatsapp = ''
      }
    } else if (inputType === 'phone') {
      updatedInfo.whatsapp = value.replace(/\s/g, '')
      // Clear email if user switches to phone
      if (!customerInfo.email) {
        updatedInfo.email = ''
      }
    }
    
    onCustomerInfoChange(updatedInfo)
  }

  // Get current emailOrPhone value (prioritize emailOrPhone, fallback to email or whatsapp)
  const getEmailOrPhoneValue = () => {
    if (customerInfo.emailOrPhone) return customerInfo.emailOrPhone
    if (customerInfo.email) return customerInfo.email
    if (customerInfo.whatsapp) return customerInfo.whatsapp
    return ''
  }

  // Get current name values (support both old and new structure)
  const getFirstName = () => {
    if (customerInfo.firstName) return customerInfo.firstName
    if (customerInfo.name) {
      const parts = customerInfo.name.split(' ')
      return parts[0] || ''
    }
    return ''
  }

  const getLastName = () => {
    if (customerInfo.lastName) return customerInfo.lastName
    if (customerInfo.name) {
      const parts = customerInfo.name.split(' ')
      return parts.slice(1).join(' ') || ''
    }
    return ''
  }

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
            <div className="space-y-6 py-4">
              {/* Contact Information Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="emailOrPhone"
                    type="text"
                    value={getEmailOrPhoneValue()}
                    onChange={(e) => handleEmailOrPhoneChange(e.target.value)}
                    placeholder="Email or mobile phone number"
                    className="min-h-[48px] text-base"
                    autoComplete="email"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailMarketing"
                    checked={customerInfo.emailMarketing ?? false}
                    onCheckedChange={(checked) =>
                      onCustomerInfoChange({ ...customerInfo, emailMarketing: checked === true })
                    }
                  />
                  <Label
                    htmlFor="emailMarketing"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Email me with news and offers
                  </Label>
                </div>
              </div>

              {/* Delivery Information Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold">Delivery</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-base">
                    Country/Region
                  </Label>
                  <Select
                    value={customerInfo.country || "Egypt"}
                    onValueChange={(value) =>
                      onCustomerInfoChange({ ...customerInfo, country: value })
                    }
                  >
                    <SelectTrigger className="min-h-[48px] text-base">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="z-[70]" position="popper">
                      <SelectItem value="Egypt">Egypt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-base">
                      First name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={getFirstName()}
                      onChange={(e) =>
                        onCustomerInfoChange({
                          ...customerInfo,
                          firstName: e.target.value,
                          name: `${e.target.value} ${getLastName()}`.trim(),
                        })
                      }
                      placeholder="First name"
                      required
                      className="min-h-[48px] text-base"
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-base">
                      Last name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={getLastName()}
                      onChange={(e) =>
                        onCustomerInfoChange({
                          ...customerInfo,
                          lastName: e.target.value,
                          name: `${getFirstName()} ${e.target.value}`.trim(),
                        })
                      }
                      placeholder="Last name"
                      required
                      className="min-h-[48px] text-base"
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base">
                    Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="address"
                    value={customerInfo.address || ''}
                    onChange={(e) =>
                      onCustomerInfoChange({ ...customerInfo, address: e.target.value })
                    }
                    placeholder="Address"
                    required
                    className="min-h-[48px] text-base"
                    autoComplete="street-address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apartment" className="text-base">
                    Apartment, suite, etc. (optional)
                  </Label>
                  <Input
                    id="apartment"
                    value={customerInfo.apartment || ''}
                    onChange={(e) =>
                      onCustomerInfoChange({ ...customerInfo, apartment: e.target.value })
                    }
                    placeholder="Apartment, suite, etc. (optional)"
                    className="min-h-[48px] text-base"
                    autoComplete="address-line2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-base">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={customerInfo.city || ''}
                    onChange={(e) =>
                      onCustomerInfoChange({ ...customerInfo, city: e.target.value })
                    }
                    placeholder="City"
                    className="min-h-[48px] text-base"
                    autoComplete="address-level2"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-base">
                    Governorate <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedShippingCityId}
                    onValueChange={onShippingCityChange}
                    disabled={shippingSelectionDisabled}
                  >
                    <SelectTrigger className="min-h-[48px] text-base">
                      <SelectValue
                        placeholder={
                          shippingSelectionDisabled
                            ? "Shipping unavailable"
                            : "Select governorate"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-base">
                    Postal code (optional)
                  </Label>
                  <Input
                    id="postalCode"
                    value={customerInfo.postalCode || ''}
                    onChange={(e) =>
                      onCustomerInfoChange({ ...customerInfo, postalCode: e.target.value })
                    }
                    placeholder="Postal code (optional)"
                    className="min-h-[48px] text-base"
                    autoComplete="postal-code"
                  />
                </div>
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
                    !selectedShippingCityId ||
                    !getFirstName() ||
                    !getLastName() ||
                    !customerInfo.address ||
                    (!customerInfo.email && !customerInfo.whatsapp && !getEmailOrPhoneValue())
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
