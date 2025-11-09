import Link from "next/link"
import { getAllProducts } from "@/lib/product-service"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"
import Footer from "@/components/footer"

async function CategoryProducts({ categoryKey }: { categoryKey: string }) {
  const products = await getAllProducts()
  // Filter products by category (using the first 6 as a featured list)
  const categoryProducts = products.slice(0, 6)
  
  if (categoryProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة حالياً.</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
      {categoryProducts.map((product, index) => (
        <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

const categoryInfo = {
  sunglasses: {
    name: "نظارات شمسية",
    description: "احمِ عينيك بأناقة مع تشكيلة النظارات الشمسية الفاخرة",
    icon: "☀️",
    details: "عدسات مع حماية كاملة من الأشعة فوق البنفسجية وإطارات خفيفة مثالية للإطلالات الخارجية.",
  },
  reading: {
    name: "نظارات قراءة",
    description: "إطارات مريحة وأنيقة للقراءة والأعمال الدقيقة",
    icon: "📖",
    details: "تصميمات تمنحك راحة طوال اليوم مع درجات تكبير متنوعة تناسب احتياجاتك.",
  },
  prescription: {
    name: "نظارات طبية",
    description: "إطارات مخصصة بالكامل وفقًا لوصفتك الطبية",
    icon: "👓",
    details: "تعاون مع فريقنا للحصول على نظارات طبية دقيقة مع خيارات تصميم فاخرة.",
  },
  sports: {
    name: "نظارات رياضية",
    description: "إطارات متينة وثابتة لأسلوب حياة نشِط",
    icon: "⚽",
    details: "مصممة لتحمّل الحركة العالية مع رؤية واضحة وثبات مريح أثناء الرياضة.",
  },
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = categoryInfo[params.category as keyof typeof categoryInfo]

  if (!category) {
    return (
      <main className="min-h-screen bg-background" dir="rtl">
        <Header />
        <div className="px-4 py-24 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">لم يتم العثور على الفئة</h1>
          <Link href="/categories" className="text-accent hover:underline">
            العودة إلى التصنيفات
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <Header />

      <section className="px-4 py-8 sm:py-12 md:py-16 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/categories"
            className="text-accent hover:text-accent/80 transition-smooth mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى التصنيفات
          </Link>
          <div className="animate-slide-up mt-4">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl sm:text-6xl">{category.icon}</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground">{category.name}</h1>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-4">{category.description}</p>
            <p className="text-sm sm:text-base text-muted-foreground">{category.details}</p>
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:py-12 md:py-24 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-8 md:mb-12 text-center animate-slide-up">
            منتجات مختارة
          </h2>
          <CategoryProducts categoryKey={params.category} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
