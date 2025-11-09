"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAllProducts } from "@/lib/product-service"
import type { Product } from "@/lib/products"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  Loader2,
  Layers,
  Glasses,
  Sun,
  Sparkles,
  Circle,
  Square,
  Eye,
  Star,
  Heart,
  Zap,
  Crown,
  Shield,
  Award,
  Target,
  Package,
  ShoppingBag,
  Tag,
  Gem,
  Shirt,
  Watch,
  Briefcase,
} from "lucide-react"

interface Subcategory {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  icon: string | null
  color: string | null
  category_id: string
}

interface SubcategoryWithParent extends Subcategory {
  parentName: string
  parentNameAr: string | null
}

interface Category {
  id: string
  name: string
  name_ar: string | null
  description: string | null
  description_ar: string | null
  icon: string | null
  color: string | null
  subcategories?: Subcategory[] | null
}

const iconMap: Record<string, any> = {
  glasses: Glasses,
  sun: Sun,
  sparkles: Sparkles,
  circle: Circle,
  square: Square,
  eye: Eye,
  star: Star,
  heart: Heart,
  zap: Zap,
  crown: Crown,
  shield: Shield,
  award: Award,
  target: Target,
  package: Package,
  "shopping-bag": ShoppingBag,
  tag: Tag,
  gem: Gem,
  shirt: Shirt,
  watch: Watch,
  briefcase: Briefcase,
}

const getIcon = (iconName: string | null) => {
  if (!iconName) return Glasses
  return iconMap[iconName] || Glasses
}

export default function CategoriesPageClient() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true)
        const [productData, categoriesResponse] = await Promise.all([
          getAllProducts(),
          fetch('/api/admin/categories').then(async (res) => {
            if (!res.ok) throw new Error('فشل في تحميل الفئات')
            return res.json()
          })
        ])

        setProducts(productData)
        setCategories(categoriesResponse)
      } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات المتجر:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStoreData()
  }, [])

  const categoryFilter = searchParams.get("categoryId")
  const subcategoryFilter = searchParams.get("subcategoryId")

  const allSubcategories: SubcategoryWithParent[] = useMemo(() => (
    categories.flatMap((category) =>
      (category.subcategories || []).map((subcategory) => ({
        ...subcategory,
        parentName: category.name,
        parentNameAr: category.name_ar,
      }))
    )
  ), [categories])

  const selectedCategory = categoryFilter
    ? categories.find((category) => category.id === categoryFilter)
    : null

  const selectedSubcategory = subcategoryFilter
    ? allSubcategories.find((subcategory) => subcategory.id === subcategoryFilter)
    : null

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (subcategoryFilter) {
        return product.subcategory_id === subcategoryFilter
      }
      if (categoryFilter) {
        if (product.category_id) {
          return product.category_id === categoryFilter
        }
        const matchedCategory = categories.find((category) => category.id === categoryFilter)
        if (!matchedCategory) return false
        return (
          (product.category || "").toLowerCase() === (matchedCategory.name || "").toLowerCase()
        )
      }
      return true
    })
  }, [products, subcategoryFilter, categoryFilter, categories])

  const activeFilterLabel = selectedSubcategory
    ? selectedSubcategory.name_ar || selectedSubcategory.name
    : selectedCategory
      ? selectedCategory.name_ar || selectedCategory.name
      : null

  const navigateWithParams = (params: URLSearchParams) => {
    const query = params.toString()
    router.push(query ? `/categories?${query}` : '/categories', { scroll: false })
  }

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const isActive = params.get('categoryId') === categoryId

    if (isActive) {
      params.delete('categoryId')
      params.delete('subcategoryId')
    } else {
      params.set('categoryId', categoryId)
      params.delete('subcategoryId')
    }

    navigateWithParams(params)
  }

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    const params = new URLSearchParams(searchParams.toString())
    const isActive = params.get('subcategoryId') === subcategory.id

    if (isActive) {
      params.delete('subcategoryId')
    } else {
      params.set('subcategoryId', subcategory.id)
      params.set('categoryId', subcategory.category_id)
    }

    navigateWithParams(params)
  }

  const clearFilters = () => {
    router.push('/categories', { scroll: false })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-6 md:py-10" dir="rtl">
      <Header />

      <section className="px-4 py-6 md:py-10 bg-secondary/40">
        <div className="max-w-6xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              متجر Augen
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              {activeFilterLabel
                ? `يتم عرض المنتجات ضمن فئة "${activeFilterLabel}"`
                : "استكشف جميع منتجاتنا واختر الإطار المثالي لأسلوبك"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {filteredProducts.length} منتج متاح
            </p>
          </div>

          {(categoryFilter || subcategoryFilter) && (
            <button
              onClick={clearFilters}
              className="self-start md:self-auto text-sm font-semibold text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              إعادة تعيين التصفية
            </button>
          )}
        </div>
      </section>

      <section className="px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">كل التصنيفات</h2>
              <span className="text-sm text-muted-foreground">
                استعرض الفئات الرئيسية والفرعية واختَر ما يناسبك
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((category) => {
                const IconComponent = getIcon(category.icon)
                const isActive = categoryFilter === category.id
                const bgColor = category.color || '#3b82f6'

                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`relative overflow-hidden rounded-2xl p-5 text-left text-white shadow-lg transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-white ${isActive ? 'ring-2 ring-white ring-offset-2' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${bgColor}ee 0%, ${bgColor} 100%)`
                    }}
                    aria-pressed={isActive}
                  >
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="relative flex flex-col gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                        <IconComponent className="w-7 h-7" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {category.name_ar || category.name}
                        </h3>
                        <p className="text-sm text-white/90 line-clamp-2">
                          {category.description_ar || category.description || 'مجموعة مميزة من النظارات'}
                        </p>
                      </div>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <p className="text-xs text-white/80">
                          {category.subcategories.length} فئات فرعية
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}

              {allSubcategories.map((subcategory) => {
                const IconComponent = getIcon(subcategory.icon)
                const isActive = subcategoryFilter === subcategory.id
                const bgColor = subcategory.color || '#6366f1'

                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategoryClick(subcategory)}
                    className={`relative overflow-hidden rounded-2xl p-4 text-left text-white shadow-lg transition-transform duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-white ${isActive ? 'ring-2 ring-white ring-offset-2' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${bgColor}dd 0%, ${bgColor} 100%)`
                    }}
                    aria-pressed={isActive}
                  >
                    <div className="absolute inset-0 bg-white/10" />
                    <div className="relative flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-white/80">
                            {subcategory.parentNameAr || subcategory.parentName}
                          </p>
                          <h3 className="text-lg font-bold">
                            {subcategory.name_ar || subcategory.name}
                          </h3>
                        </div>
                      </div>
                      {subcategory.description_ar || subcategory.description ? (
                        <p className="text-xs text-white/80 line-clamp-2">
                          {subcategory.description_ar || subcategory.description}
                        </p>
                      ) : (
                        <p className="text-xs text-white/70">
                          فئة فرعية ضمن {subcategory.parentNameAr || subcategory.parentName}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">المنتجات</h2>
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} منتج
                </p>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="border border-dashed border-border rounded-3xl py-16 flex flex-col items-center justify-center text-center gap-4">
                <Layers className="w-12 h-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold">لا توجد منتجات مطابقة</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    حاول تغيير الفئة أو إعادة تعيين التصفية لعرض جميع المنتجات
                  </p>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm font-semibold text-primary border border-primary px-4 py-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  عرض كل المنتجات
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
