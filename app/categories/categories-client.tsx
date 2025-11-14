"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, Layers, Loader2, RefreshCw, Sparkles } from "lucide-react"

import Footer from "@/components/footer"
import Header from "@/components/header"
import ProductCard from "@/components/product-card"
import {
  createCategoryShowcase,
  createSubcategoryShowcase,
} from "@/lib/category-visuals"
import type {
  CategoryShowcaseCard,
  CategoryVisualOverride,
  SubcategoryShowcaseCard,
  SubcategoryVisualOverride,
} from "@/lib/category-visuals"
import { getAllProducts } from "@/lib/product-service"
import { PARENT_SUBCATEGORY_MAP } from "@/lib/constants"
import type { ParentCategory, Subcategory } from "@/lib/constants"
import type { Product } from "@/lib/products"

const designerNotes = [
  "DiDigital lenses reduce screen fatigue by 35%",
  "Scratch-resistant coating with 2-year warranty",
  "Free size adjustment with every purchase",
]

interface CategoriesPageClientProps {
  categoryOverrides: Partial<Record<ParentCategory, CategoryVisualOverride>>
  subcategoryOverrides: Partial<Record<Subcategory, SubcategoryVisualOverride>>
}

export default function CategoriesPageClient({
  categoryOverrides,
  subcategoryOverrides,
}: CategoriesPageClientProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const categoryShowcase = useMemo(
    () => createCategoryShowcase(categoryOverrides),
    [categoryOverrides]
  )

  const subcategoryShowcase = useMemo(
    () => createSubcategoryShowcase(subcategoryOverrides),
    [subcategoryOverrides]
  )

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const productData = await getAllProducts()
        setProducts(productData)
      } catch (error) {
        console.error("Error loading store data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const categoryMap = useMemo(
    () => categoryShowcase.reduce((acc, category) => {
      acc[category.id] = category
      return acc
    }, {} as Record<ParentCategory, CategoryShowcaseCard>),
    [categoryShowcase]
  )

  const subcategoryMap = useMemo(
    () => subcategoryShowcase.reduce((acc, subcategory) => {
      acc[subcategory.id] = subcategory
      return acc
    }, {} as Record<Subcategory, SubcategoryShowcaseCard>),
    [subcategoryShowcase]
  )

  const parentFilter = (searchParams.get("parent") as ParentCategory | null) ?? null
  const subFilter = (searchParams.get("sub") as Subcategory | null) ?? null

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (subFilter) {
        // Always respect parent category when filtering by subcategory
        if (parentFilter) {
          return product.subcategory === subFilter && product.parent_category === parentFilter
        }
        return product.subcategory === subFilter
      }
      if (parentFilter) {
        // Exclude high_quality products when filtering by parent category only
        return product.parent_category === parentFilter && product.subcategory !== 'high_quality'
      }
      return true
    })
  }, [products, subFilter, parentFilter])

  const activeCategory = parentFilter ? categoryMap[parentFilter] : undefined
  const activeSubcategory = subFilter ? subcategoryMap[subFilter] : undefined
  const fallbackParent = (categoryShowcase[0]?.id ?? "sunglasses") as ParentCategory
  const currentParent = parentFilter ?? fallbackParent
  const fallbackParentTitle = categoryMap[fallbackParent]?.title || ""
  const subcategoriesForParent = (parent: ParentCategory) =>
    (PARENT_SUBCATEGORY_MAP[parent] || []).map((id) => subcategoryMap[id]).filter(Boolean) as SubcategoryShowcaseCard[]

  const activeFilterLabel = activeSubcategory?.title || activeCategory?.title || null
  const heroBackgroundImage = activeCategory?.backgroundImage || "/images/hero-glasses.jpg"
  const heroOverlay = activeCategory?.overlayGradient || "linear-gradient(135deg, rgba(0,0,0,0.9), rgba(30,30,30,0.7))"
  const heroTexture = activeCategory?.texture || "bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.1),_transparent_55%)]"

  const navigateWithParams = (params: URLSearchParams) => {
    const query = params.toString()
    router.push(query ? `/products?${query}` : "/products", { scroll: false })
  }

  const handleCategoryClick = (categoryId: ParentCategory) => {
    const params = new URLSearchParams()
    params.set("parent", categoryId)
    navigateWithParams(params)
  }

  const handleSubcategoryClick = (subcategoryId: Subcategory, parentId: ParentCategory) => {
    const params = new URLSearchParams()
    params.set("parent", parentId)
    params.set("sub", subcategoryId)
    navigateWithParams(params)
  }

  const clearFilters = () => {
    router.push("/products", { scroll: false })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background" dir="ltr">
        <Header language="en" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <Footer language="en" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50" dir="ltr">
      <Header language="en" />

      <section className="px-4 py-10 md:py-12">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/10 text-white shadow-2xl">
          <div className="absolute inset-0">
            <div
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${heroBackgroundImage})` }}
            />
          </div>
          <div className="absolute inset-0" style={{ background: heroOverlay }} />
          <div className={`relative flex flex-col gap-8 p-8 lg:flex-row lg:items-center ${heroTexture}`}>
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-white/80">
                <Sparkles className="h-3.5 w-3.5" />
                {activeFilterLabel ? `Browsing: ${activeFilterLabel}` : "Discover Augen Collection"}
              </div>
              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl">
                {activeCategory ? activeCategory.title : "Augen Store"}
              </h1>
              <p className="text-lg text-white/80 md:text-xl">
                {activeCategory?.spotlight || "Choose the category that suits your style and enjoy high-quality lenses and personalized service."}
              </p>
            </div>
            <div className="flex w-full flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 text-white/90 lg:max-w-sm">
              {(parentFilter || subFilter) && (
                <button
                  onClick={clearFilters}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset Selection
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              <Filter className="h-3.5 w-3.5" />
              Category Filter
            </div>
            <p className="text-sm text-slate-600">
              Select the appropriate category or try mixing subcategories to get more accurate recommendations.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-10 md:pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-10">
          <div className="grid gap-4 md:grid-cols-2">
            {categoryShowcase.map((category) => {
              const isActive = parentFilter === category.id
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`relative overflow-hidden rounded-3xl border text-left transition duration-300 ${
                    isActive
                      ? "border-black/70 shadow-2xl"
                      : "border-slate-200 hover:-translate-y-0.5 hover:shadow-lg"
                  }`}
                  aria-pressed={isActive}
                >
                  <div className="absolute inset-0">
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${category.backgroundImage})` }}
                    />
                  </div>
                  <div className="absolute inset-0" style={{ background: category.overlayGradient }} />
                  <div className={`relative space-y-4 p-6 text-white ${category.texture}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
                          {category.badge}
                        </p>
                        <h3 className="text-2xl font-bold">{category.title}</h3>
                      </div>
                      <span className="text-sm font-semibold text-white/80">
                        {category.tagline}
                      </span>
                    </div>
                    <p className="text-sm text-white/80">{category.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-600">
                Subcategories under {activeCategory?.title || fallbackParentTitle}
              </p>
              <span className="text-xs text-slate-500">You can select multiple subcategories</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {subcategoriesForParent(currentParent).map((subcategory) => {
                const isActive = subFilter === subcategory.id

                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory.id, currentParent)}
                    className={`relative overflow-hidden rounded-2xl border text-left transition duration-300 ${
                      isActive
                        ? "border-black/70 shadow-xl"
                        : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-400"
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="absolute inset-0">
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${subcategory.backgroundImage})` }}
                      />
                    </div>
                    <div className="absolute inset-0" style={{ background: subcategory.overlayGradient }} />
                    <div className={`relative space-y-3 p-5 text-white ${subcategory.pattern}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{subcategory.title}</h3>
                        <span className="text-xs font-semibold text-white/70">{subcategory.tagline}</span>
                      </div>
                      <p className="text-sm text-white/80">{subcategory.description}</p>
                      {isActive && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                          Subcategory Active
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-6 text-center py-10">
            <h2 className="text-2xl font-bold text-slate-900">Go to Products Page</h2>
            <p className="text-sm text-slate-600">
              Select any category or subcategory above to go directly to the filtered products page.
            </p>
            <div>
              <button
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900 hover:text-white"
              >
                View All Products
              </button>
            </div>
          </div>
          </div>
      </section>

      <Footer language="en" />
    </main>
  )
}
