"use client"

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import HeroCarousel from "@/components/hero-carousel"
import CategoriesSection from "@/components/categories-section"
import InfiniteScroll from "@/components/infinite-scroll"
import { supabase } from "@/lib/supabase"
import { Suspense, useEffect, useState } from "react"

// Static data fetching for server components
async function getStaticData() {
  // Fetch carousel slides
  const { data: slides } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  // Fetch category displays
  const { data: categoryDisplays } = await supabase
    .from("category_displays")
    .select("*")
    .eq("is_visible", true)
    .order("sort_order", { ascending: true })

  // Fetch subcategory displays for cards
  const { data: subcategoryDisplays } = await supabase
    .from("subcategory_displays")
    .select("*")
    .order("sort_order", { ascending: true })

  return { slides, categoryDisplays, subcategoryDisplays }
}

function HomeContent() {
  const {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore
  } = useInfiniteScroll({
    initialLimit: 12,
    loadMoreLimit: 12,
  })

  const [slides, setSlides] = useState<any[]>([])
  const [categoryDisplays, setCategoryDisplays] = useState<any[]>([])
  const [subcategoryDisplays, setSubcategoryDisplays] = useState<any[]>([])

  useEffect(() => {
    getStaticData().then(({ slides: s, categoryDisplays: cd, subcategoryDisplays: sd }) => {
      setSlides(s || [])
      setCategoryDisplays(cd || [])
      setSubcategoryDisplays(sd || [])
    })
  }, [])

  return (
    <main className="min-h-screen bg-background" dir="ltr">
      <Header language="en" />

      {/* Hero Carousel */}
      <HeroCarousel slides={slides} language="en" />

      {/* Dynamic Category Sections */}
      <section className="px-4 py-12 sm:py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <CategoriesSection
            initialDisplays={categoryDisplays}
            subcategoryDisplays={subcategoryDisplays}
            language="en"
          />
        </div>
      </section>

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

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          )}

          <InfiniteScroll
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
              {products.map((product, index) => (
                <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </InfiniteScroll>
        </div>
      </section>

      <section className="px-4 py-8 sm:py-12 md:py-24 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-12 text-center animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Client Stories
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base">
              Join thousands of eyewear lovers who trust Augen worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "Fashion Editor",
                text: "The AI try-on is brilliant—I found the perfect frame without leaving home. Craftsmanship exceeds expectations.",
                rating: 5,
              },
              {
                name: "James Chen",
                role: "Business Strategist",
                text: "Augen blends couture-grade quality with fair pricing. The WhatsApp concierge is fast and genuinely helpful.",
                rating: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "Style Content Creator",
                text: "These frames are a statement. Every detail feels bespoke. I recommend Augen to all of my clients.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-background rounded-lg p-3 sm:p-6 md:p-8 shadow-sm border border-border hover:shadow-md transition-smooth animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-3 md:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-accent fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-3 md:mb-4 text-xs md:text-base italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-foreground text-xs md:text-base">{testimonial.name}</p>
                  <p className="text-muted-foreground text-xs md:text-sm">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:py-12 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-12 text-center animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              Why choose Augen?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base">
              Luxury materials, intelligent tools, and concierge-level care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-3 sm:p-6 rounded-lg hover:bg-secondary/50 transition-smooth animate-scale-in">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
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
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Smart try-on</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                Preview every angle with our advanced AI fitting experience.
              </p>
            </div>

            <div
              className="text-center p-3 sm:p-6 rounded-lg hover:bg-secondary/50 transition-smooth animate-scale-in"
              style={{ animationDelay: "100ms" }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Couture quality</h3>
              <p className="text-xs md:text-base text-muted-foreground">Handcrafted frames in titanium, acetate, and precision alloys.</p>
            </div>

            <div
              className="text-center p-3 sm:p-6 rounded-lg hover:bg-secondary/50 transition-smooth animate-scale-in"
              style={{ animationDelay: "200ms" }}
            >
              <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">Specialist care</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                Direct WhatsApp support for sizing, styling, and aftercare.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer language="en" />
    </main>
  )
}

export default function HomeClient() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background" dir="ltr">
        <Header language="en" />
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-dashed border-muted-foreground" />
        </div>
        <Footer language="en" />
      </main>
    }>
      <HomeContent />
    </Suspense>
  )
}
