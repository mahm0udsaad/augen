"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarouselSlide {
  id: string
  image_url: string
  mobile_image_url: string | null
  sort_order: number
  is_active: boolean
  headline?: string | null
  slogan?: string | null
  cta_label?: string | null
  cta_link?: string | null
}

type Language = "en" | "ar"

interface HeroCarouselProps {
  slides: CarouselSlide[]
  autoPlayInterval?: number
  language?: Language
}

export default function HeroCarousel({ slides, autoPlayInterval = 5000, language = "ar" }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const isEnglish = language === "en"
  const copy = {
    empty: isEnglish ? "No images available" : "لا توجد صور متاحة",
    defaultHeadline: isEnglish ? "AUGEN" : "أوغن",
    defaultSlogan: isEnglish ? "Discover the latest luxury frames" : "اكتشف أحدث تشكيلة من الإطارات الفاخرة",
    defaultCTA: isEnglish ? "Shop Now" : "تسوق الآن",
    prev: isEnglish ? "Previous slide" : "الصورة السابقة",
    next: isEnglish ? "Next slide" : "الصورة التالية",
    dot: (index: number) => (isEnglish ? `Go to slide ${index}` : `الذهاب إلى الصورة ${index}`),
  }

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextSlide, autoPlayInterval, slides.length])

  // Pause auto-play on user interaction
  const handleUserInteraction = () => {
    setIsAutoPlaying(false)
  }

  if (slides.length === 0) {
    return (
      <section className="relative h-screen md:h-[500px] lg:h-screen flex items-center justify-center bg-secondary">
        <p className="text-muted-foreground">{copy.empty}</p>
      </section>
    )
  }

  return (
    <section className="relative h-screen md:h-[500px] lg:h-screen overflow-hidden group">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => {
          const headline = slide.headline || copy.defaultHeadline
          const slogan = slide.slogan || copy.defaultSlogan
          const ctaLabel = slide.cta_label || copy.defaultCTA
          const ctaLink = slide.cta_link || "/categories"

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Desktop Image */}
              <Image
                src={slide.image_url}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover hidden md:block"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                quality={85}
                sizes="100vw"
              />
              {/* Mobile Image */}
              <Image
                src={slide.mobile_image_url || slide.image_url}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover block md:hidden"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                quality={85}
                sizes="100vw"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />

              {/* Content Overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 md:px-16 lg:px-24 max-w-4xl space-y-4 text-white">
                  <p className="text-sm md:text-base uppercase tracking-[0.4em] text-gray-200">
                    {headline}
                  </p>
                  <p className="text-3xl md:text-5xl font-bold leading-tight drop-shadow-lg">
                    {slogan}
                  </p>
                  <div className="pt-4">
                    <Button asChild size="lg" className="bg-white text-black hover:bg-white/90">
                      <Link href={ctaLink}>{ctaLabel}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              handleUserInteraction()
              prevSlide()
            }}
            aria-label={copy.prev}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              handleUserInteraction()
              nextSlide()
            }}
            aria-label={copy.next}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                handleUserInteraction()
                goToSlide(index)
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={copy.dot(index + 1)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
