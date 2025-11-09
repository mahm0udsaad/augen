import Link from "next/link"
import Image from "next/image"
import { getAllProducts } from "@/lib/product-service"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "أوغن – تشكيلة النظارات الفاخرة | الصفحة الرئيسية",
  description:
    "استكشف التشكيلة المختارة من نظارات أوغن المصممة يدويًا لكل أسلوب ومناسبة. تواصل معنا على ‎+2010 35212724.",
  openGraph: {
    title: "أوغن – تشكيلة النظارات الفاخرة",
    description: "تعرّف على أفضل إطارات النظارات المصممة بعناية من أوغن.",
    images: [
      {
        url: "/images/hero.png",
        width: 1200,
        height: 630,
        alt: "Augen Eyewear Collection",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أوغن – تشكيلة النظارات الفاخرة",
    description: "تعرّف على أفضل إطارات النظارات المصممة بعناية من أوغن.",
    images: ["/images/hero.png"],
  },
}

export default async function Home() {
  const products = await getAllProducts()
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative h-screen md:h-[500px] lg:h-screen flex items-center justify-center overflow-hidden">
        <Image src="/images/hero.png" alt="تشكيلة نظارات فاخرة" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
        <div className="relative z-10 px-4 py-8 sm:py-12 md:py-24 text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-bold text-white mb-3 md:mb-6 text-balance leading-tight">
            أناقة خالدة برؤية عصرية
          </h1>
          <p className="text-sm sm:text-base md:text-xl text-white/90 mb-6 md:mb-10 max-w-2xl mx-auto text-pretty">
            اكتشف تشكيلة النظارات الفاخرة من أوغن وجرّبها افتراضيًا بتقنية الذكاء الاصطناعي.
          </p>
          <div className="flex gap-3 sm:gap-4 justify-center flex-wrap">
            <Link
              href="#products"
              className="px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 active:bg-accent/80 transition-smooth font-semibold text-xs sm:text-base md:text-lg min-h-[44px] flex items-center justify-center hover:scale-105"
            >
              استكشف المجموعة
            </Link>
            <Link
              href="/contact"
              className="px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-white text-white rounded-lg hover:bg-white/10 active:bg-white/20 transition-smooth font-semibold text-xs sm:text-base md:text-lg min-h-[44px] flex items-center justify-center"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      <section id="products" className="px-4 py-8 sm:py-12 md:py-24 bg-background pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-12 animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2 text-center">
              تشكيلتنا المختارة
            </h2>
            <p className="text-center text-muted-foreground text-xs sm:text-base">
              إطارات مصممة يدويًا لكل أسلوب ومناسبة
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {products.map((product, index) => (
              <div key={product.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:py-12 md:py-24 bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 md:mb-12 text-center animate-slide-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
              آراء عملائنا
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base">
              انضم إلى آلاف العملاء الراضين حول العالم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
            {[
              {
                name: "Sarah Mitchell",
                role: "شغوفة بالموضة",
                text: "ميزة تجربة الذكاء الاصطناعي مذهلة! وجدت الإطار المثالي دون مغادرة المنزل. الجودة تفوق التوقعات.",
                rating: 5,
              },
              {
                name: "James Chen",
                role: "محترف أعمال",
                text: "أوغن تقدم جودة فاخرة بأسعار عادلة. فريق الواتساب سريع ومتعاون للغاية.",
                rating: 5,
              },
              {
                name: "Emma Rodriguez",
                role: "مدونة أزياء",
                text: "هذه النظارات مدهشة! الحِرَفية واضحة في كل تفصيلة. أنصح بها كل من يبحث عن نظارات فاخرة.",
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
              لماذا تختار أوغن؟
            </h2>
            <p className="text-muted-foreground text-xs sm:text-base">
              جودة فاخرة وتقنيات مبتكرة وخدمة استثنائية
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
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">تجربة ذكية</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                شاهد كيف تبدو الإطارات عليك باستخدام تقنية الذكاء الاصطناعي المتقدمة
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">جودة فاخرة</h3>
              <p className="text-xs md:text-base text-muted-foreground">إطارات مصنوعة يدويًا من أجود المواد</p>
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
              <h3 className="text-base md:text-xl font-semibold text-foreground mb-1 md:mb-2">دعم متخصص</h3>
              <p className="text-xs md:text-base text-muted-foreground">
                دعم مباشر عبر الواتساب لمساعدتك بشكل شخصي
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
