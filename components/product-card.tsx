"use client"

import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/products"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import GestureEnabledCard from "@/components/gesture-enabled-card"
import { useFavorites } from "@/lib/favorites-context"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { light } = useHapticFeedback()
  const { toggleFavorite, isFavorite } = useFavorites()
  const favoriteActive = isFavorite(product.id)

  return (
    <GestureEnabledCard
      onLongPress={() => {
        light()
      }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="group cursor-pointer h-full flex flex-col transition-smooth hover:shadow-lg rounded-lg overflow-hidden bg-background">
          <div
            className="relative overflow-hidden rounded-lg bg-secondary mb-2 md:mb-4 aspect-square"
            style={{ viewTransitionName: `product-image-${product.id}` }}
          >
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-smooth duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 md:group-hover:opacity-100 transition-smooth flex items-center justify-center gap-2 md:gap-3 opacity-100 md:opacity-0 active:opacity-100 md:active:opacity-100">
              <button
                className="w-9 h-9 md:w-12 md:h-12 bg-accent text-accent-foreground rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-smooth shadow-lg"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  light()
                }}
                aria-label="عرض سريع"
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
              <button
                className={`w-9 h-9 md:w-12 md:h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-smooth shadow-lg ${favoriteActive ? "bg-red-500 text-white" : "bg-accent text-accent-foreground"}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  light()
                  toggleFavorite(product)
                }}
                aria-label={favoriteActive ? "إزالة من المفضلة" : "أضف إلى المفضلة"}
                aria-pressed={favoriteActive}
              >
                <svg className="w-4 h-4 md:w-6 md:h-6" fill={favoriteActive ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-1 md:space-y-2 flex-1 flex flex-col px-0 md:px-1">
            <h3 className="text-sm md:text-lg font-semibold text-foreground group-hover:text-accent transition-smooth line-clamp-2">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{product.style}</p>

            <div className="flex items-center gap-0.5 py-0.5 md:py-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 md:w-4 md:h-4 ${i < 4 ? "text-accent fill-current" : "text-border"}`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-xs text-muted-foreground ml-1">٢٤ تقييم</span>
            </div>

            <div className="flex items-center justify-between pt-1 md:pt-2 mt-auto gap-2">
              <span className="text-sm md:text-lg font-bold text-foreground">{product.price} ج.م</span>
              {product.quantity !== undefined && (
                <div className="text-xs font-semibold">
                  {product.quantity > 0 ? (
                    <span className="text-green-600">متوفر</span>
                  ) : (
                    <span className="text-red-600">نفذ</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </GestureEnabledCard>
  )
}
