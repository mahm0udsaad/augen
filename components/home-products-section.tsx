"use client"

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { getProductsPaginated } from "@/lib/product-service"
import ProductCard from "@/components/product-card"
import type { Product } from "@/lib/products"

interface HomeProductsSectionProps {
  initialProducts: Product[]
}

export default function HomeProductsSection({ initialProducts }: HomeProductsSectionProps) {
  const { data: products, loading, hasMore, observerRef } = useInfiniteScroll<Product>({
    initialData: initialProducts,
    fetchFn: async (page, pageSize) => {
      return await getProductsPaginated(page, pageSize)
    },
    pageSize: 12,
  })

  return (
    <section id="products" className="px-4 py-8 sm:py-12 md:py-24 bg-background pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 md:mb-12 animate-slide-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 text-center">
            Our Curated Selection
          </h2>
          <p className="text-center text-muted-foreground text-xs sm:text-base">
            Hand-finished frames designed for every face and every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
          {products.map((product, index) => (
            <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${Math.min(index, 11) * 100}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        {hasMore && (
          <div ref={observerRef} className="flex justify-center items-center py-8 min-h-[100px]">
            {loading && (
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading more products...</p>
              </div>
            )}
          </div>
        )}

        {!hasMore && products.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You've reached the end of our collection</p>
          </div>
        )}
      </div>
    </section>
  )
}

