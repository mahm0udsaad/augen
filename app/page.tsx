import Link from "next/link"
import Image from "next/image"
import { getAllProducts } from "@/lib/product-service"
import ProductCard from "@/components/product-card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import HeroCarousel from "@/components/hero-carousel"
import { supabase } from "@/lib/supabase"
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
  
  // Fetch carousel slides
  const { data: slides } = await supabase
    .from("carousel_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel slides={slides || []} />

      {/* Hardcoded Category Sections */}
      <section className="px-4 py-8 sm:py-12 md:py-16 bg-[#f5e6d3]">
        <div className="max-w-7xl mx-auto">
          {/* Sunglasses Section */}
          <div className="mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Card */}
              <div className="md:col-span-1 lg:col-span-1 bg-white p-6 md:p-8 rounded-lg shadow-sm flex flex-col justify-center">
                <Image 
                  src="/images/icon.png" 
                  alt="Augen" 
                  width={60} 
                  height={60}
                  className="mb-4"
                />
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">نظارات شمسية</h2>
                <p className="text-lg md:text-xl mb-6">أفضل التصاميم وأفضل جودة</p>
                <Link 
                  href="/categories?parent=sunglasses"
                  className="bg-black text-white px-6 py-3 rounded-md hover:bg-black/90 transition-colors inline-block text-center w-fit"
                >
                  تسوق الآن
                </Link>
              </div>

              {/* Men's Sunglasses */}
              <Link 
                href="/categories?parent=sunglasses&sub=man"
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                    <Image 
                      src="/images/icon.png" 
                      alt="Augen" 
                      width={40} 
                      height={40}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">نظارات شمسية رجالي</h3>
                    <p className="text-sm md:text-base">ارتدِ النظارات التي تعزز شخصيتك</p>
                  </div>
                </div>
              </Link>

              {/* Women's Sunglasses */}
              <Link 
                href="/categories?parent=sunglasses&sub=woman"
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                    <Image 
                      src="/images/icon.png" 
                      alt="Augen" 
                      width={40} 
                      height={40}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">نظارات شمسية نسائي</h3>
                    <p className="text-sm md:text-base">لأن عينيك تحتاجهن</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Optical Glasses Section */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Main Card */}
              <div className="md:col-span-1 lg:col-span-1 bg-white p-6 md:p-8 rounded-lg shadow-sm flex flex-col justify-center">
                <Image 
                  src="/images/icon.png" 
                  alt="Augen" 
                  width={60} 
                  height={60}
                  className="mb-4"
                />
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">نظارات طبية</h2>
                <p className="text-lg md:text-xl mb-6">أفضل التصاميم وأفضل جودة</p>
                <Link 
                  href="/categories?parent=optical_glasses"
                  className="bg-black text-white px-6 py-3 rounded-md hover:bg-black/90 transition-colors inline-block text-center w-fit"
                >
                  تسوق الآن
                </Link>
              </div>

              {/* Men's Optical */}
              <Link 
                href="/categories?parent=optical_glasses&sub=man"
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                    <Image 
                      src="/images/icon.png" 
                      alt="Augen" 
                      width={40} 
                      height={40}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">نظارات طبية رجالي</h3>
                    <p className="text-sm md:text-base">ارتدِ النظارات التي تعزز شخصيتك</p>
                  </div>
                </div>
              </Link>

              {/* Women's Optical */}
              <Link 
                href="/categories?parent=optical_glasses&sub=woman"
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                    <Image 
                      src="/images/icon.png" 
                      alt="Augen" 
                      width={40} 
                      height={40}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">نظارات طبية نسائي</h3>
                    <p className="text-sm md:text-base">لأن عينيك تحتاجهن</p>
                  </div>
                </div>
              </Link>

              {/* Child's Optical */}
              <Link 
                href="/categories?parent=optical_glasses&sub=child"
                className="group relative bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1"
              >
                <div className="aspect-[4/3] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg">
                    <Image 
                      src="/images/icon.png" 
                      alt="Augen" 
                      width={40} 
                      height={40}
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 text-right">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">نظارات طبية للأطفال</h3>
                    <p className="text-sm md:text-base">في بعض الأحيان، كل ما تحتاجه هو منظور جديد</p>
                  </div>
                </div>
              </Link>
            </div>
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
