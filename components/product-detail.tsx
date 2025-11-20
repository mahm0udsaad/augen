"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/products"
import WhatsAppButton from "./whatsapp-button"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Check, Heart, Share2, Facebook, Instagram, Twitter, Copy, MessageCircle } from "lucide-react"
import { useFavorites } from "@/lib/favorites-context"
import ProductMediaCarousel from "./product-media-carousel"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CheckoutBottomSheet from "@/components/checkout-bottom-sheet"
import { toast } from "sonner"
import { useShippingCities } from "@/hooks/use-shipping-cities"
import { TIGER_BADGE_COLORS } from "@/lib/constants"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [selectedColor, setSelectedColor] = useState("")
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const availableQuantity = product.quantity || 0
  const favoriteActive = isFavorite(product.id)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    whatsapp: "",
    email: "",
    address: "",
    notes: "",
    shippingCityId: "",
  })
  const [shareUrl, setShareUrl] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const CUSTOMER_INFO_STORAGE_KEY = "augen_checkout_info"
  const {
    cities: shippingCities,
    isLoading: isLoadingShippingCities,
  } = useShippingCities()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

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


  const imageColorSwatches = useMemo(() => {
    if (!product.images || product.images.length === 0) return []
    const swatchMap = new Map<string, {
      key: string
      label: string
      subtitle?: string
      colorType: "color" | "tiger"
      hex: string
    }>()

    product.images.forEach((img, index) => {
      const mode = (img.color_type as "color" | "tiger") || "color"
      const tigerLabel = img.tiger_type?.trim()
      const baseName = img.color_name?.trim() || tigerLabel || `Color ${index + 1}`
      const displayName = mode === "tiger"
        ? `${baseName}${tigerLabel ? ` - ${tigerLabel}` : ""}`
        : baseName
      const key = `${mode}-${baseName}-${tigerLabel || ""}`

      if (!swatchMap.has(key)) {
        swatchMap.set(key, {
          key,
          label: displayName,
          subtitle: mode === "tiger" ? tigerLabel || baseName : undefined,
          colorType: mode,
          hex: mode === "tiger" ? TIGER_BADGE_COLORS.base : img.color_hex || "#000000",
        })
      }
    })

    return Array.from(swatchMap.values())
  }, [product.images])

  const fallbackColorOptions = useMemo(() => {
    if (!product.colorOptions || product.colorOptions.length === 0) return []
    return product.colorOptions.map((option, index) => ({
      key: `${option.name}-${index}`,
      label: option.name,
      colorType: "color" as const,
      hex: option.hex || "#000000",
    }))
  }, [product.colorOptions])

  const availableColorSwatches = imageColorSwatches.length > 0 ? imageColorSwatches : fallbackColorOptions
  const defaultShareUrl = useMemo(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || "https://augen.vercel.app"
    return `${base.replace(/\/$/, "")}/product/${product.id}`
  }, [product.id])
  const effectiveShareUrl = shareUrl || defaultShareUrl
  const shareMessage = useMemo(
    () => `${product.name} – ${product.price} EGP من AUGEN. اكتشف الرفاهية الآن!`,
    [product.name, product.price]
  )

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  const openShareWindow = (url: string) => {
    if (typeof window === "undefined") return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleCopyLink = async (silent = false) => {
    const targetUrl = effectiveShareUrl
    if (typeof navigator === "undefined") return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(targetUrl)
        if (!silent) {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2500)
        }
      }
    } catch (error) {
      setCopySuccess(false)
    }
  }

  const shareOptions = [
    {
      id: "facebook",
      label: "Facebook",
      accent: "bg-[#1877F2] hover:bg-[#0f5bd8]",
      Icon: Facebook,
      action: () => {
        // Facebook Post Sharer - Only accepts URL, pulls preview from OG meta tags
        openShareWindow(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(effectiveShareUrl)}`
        )
      },
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      accent: "bg-[#0077B5] hover:bg-[#006396]",
      Icon: (props: any) => (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      action: () => {
        // LinkedIn Share - Only accepts URL, pulls preview from OG meta tags
        openShareWindow(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(effectiveShareUrl)}`
        )
      },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      accent: "bg-[#25D366] hover:bg-[#1fb857]",
      Icon: MessageCircle,
      action: () => {
        // WhatsApp - Share text with URL
        openShareWindow(
          `https://wa.me/?text=${encodeURIComponent(`${shareMessage}\n${effectiveShareUrl}`)}`
        )
      },
    },
    {
      id: "x",
      label: "X (Twitter)",
      accent: "bg-[#0F1419] text-white hover:bg-black",
      Icon: Twitter,
      action: () => {
        // X/Twitter Post Intent - creates a new tweet with text and link
        openShareWindow(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(
            effectiveShareUrl
          )}`
        )
      },
    },
    {
      id: "instagram",
      label: "Instagram",
      accent: "bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:opacity-90",
      Icon: Instagram,
      action: async () => {
        // Instagram doesn't have direct web posting, copy link and show toast
        await handleCopyLink(true)
        toast.success("Link copied! Open Instagram app to create your post", {
          duration: 4000,
        })
      },
    },
  ]

  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function"

  const handleNativeShare = async () => {
    if (typeof navigator === "undefined" || !navigator.share) return
    try {
      await navigator.share({
        title: product.name,
        text: shareMessage,
        url: effectiveShareUrl,
      })
    } catch (error) {
      // user cancelled share; ignore
    }
  }


  useEffect(() => {
    if (availableColorSwatches.length > 0) {
      setSelectedColor(availableColorSwatches[0].label)
    } else {
      setSelectedColor("")
    }
  }, [availableColorSwatches])

  const handleAddToCart = () => {
    if (availableQuantity <= 0) {
      return
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      unitPrice: product.price,
      maxQuantity: availableQuantity,
      quantity: quantity,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleOrderNow = () => {
    if (availableQuantity <= 0) {
      return
    }
    setIsCheckoutOpen(true)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "EGP" }).format(price)

  const handleSubmitOrder = async () => {
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
              productId: product.id,
              productName: product.name,
              productImage: product.image,
              quantity: quantity,
              unitPrice: product.price,
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

  const selectedShippingCity = shippingCities.find(
    (city) => city.id === customerInfo.shippingCityId
  )
  const shippingFee = selectedShippingCity?.shipping_fee ?? 0
  const itemsTotal = product.price * quantity
  const totalWithShipping = itemsTotal + shippingFee

  const relatedItems = []

  return (
    <section className="px-0 py-0 md:px-2 md:py-6" dir="ltr">
      <div className="max-w-7xl mx-auto md:rounded-lg overflow-hidden">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
          {/* Product Media Carousel - Full screen height on mobile */}
          <div className="flex items-start md:items-center justify-center order-1 md:order-1 md:rounded-lg md:overflow-hidden px-4 md:px-0 py-4 md:py-0">
            <div className="w-full">
              <ProductMediaCarousel
                videoUrl={product.video_url}
                images={product.images || []}
                productName={product.name}
                onColorSelect={(label) => setSelectedColor(label)}
              />
            </div>
          </div>

          {/* Product Info - Stacked on mobile with bottom padding */}
          <div
            className={`flex flex-col justify-start space-y-4 md:space-y-6 order-2 md:order-2 px-4 pt-6 md:pt-0 md:px-0 md:justify-center ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-1" : ""}`}
          >
            {/* ... existing info sections ... */}
            <div className={isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-1" : ""}>
              <p className="text-xs md:text-sm text-accent font-semibold mb-1 md:mb-2 uppercase tracking-wide">
                {product.style}
              </p>
              <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-2 md:mb-4 text-balance leading-tight">
                {product.name}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground text-pretty leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price and specs */}
            <div
              className={`space-y-3 md:space-y-4 ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-2" : ""}`}
            >
              <div className="flex items-baseline gap-2 justify-between">
                <span className="text-3xl md:text-4xl font-bold text-foreground">{product.price} EGP</span>
                <div className="text-sm">
                  {availableQuantity > 0 ? (
                    <span className="text-green-600 font-semibold">Available ({availableQuantity})</span>
                  ) : (
                    <span className="text-red-600 font-semibold">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide">Material</p>
                <p className="text-muted-foreground text-sm md:text-base">{product.material}</p>
              </div>

              {/* Color circles */}
              {availableColorSwatches.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide">
                    Available Colors
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {availableColorSwatches.map((swatch) => (
                      <button
                        key={swatch.key}
                        onClick={() => setSelectedColor(swatch.label)}
                        className={`group relative flex items-center justify-center transition-all duration-300 ${
                          selectedColor === swatch.label ? "scale-110" : "hover:scale-105"
                        }`}
                        title={swatch.label}
                      >
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            selectedColor === swatch.label
                              ? "border-accent ring-2 ring-accent ring-offset-2"
                              : "border-border hover:border-accent/50"
                          }`}
                          style={
                            swatch.colorType === "tiger"
                              ? {
                                  backgroundImage: `linear-gradient(135deg, ${TIGER_BADGE_COLORS.base}, ${TIGER_BADGE_COLORS.highlight})`,
                                }
                              : { backgroundColor: swatch.hex || "#000000" }
                          }
                        />
                        <span className="absolute top-full mt-2 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background px-2 py-1 rounded border border-border">
                          {swatch.label}
                          {swatch.subtitle && ` • ${swatch.subtitle}`}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected Color: {selectedColor || "—"}
                  </p>
                </div>
              )}

              {/* Share tools */}
              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide">
                      Launch a Shareable Moment
                    </p>
                    <p className="text-xs text-muted-foreground">
                      شارك المنتج مباشرةً على قنواتك التسويقية.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleNativeShare}
                      disabled={!canNativeShare}
                    >
                      <Share2 className="w-4 h-4" />
                      Quick Share
                    </Button>
                    {/* <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <Share2 className="w-4 h-4" />
                      Share Options
                    </Button> */}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleCopyLink(false)}
                  >
                    <Copy className="w-4 h-4" />
                    {copySuccess ? "تم نسخ الرابط" : "Copy Link"}
                  </Button>
                  <span className="text-[11px] text-muted-foreground truncate max-w-full">
                    {effectiveShareUrl}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons - sticky on mobile */}
            <div
              className={`space-y-2 md:space-y-3 pt-2 md:pt-4 sticky bottom-0 left-0 right-0 md:relative bg-background md:bg-transparent px-0 md:px-0 py-3 md:py-0 border-t md:border-t-0 border-border ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-3" : ""}`}
            >
              {/* Quantity Selector */}
              {availableQuantity > 0 && (
                <div className="flex items-center gap-3 justify-center mb-2" dir="ltr">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-border hover:border-accent flex items-center justify-center transition-colors"
                  >
                    <span className="text-xl">-</span>
                  </button>
                  <span className="text-lg font-semibold min-w-[40px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableQuantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border-2 border-border hover:border-accent flex items-center justify-center transition-colors"
                  >
                    <span className="text-xl">+</span>
                  </button>
                </div>
              )}

              {/* Order Now - must appear above Add to Cart */}
              <button
                onClick={handleOrderNow}
                disabled={availableQuantity <= 0}
                className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all font-semibold text-base md:text-lg min-h-[44px] md:min-h-[48px] ${
                  availableQuantity <= 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80"
                }`}
                aria-label="Order Now"
              >
                Order Now
              </button>

              <button
                onClick={handleAddToCart}
                disabled={availableQuantity <= 0}
                className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all font-semibold text-base md:text-lg min-h-[44px] md:min-h-[48px] flex items-center justify-center gap-2 ${
                  availableQuantity <= 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80"
                }`}
              >
                {availableQuantity <= 0 ? (
                  "Out of Stock"
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={() => toggleFavorite(product)}
                className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all font-semibold text-base md:text-lg min-h-[44px] md:min-h-[48px] flex items-center justify-center gap-2 border ${favoriteActive ? "bg-red-50 text-red-600 border-red-200" : "bg-background text-foreground border-border"}`}
                aria-pressed={favoriteActive}
              >
                <Heart className={`w-5 h-5 ${favoriteActive ? "fill-current" : ""}`} />
                {favoriteActive ? "In Favorites" : "Add to Favorites"}
              </button>

              <WhatsAppButton productName={product.name} />
            </div>

            {/* Features */}
            <div
              className={`border-t border-border pt-4 md:pt-6 space-y-3 pb-8 md:pb-0 ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-4" : ""}`}
            >
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">Luxury materials carefully handcrafted</span>
              </div>
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">Free shipping on orders over 3,000 EGP</span>
              </div>
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">30-day return guarantee</span>
              </div>
            </div>
          </div>
      </div>

      {/* Share Modal */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>شارك المنتج عبر قنواتك</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              اختر المنصة المناسبة، وسنجهز الرسالة والرابط المُحسَّن ببيانات OpenGraph.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    option.action()
                    setIsShareModalOpen(false)
                  }}
                  className={`${option.accent} text-white rounded-lg py-2 px-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
                >
                  <option.Icon className="w-4 h-4" />
                  {option.label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase font-semibold tracking-wide text-muted-foreground">الرابط المباشر</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border px-3 py-2 text-sm truncate">
                  {effectiveShareUrl}
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopyLink(false)} className="gap-2">
                  <Copy className="w-4 h-4" />
                  {copySuccess ? "تم النسخ" : "Copy"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                تمت تهيئة الرابط ليعرض معاينة SEO/OG على واتساب وفيسبوك.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ... related items, store info, and support sections remain unchanged ... */}
      {relatedItems.length > 0 && (
          <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {relatedItems.map((item) => (
                <Link key={item.id} href={`/product/${item.id}`} className="group">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary mb-2 md:mb-4 transition-transform duration-300 hover:scale-105">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover transition-opacity group-hover:opacity-80 duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <h3 className="text-xs md:text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs md:text-sm text-accent font-semibold mt-1">{item.price} EGP</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">Visit Our Store</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="rounded-lg overflow-hidden shadow-md h-80 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3455.225910511594!2d31.191454075552013!3d30.001668974945098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzDCsDAwJzA2LjAiTiAzMcKwMTEnMzguNSJF!5e0!3m2!1sen!2seg!4v1762687299497!5m2!1sen!2seg"
                width="100%"
                height="100%"
                style={{ border: "none" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Store Address</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Augen Store
                  <br />
                  44 Khatem El-Morsaleen
                  <br />
                  Giza – Egypt
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Business Hours</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground">
                  <p>Monday – Friday: 10:00 AM - 8:00 PM</p>
                  <p>Saturday: 10:00 AM - 6:00 PM</p>
                  <p>Sunday: 12:00 PM - 5:00 PM</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Contact Information</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground">
                  <p>
                    Phone: <span className="text-accent font-semibold">+2010 35212724</span>
                  </p>
                  <p>
                    Email: <span className="text-accent font-semibold">support@luxeoptics.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 md:p-8 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z" fill="currentColor"/>
        <path d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" fill="url(#whatsapp-gradient-btn)"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z" fill="white"/>
        <path d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z" fill="white"/>
        <defs>
          <linearGradient id="whatsapp-gradient-btn" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5BD066"/>
            <stop offset="1" stopColor="#27B43E"/>
          </linearGradient>
        </defs>
      </svg>
                <div>
                  <h3 className="text-lg md:text-2xl font-semibold text-foreground">Chat With Us</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">24/7 instant support</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-6">
                Our support team is ready to answer any questions about this product, customize your order, and provide styling tips that match your taste.
              </p>
              <button
                onClick={() => {
                  const message = encodeURIComponent(`Hello! I need help regarding ${product.name}. Can you help me?`)
                  const whatsappUrl = `https://wa.me/201035212724?text=${message}`
                  window.open(whatsappUrl, "_blank")
                }}
                className="w-full px-4 md:px-6 py-3 md:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors font-semibold flex items-center justify-center gap-2 text-sm md:text-lg min-h-[44px] md:min-h-[48px]"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 32 32">
                <path fillRule="evenodd" clipRule="evenodd" d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z" fill="currentColor"/>
                <path d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z" fill="url(#whatsapp-gradient-btn)"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z" fill="white"/>
                <path d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z" fill="white"/>
                <defs>
                  <linearGradient id="whatsapp-gradient-btn" x1="26.5" y1="7" x2="4" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#5BD066"/>
                    <stop offset="1" stopColor="#27B43E"/>
                  </linearGradient>
                </defs>
              </svg>
                <span className="hidden sm:inline">Start WhatsApp Chat</span>
                <span className="sm:hidden">Chat Now</span>
              </button>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-secondary rounded-lg p-4 md:p-8 border border-border">
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  Email
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">support@luxeoptics.com</p>
              </div>

              <div className="bg-secondary rounded-lg p-4 md:p-8 border border-border">
                <h4 className="font-semibold text-foreground mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Phone
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">+2010 35212724</p>
              </div>
            </div>
          </div>
        </div>
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
                  <button
                    onClick={() => {
                      setIsCheckoutOpen(false)
                      setIsOrderSubmitted(false)
                    }}
                    className="px-4 py-2 rounded-md border font-semibold"
                  >
                    Close
                  </button>
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
                      <span className="font-medium">{product.name}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantity</span>
                      <span className="font-medium">{quantity}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Items Total</span>
                      <span className="font-semibold">
                        {formatPrice(itemsTotal)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Shipping</span>
                      <span className="font-semibold">
                        {formatPrice(shippingFee)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between pt-2 border-t">
                      <span className="text-sm font-semibold">Grand Total</span>
                      <span className="font-bold text-primary">
                        {formatPrice(totalWithShipping)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitOrder}
                    className="w-full px-4 py-3 rounded-md bg-primary text-primary-foreground font-semibold"
                    disabled={
                      isSubmitting ||
                      !customerInfo.shippingCityId ||
                      shippingCities.length === 0
                    }
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Order"}
                  </button>
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
    </section>
  )
}
