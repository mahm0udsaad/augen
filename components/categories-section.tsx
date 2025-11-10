"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PARENT_CATEGORIES, PARENT_SUBCATEGORY_MAP, SUBCATEGORIES } from "@/lib/constants"
import type { ParentCategory, Subcategory } from "@/lib/constants"

interface CategoryDisplay {
  id: string
  category_key: string
  title_ar: string
  title_en?: string | null
  slogan_ar: string | null
  slogan_en?: string | null
  background_image: string
  mobile_background_image: string | null
  sort_order: number
}

interface SubcategoryDisplay {
  id: string
  parent_category: string
  subcategory_key: string
  image_url: string
  mobile_image_url: string | null
  sort_order: number
}

interface CategoriesSectionProps {
  initialDisplays: CategoryDisplay[]
  subcategoryDisplays?: SubcategoryDisplay[]
  language?: "en" | "ar"
}

export default function CategoriesSection({ initialDisplays, subcategoryDisplays = [], language = "ar" }: CategoriesSectionProps) {
  const [displays, setDisplays] = useState<CategoryDisplay[]>(initialDisplays)
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set())
  const subDisplays = subcategoryDisplays
  const isEnglish = language === "en"

  const getCardForSubcategory = (parentKey: string, subKey: string) =>
    subDisplays.find(
      (subDisplay) => subDisplay.parent_category === parentKey && subDisplay.subcategory_key === subKey,
    )

  useEffect(() => {
    const timer = setTimeout(() => {
      displays.forEach((display, index) => {
        setTimeout(() => {
          setVisibleItems((prev) => new Set(prev).add(display.id))
        }, index * 150)
      })
    }, 100)

    return () => clearTimeout(timer)
  }, [displays])

  if (displays.length === 0) return null

  return (
    <div className="space-y-16 md:space-y-24" dir={isEnglish ? "ltr" : "rtl"}>
      {displays.map((display) => {
        const isVisible = visibleItems.has(display.id)
        const parentKey = display.category_key as ParentCategory
        const allowedSubcategories = PARENT_SUBCATEGORY_MAP[parentKey] || (Object.keys(SUBCATEGORIES) as Subcategory[])
        const subcats = allowedSubcategories.map((key) => [key, SUBCATEGORIES[key]])
        const parentFallback = PARENT_CATEGORIES[display.category_key as keyof typeof PARENT_CATEGORIES]
        const displayTitle = isEnglish
          ? display.title_en || parentFallback?.name_en || display.title_ar
          : display.title_ar || parentFallback?.name_ar
        const displaySlogan = isEnglish
          ? display.slogan_en || parentFallback?.description_en || display.slogan_ar
          : display.slogan_ar || parentFallback?.description_ar
        const primaryCta = isEnglish ? "Shop now" : "تسوق الآن"
        const discoverCopy = isEnglish ? "Discover more" : "اكتشف المزيد"

        return (
          <section
            key={display.id}
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-6 group">
              <div className="absolute inset-0">
                <Image
                  src={display.background_image}
                  alt={displayTitle || "Augen Collection"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="100vw"
                  priority={display.sort_order === 1}
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

              <div className="relative h-full flex flex-col justify-end p-6 md:p-12 text-white">
                <div className="max-w-2xl">
                  <Image 
                    src="/images/icon.png" 
                    alt="Augen" 
                    width={80} 
                    height={80}
                    className="mb-6 filter brightness-0 invert"
                  />
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                    {displayTitle}
                  </h2>
                  {displaySlogan && (
                    <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in animation-delay-200">
                      {displaySlogan}
                    </p>
                  )}
                  <Link
                    href={`/categories?parent=${display.category_key}`}
                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl"
                  >
                    {primaryCta}
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className={`grid grid-cols-1 gap-4 md:gap-6 ${subcats.length < 3 ? "grid-cols-2" : "grid-cols-3"}`}>
              {subcats.map(([key, subcat], index) => {
                const card = getCardForSubcategory(display.category_key, key)

                return (
                  <Link
                    key={key}
                    href={`/categories?parent=${display.category_key}&sub=${key}`}
                    className={`group relative h-[280px] rounded-xl overflow-hidden bg-gray-900 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                    style={{
                      transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
                    }}
                  >
                    <div className="absolute inset-0">
                      {card ? (
                        <>
                          <Image
                            src={card.image_url}
                            alt={`${displayTitle} ${isEnglish ? subcat.name_en : subcat.name_ar}`}
                            fill
                            className="object-cover hidden md:block"
                            sizes="(min-width: 768px) 33vw, 100vw"
                          />
                          <Image
                            src={card.mobile_image_url || card.image_url}
                            alt={`${displayTitle} ${isEnglish ? subcat.name_en : subcat.name_ar}`}
                            fill
                            className="object-cover md:hidden"
                            sizes="100vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
                      )}
                    </div>

                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg group-hover:scale-110 transition-transform duration-300">
                      <Image 
                        src="/images/icon.png" 
                        alt="Augen" 
                        width={32} 
                        height={32}
                      />
                    </div>

                    <div className="relative h-full flex flex-col justify-end p-6 text-white">
                      <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-2 group-hover:translate-x-[-4px] transition-transform duration-300">
                          {displayTitle} {isEnglish ? subcat.name_en : subcat.name_ar}
                        </h3>
                        <p className="text-gray-300 text-sm md:text-base mb-4 group-hover:text-white transition-colors duration-300">
                          {isEnglish ? subcat.description_en : subcat.description_ar}
                        </p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <span>{discoverCopy}</span>
                          <svg
                            className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/20 rounded-xl transition-colors duration-300" />
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
