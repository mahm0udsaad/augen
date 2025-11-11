"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CheckoutBottomSheet from "@/components/checkout-bottom-sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import type { Product } from "@/lib/products"
import { getAllProducts } from "@/lib/product-service"
import type { ParentCategory, Subcategory } from "@/lib/constants"
import { toast } from "sonner"

const CUSTOMER_INFO_STORAGE_KEY = "augen_checkout_info"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    whatsapp: "",
    email: "",
    address: "",
    notes: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const data = await getAllProducts()
        setProducts(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setCustomerInfo((prev) => ({ ...prev, ...parsed }))
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

  const parentFilter = (searchParams.get("parent") as ParentCategory | null) ?? null
  const subFilter = (searchParams.get("sub") as Subcategory | null) ?? null

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (subFilter) return product.subcategory === subFilter
      if (parentFilter) return product.parent_category === parentFilter
      return true
    })
  }, [products, parentFilter, subFilter])

  const handleOrderNow = (product: Product) => {
    setSelectedProduct(product)
    setIsCheckoutOpen(true)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(price)

  const handleSubmitOrder = async () => {
    if (!selectedProduct) return
    if (!customerInfo.name || !customerInfo.whatsapp) {
      toast.error("Please enter your name and WhatsApp number")
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

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-muted-foreground" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-lg">No matching products found at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up flex flex-col"
                style={{ animationDelay: `${index * 80}ms` }}
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
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Product</span>
                        <span className="font-medium">{selectedProduct?.name}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-bold text-primary">
                          {selectedProduct ? formatPrice(selectedProduct.price) : "-"}
                        </span>
                      </div>
                    </div>
                    <Button onClick={handleSubmitOrder} className="w-full" size="lg" disabled={isSubmitting}>
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
          totalPrice={selectedProduct ? formatPrice(selectedProduct.price) : formatPrice(0)}
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


