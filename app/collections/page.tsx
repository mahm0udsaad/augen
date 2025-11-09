"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Loader2, Glasses, Sun, Sparkles, Circle, Square, Eye, Star, Heart, Zap, Crown, Shield, Award, Target, Layers, Package, ShoppingBag, Tag, Gem, Shirt, Watch, Briefcase, ChevronLeft, Grid3x3 } from "lucide-react"
import Link from "next/link"

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
  layers: Layers,
  package: Package,
  "shopping-bag": ShoppingBag,
  tag: Tag,
  gem: Gem,
  shirt: Shirt,
  watch: Watch,
  briefcase: Briefcase,
}



export default function CollectionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) throw new Error('فشل في تحميل الفئات')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("خطأ أثناء تحميل الفئات:", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName: string | null) => {
    if (!iconName) return Glasses
    return iconMap[iconName] || Glasses
  }

  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)
  const categoriesWithSubs = categories.filter(cat => cat.subcategories && cat.subcategories.length > 0).length

  const handleCategoryClick = (categoryId: string, e: React.MouseEvent) => {
    e.preventDefault()
    window.location.href = `/categories?categoryId=${encodeURIComponent(categoryId)}`
  }

  const handleSubcategoryClick = (subcategoryId: string, categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    window.location.href = `/categories?subcategoryId=${encodeURIComponent(subcategoryId)}&categoryId=${encodeURIComponent(categoryId)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600">جاري التحميل...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <Grid3x3 className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-l from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            المجموعات
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
            استكشف مجموعاتنا المتنوعة من النظارات المصممة بعناية لتناسب أسلوبك الفريد
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-200 rounded-full mb-6">
              <Layers className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-700 mb-2">
              لا توجد مجموعات متاحة حالياً
            </h3>
            <p className="text-slate-500">تحقق مرة أخرى لاحقاً للحصول على مجموعات جديدة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((category) => {
              const IconComponent = getIcon(category.icon)
              const bgColor = category.color || '#3b82f6'
              const hasSubcategories = category.subcategories && category.subcategories.length > 0

              return (
                <Link 
                  key={category.id}
                  href={`/categories?categoryId=${encodeURIComponent(category.id)}`}
                >
                  <Card 
                    className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white"
                  >
                  {/* Category Header */}
                  <div 
                    className="relative p-8"
                    style={{
                      background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`
                    }}
                  >
                    <div className="flex items-start gap-6">
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 p-4 rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: bgColor }}
                      >
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                          {category.name_ar || category.name}
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                          {category.description_ar || category.description}
                        </p>
                        
                        {hasSubcategories && (
                          <div className="mt-4 flex items-center gap-2 text-sm font-medium" style={{ color: bgColor }}>
                            <span>{category.subcategories!.length} فئة فرعية</span>
                            <ChevronLeft className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div 
                      className="absolute top-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-20"
                      style={{ backgroundColor: bgColor }}
                    />
                  </div>

                  {/* Subcategories Section */}
                  {hasSubcategories && (
                    <div className="p-6 bg-slate-50/50">
                      <div className="grid grid-cols-2 gap-3">
                        {category.subcategories!.map((subcategory) => {
                          const SubIcon = getIcon(subcategory.icon)
                          
                          return (
                            <Link
                              key={subcategory.id}
                              href={`/categories?subcategoryId=${encodeURIComponent(subcategory.id)}&categoryId=${encodeURIComponent(category.id)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="group/sub relative p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-current transition-all duration-300 hover:shadow-md text-right"
                              style={{ 
                                '--hover-color': bgColor,
                              } as React.CSSProperties}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="flex-shrink-0 p-2 rounded-lg transition-colors duration-300"
                                  style={{ 
                                    backgroundColor: `${bgColor}20`,
                                    color: bgColor
                                  }}
                                >
                                  <SubIcon className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-800 text-sm group-hover/sub:text-current transition-colors" style={{ color: 'inherit' }}>
                                    {subcategory.name_ar || subcategory.name}
                                  </h3>
                                </div>
                              </div>

                              {/* Hover Arrow */}
                              <div 
                                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/sub:opacity-100 transition-opacity duration-300"
                                style={{ color: bgColor }}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State for No Subcategories */}
                  {!hasSubcategories && (
                    <div className="p-6 bg-slate-50/50 border-t border-slate-200">
                      <p className="text-center text-sm text-slate-500">
                        تصفح جميع المنتجات في هذه المجموعة
                      </p>
                    </div>
                  )}
                </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
