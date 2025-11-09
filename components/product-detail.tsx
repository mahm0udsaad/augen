"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/products"
import { products } from "@/lib/products"
import WhatsAppButton from "./whatsapp-button"
import { useCart } from "@/lib/cart-context"
import { ShoppingCart, Check, Heart } from "lucide-react"
import { useFavorites } from "@/lib/favorites-context"

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [selectedColor, setSelectedColor] = useState(product.colorOptions?.[0]?.name || "")
  const { addToCart } = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()
  const availableQuantity = product.quantity || 0
  const favoriteActive = isFavorite(product.id)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

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

  const relatedItems = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  return (
    <section className="px-0 py-0 md:px-2 md:py-6" dir="rtl">
      <div className="max-w-7xl mx-auto md:rounded-lg overflow-hidden">
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12">
          {/* Product Image - Full screen height on mobile */}
          <div className="flex items-start md:items-center justify-center order-1 md:order-1 md:rounded-lg md:overflow-hidden">
            <div
              className="relative w-full md:aspect-square aspect-[9/10] rounded-b-3xl md:rounded-lg overflow-hidden bg-secondary md:bg-secondary"
              style={{ viewTransitionName: `product-image-${product.id}` }}
            >
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
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
                <span className="text-3xl md:text-4xl font-bold text-foreground">{product.price} ج.م</span>
                <div className="text-sm">
                  {availableQuantity > 0 ? (
                    <span className="text-green-600 font-semibold">متوفر ({availableQuantity})</span>
                  ) : (
                    <span className="text-red-600 font-semibold">غير متوفر</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide">المادة</p>
                <p className="text-muted-foreground text-sm md:text-base">{product.material}</p>
              </div>

              {/* Color circles */}
              {product.colorOptions && product.colorOptions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs md:text-sm font-semibold text-foreground uppercase tracking-wide">
                    الألوان المتاحة
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {product.colorOptions.map((colorOption) => (
                      <button
                        key={colorOption.hex}
                        onClick={() => setSelectedColor(colorOption.name)}
                        className={`group relative flex items-center justify-center transition-all duration-300 ${
                          selectedColor === colorOption.name ? "scale-110" : "hover:scale-105"
                        }`}
                        title={colorOption.name}
                      >
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
                            selectedColor === colorOption.name
                              ? "border-accent ring-2 ring-accent ring-offset-2"
                              : "border-border hover:border-accent/50"
                          }`}
                          style={{ backgroundColor: colorOption.hex }}
                        />
                        <span className="absolute top-full mt-2 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background px-2 py-1 rounded border border-border">
                          {colorOption.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">اللون المختار: {selectedColor}</p>
                </div>
              )}
            </div>

            {/* Action buttons - sticky on mobile */}
            <div
              className={`space-y-2 md:space-y-3 pt-2 md:pt-4 sticky bottom-0 left-0 right-0 md:relative bg-background md:bg-transparent px-0 md:px-0 py-3 md:py-0 border-t md:border-t-0 border-border ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-3" : ""}`}
            >
              {/* Quantity Selector */}
              {availableQuantity > 0 && (
                <div className="flex items-center gap-3 justify-center mb-2" dir="rtl">
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
                  "غير متوفر"
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    تمت الإضافة إلى السلة
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    أضف إلى السلة
                  </>
                )}
              </button>

              <button
                onClick={() => toggleFavorite(product)}
                className={`w-full px-4 md:px-6 py-3 md:py-4 rounded-lg transition-all font-semibold text-base md:text-lg min-h-[44px] md:min-h-[48px] flex items-center justify-center gap-2 border ${favoriteActive ? "bg-red-50 text-red-600 border-red-200" : "bg-background text-foreground border-border"}`}
                aria-pressed={favoriteActive}
              >
                <Heart className={`w-5 h-5 ${favoriteActive ? "fill-current" : ""}`} />
                {favoriteActive ? "في المفضلة" : "أضف إلى المفضلة"}
              </button>

              <WhatsAppButton productName={product.name} />
            </div>

            {/* Features */}
            <div
              className={`border-t border-border pt-4 md:pt-6 space-y-3 pb-8 md:pb-0 ${isTransitioning ? "view-transition-slide-in view-transition-slide-in-delay-4" : ""}`}
            >
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">مواد فاخرة مصنعة يدويًا بعناية</span>
              </div>
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">شحن مجاني للطلبات التي تتجاوز ٣٠٠٠ ج.م</span>
              </div>
              <div className="flex gap-3">
                <span className="text-accent flex-shrink-0 text-lg">✓</span>
                <span className="text-sm md:text-base text-muted-foreground">ضمان استرجاع خلال ٣٠ يومًا</span>
              </div>
            </div>
          </div>
        </div>

        {/* ... related items, store info, and support sections remain unchanged ... */}
        {relatedItems.length > 0 && (
          <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">
              قد يعجبك أيضًا
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
                  <p className="text-xs md:text-sm text-accent font-semibold mt-1">{item.price} ج.م</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">زر متجرنا</h2>
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
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">عنوان المتجر</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  متجر أوغن
                  <br />
                  ٤٤ خاتم المرسلين
                  <br />
                  الجيزة – مصر
                </p>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">ساعات العمل</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground">
                  <p>الإثنين – الجمعة: 10:00 ص - 8:00 م</p>
                  <p>السبت: 10:00 ص - 6:00 م</p>
                  <p>الأحد: 12:00 م - 5:00 م</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">معلومات التواصل</h3>
                <div className="space-y-1 md:space-y-2 text-sm md:text-base text-muted-foreground">
                  <p>
                    الهاتف: <span className="text-accent font-semibold">+2010 35212724</span>
                  </p>
                  <p>
                    البريد الإلكتروني: <span className="text-accent font-semibold">support@luxeoptics.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 md:mt-24 border-t border-border pt-8 md:pt-12 px-4 md:px-0">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6 md:mb-8">تحتاج مساعدة؟</h2>
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
                  <h3 className="text-lg md:text-2xl font-semibold text-foreground">تحدّث معنا</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">دعم فوري على مدار الساعة</p>
                </div>
              </div>
              <p className="text-muted-foreground text-xs md:text-base mb-4 md:mb-6">
                فريق الدعم لدينا جاهز للإجابة عن أي استفسار حول هذا المنتج، وتخصيص طلبك، ومنحك نصائح تنسيق تناسب ذوقك.
              </p>
              <button
                onClick={() => {
                  const message = encodeURIComponent(`مرحباً! أحتاج مساعدة بخصوص ${product.name}. هل يمكنكم مساعدتي؟`)
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
                <span className="hidden sm:inline">ابدأ محادثة واتساب</span>
                <span className="sm:hidden">تحدث الآن</span>
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
                  البريد الإلكتروني
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
                  الهاتف
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground">+2010 35212724</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
