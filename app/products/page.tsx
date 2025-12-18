"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import InfiniteScroll from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CheckoutBottomSheet from "@/components/checkout-bottom-sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useShippingCities } from "@/hooks/use-shipping-cities"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import type { Product } from "@/lib/products"
import type { ParentCategory, Subcategory } from "@/lib/constants"
import { toast } from "sonner"

const CUSTOMER_INFO_STORAGE_KEY = "augen_checkout_info"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const parentFilter = (searchParams.get("parent") as ParentCategory | null) ?? null
  const subFilter = (searchParams.get("sub") as Subcategory | null) ?? null

  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  } = useInfiniteScroll({
    parentCategory: parentFilter || undefined,
    subcategory: subFilter || undefined,
    initialLimit: 12,
    loadMoreLimit: 12,
  })

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const {
    cities: shippingCities,
    isLoading: isLoadingShippingCities,
  } = useShippingCities()

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    whatsapp: "",
    email: "",
    address: "",
    notes: "",
    shippingCityId: "",
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCustomerInfo((prev) => ({
          ...prev,
          ...parsed,
          shippingCityId: parsed.shippingCityId || prev.shippingCityId || "",
        }))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_INFO_STORAGE_KEY, JSON.stringify(customerInfo))
    } catch {
      // ignore
    }
  }, [customerInfo])

  useEffect(() => {
    if (!isLoadingShippingCities && shippingCities.length > 0) {
      setCustomerInfo((prev) => {
        if (
          prev.shippingCityId &&
          shippingCities.some((city) => city.id === prev.shippingCityId)
        ) {
          return prev
        }
        return { ...prev, shippingCityId: shippingCities[0].id }
      })
    }
  }, [isLoadingShippingCities, shippingCities])

  // Filter products client-side for additional filtering if needed
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (subFilter) {
        // Always respect parent category when filtering by subcategory
        if (parentFilter) {
          return product.subcategory === subFilter && product.parent_category === parentFilter
        }
        return product.subcategory === subFilter
      }
      // Exclude high_quality products when filtering by parent category only
      if (parentFilter) return product.parent_category === parentFilter && product.subcategory !== 'high_quality'
      return true
    })
  }, [products, parentFilter, subFilter])

  const handleOrderNow = (product: Product) => {
    setSelectedProduct(product)
    setIsCheckoutOpen(true)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(price)

  const selectedShippingCity = shippingCities.find(
    (city) => city.id === customerInfo.shippingCityId
  )
  const shippingFee = selectedShippingCity?.shipping_fee ?? 0
  const itemsTotal = selectedProduct ? selectedProduct.price : 0
  const totalWithShipping = itemsTotal + shippingFee

  const handleSubmitOrder = async () => {
    if (!selectedProduct) return
    if (!customerInfo.name || !customerInfo.whatsapp) {
      toast.error("Please enter your name and WhatsApp number")
      return
    }
    if (!customerInfo.shippingCityId) {
      toast.error("Please select a shipping city")
      return
    }
    const whatsappRegex = /^[+]?[0-9]{10,15}$/
    if (!whatsappRegex.test(customerInfo.whatsapp.replace(/\s/g, ""))) {
      toast.error("Invalid WhatsApp number")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerInfo.name,
          customerWhatsapp: customerInfo.whatsapp,
          customerEmail: customerInfo.email,
          customerAddress: customerInfo.address,
          notes: customerInfo.notes,
          shippingCityId: customerInfo.shippingCityId,
          items: [
            {
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              productImage: selectedProduct.image,
              quantity: 1,
              unitPrice: selectedProduct.price,
            },
          ],
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }
      setOrderNumber(data.order.order_number)
      setIsOrderSubmitted(true)
      toast.success("Order created successfully!")
    } catch (error: any) {
      console.error("Error submitting order:", error)
      toast.error(error.message || "An error occurred while creating the order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background" dir="ltr">
      <Header language="en" />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Products</h1>
          {parentFilter || subFilter ? (
            <p className="text-muted-foreground mt-1">Filtered by selected category</p>
          ) : (
            <p className="text-muted-foreground mt-1">Browse all Augen products</p>
          )}
        </div>

        {error ? (
          <div className="text-center py-24">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : filteredProducts.length === 0 && !loading ? (
          <div className="text-center py-24">
            <p className="text-lg">No matching products found at the moment</p>
          </div>
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                  <div className="mt-2">
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={product.quantity !== undefined && product.quantity <= 0}
                      onClick={() => handleOrderNow(product)}
                    >
                      Order Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>

      {/* Checkout - Desktop Dialog / Mobile Bottom Sheet */}
      {isDesktop ? (
        <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
          <DialogContent className="max-w-2xl" dir="ltr">
            {isOrderSubmitted ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Order Created Successfully!</DialogTitle>
                </DialogHeader>
                <div className="py-6 text-center space-y-3">
                  <p className="text-lg">
                    Order Number: <span className="font-bold text-primary">{orderNumber}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Our sales team will contact you soon via WhatsApp to confirm your order
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      setIsCheckoutOpen(false)
                      setIsOrderSubmitted(false)
                      setSelectedProduct(null)
                    }}
                  >
                    Close
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Complete Order</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Name</label>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">WhatsApp</label>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={customerInfo.whatsapp}
                        onChange={(e) => setCustomerInfo((p) => ({ ...p, whatsapp: e.target.value }))}
                        placeholder="+20xxxxxxxxxx"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email (optional)</label>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo((p) => ({ ...p, email: e.target.value }))}
                        placeholder="example@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Address</label>
                      <input
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo((p) => ({ ...p, address: e.target.value }))}
                        placeholder="Address and details"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <textarea
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        rows={3}
                        value={customerInfo.notes}
                        onChange={(e) => setCustomerInfo((p) => ({ ...p, notes: e.target.value }))}
                        placeholder="Additional details"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Shipping City <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-background"
                        value={customerInfo.shippingCityId}
                        onChange={(e) =>
                          setCustomerInfo((p) => ({ ...p, shippingCityId: e.target.value }))
                        }
                        disabled={isLoadingShippingCities || shippingCities.length === 0}
                      >
                        {shippingCities.length === 0 ? (
                          <option value="">No shipping cities available</option>
                        ) : (
                          shippingCities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name_en} - {formatPrice(city.shipping_fee)}
                            </option>
                          ))
                        )}
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Shipping fee: {formatPrice(shippingFee)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Product</span>
                        <span className="font-medium">{selectedProduct?.name}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Items Total</span>
                        <span className="font-semibold">
                          {selectedProduct ? formatPrice(selectedProduct.price) : "-"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Shipping</span>
                        <span className="font-semibold">{formatPrice(shippingFee)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-semibold">Grand Total</span>
                        <span className="font-bold text-primary">
                          {formatPrice(totalWithShipping)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={handleSubmitOrder}
                      className="w-full"
                      size="lg"
                      disabled={
                        isSubmitting ||
                        !customerInfo.shippingCityId ||
                        shippingCities.length === 0
                      }
                    >
                      {isSubmitting ? "Submitting..." : "Confirm Order"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <CheckoutBottomSheet
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false)
            if (isOrderSubmitted) {
              setIsOrderSubmitted(false)
            }
          }}
          customerInfo={customerInfo}
          onCustomerInfoChange={setCustomerInfo}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={isSubmitting}
          isOrderSubmitted={isOrderSubmitted}
          orderNumber={orderNumber}
          shippingCities={shippingCities}
          selectedShippingCityId={customerInfo.shippingCityId}
          onShippingCityChange={(cityId) =>
            setCustomerInfo((prev) => ({ ...prev, shippingCityId: cityId }))
          }
          isLoadingShippingCities={isLoadingShippingCities}
          totals={{
            items: formatPrice(itemsTotal),
            shipping: formatPrice(shippingFee),
            grand: formatPrice(totalWithShipping),
          }}
        />
      )}
      <Footer language="en" />
    </main>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background" dir="ltr">
        <Header language="en" />
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-muted-foreground" />
          </div>
        </div>
        <Footer language="en" />
      </main>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
