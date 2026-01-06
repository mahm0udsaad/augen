"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause, Maximize2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { ProductImage } from "@/lib/products"
import { TIGER_BADGE_COLORS } from "@/lib/constants"

interface ProductMediaCarouselProps {
  videoUrl?: string | null
  images: ProductImage[]
  productName: string
  onColorSelect?: (label: string) => void
}

export default function ProductMediaCarousel({
  videoUrl,
  images,
  productName,
  onColorSelect,
}: ProductMediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)

  // Combine video (if exists) and images into media array
  const mediaItems = [
    ...(videoUrl ? [{ type: "video" as const, url: videoUrl, id: "video" }] : []),
    ...images.map((img) => ({ type: "image" as const, url: img.image_url, id: img.id, colorData: img })),
  ]

  const totalItems = mediaItems.length

  if (totalItems === 0) {
    return (
      <div className="relative w-full aspect-square bg-secondary rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">لا توجد صور متاحة</p>
      </div>
    )
  }

  const currentItem = mediaItems[currentIndex]
  const fullscreenItem = mediaItems[fullscreenIndex]

  const syncFullscreenIndex = (index: number) => {
    if (totalItems === 0) return
    if (index < 0) {
      setFullscreenIndex(totalItems - 1)
    } else if (index >= totalItems) {
      setFullscreenIndex(0)
    } else {
      setFullscreenIndex(index)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
    syncFullscreenIndex((currentIndex + 1) % totalItems)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
    syncFullscreenIndex((currentIndex - 1 + totalItems) % totalItems)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
    syncFullscreenIndex(index)
  }

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsVideoPlaying(!isVideoPlaying)
    }
  }

  const openFullscreen = (index: number) => {
    if (totalItems === 0) return
    const normalizedIndex = ((index % totalItems) + totalItems) % totalItems
    syncFullscreenIndex(normalizedIndex)
    setIsFullscreenOpen(true)
    setTimeout(() => {
      const targetItem = mediaItems[normalizedIndex]
      if (targetItem?.type === "video") {
        fullscreenVideoRef.current?.play()
      }
    }, 150)
  }

  const fullscreenNext = () => {
    syncFullscreenIndex(fullscreenIndex + 1)
  }

  const fullscreenPrev = () => {
    syncFullscreenIndex(fullscreenIndex - 1)
  }

  useEffect(() => {
    if (totalItems === 0) {
      setIsFullscreenOpen(false)
      setFullscreenIndex(0)
    } else if (fullscreenIndex >= totalItems) {
      setFullscreenIndex(totalItems - 1)
    }
  }, [totalItems, fullscreenIndex])

  useEffect(() => {
    if (!isFullscreenOpen && fullscreenItem?.type === "video") {
      fullscreenVideoRef.current?.pause()
    }
  }, [isFullscreenOpen, fullscreenItem])

  type ColorGroup = {
    name: string
    hex: string
    index: number
    colorType: "color" | "tiger"
    tigerType?: string | null
  }

  const colorGroups = images.reduce((acc, img, index) => {
    const colorType = (img.color_type as "color" | "tiger") || "color"
    const tigerLabel = img.tiger_type || img.color_name
    const colorKey =
      colorType === "tiger"
        ? `tiger-${tigerLabel || img.id}`
        : img.color_hex || img.id

    if (!acc[colorKey]) {
      acc[colorKey] = {
        name: img.color_name,
        hex: img.color_hex,
        index: videoUrl ? index + 1 : index,
        colorType,
        tigerType: img.tiger_type,
      }
    }
    return acc
  }, {} as Record<string, ColorGroup>)

  const handleColorClick = (groupKey: string, group: ColorGroup) => {
    goToSlide(group.index)
    const label =
      group.colorType === "tiger"
        ? `${group.name}${group.tigerType ? ` - ${group.tigerType}` : ""}`
        : group.name
    onColorSelect?.(label)
  }

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden group">
        {totalItems > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 z-20 bg-white/80 text-foreground hover:bg-white"
            onClick={() => openFullscreen(currentIndex)}
            aria-label="عرض بملء الشاشة"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        )}
        {currentItem.type === "video" ? (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={currentItem.url}
              className="w-full h-full object-cover"
              loop
              playsInline
              onClick={toggleVideoPlayback}
            />
            {/* Video Play/Pause Overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity"
              onClick={toggleVideoPlayback}
            >
              <Button
                size="icon"
                variant="secondary"
                className="w-16 h-16 rounded-full bg-white/90 hover:bg-white"
              >
                {isVideoPlaying ? (
                  <Pause className="w-8 h-8 text-black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" />
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Image
            src={currentItem.url}
            alt={`${productName} - ${currentItem.colorData?.color_name || ""}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? "eager" : "lazy"}
            quality={85}
            onError={async (e) => {
              // #region agent log (H1/H2/H3)
              const img = e.currentTarget as HTMLImageElement
              const currentSrc = img?.currentSrc
              let headStatus: number | null = null
              let headError: string | null = null
              try {
                if (currentSrc) {
                  const res = await fetch(currentSrc, { method: "HEAD" })
                  headStatus = res.status
                }
              } catch (err: any) {
                headError = String(err?.message || err)
              }
              fetch("http://127.0.0.1:7242/ingest/5593c2bb-8cf6-4bc8-ae42-5477c61c8363", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: "debug-session",
                  runId: "pre-fix",
                  hypothesisId: "H1",
                  location: "components/product-media-carousel.tsx:onError(main)",
                  message: "ProductMediaCarousel main Image failed",
                  data: {
                    productName,
                    currentIndex,
                    intendedSrc: currentItem.url,
                    currentSrc,
                    headStatus,
                    headError,
                  },
                  timestamp: Date.now(),
                }),
              }).catch(() => {})
              // #endregion agent log
            }}
          />
        )}

        {/* Navigation Arrows */}
        {totalItems > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={prevSlide}
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={nextSlide}
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {currentIndex + 1} / {totalItems}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2" dir="rtl">
          {mediaItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"
              }`}
            >
              {item.type === "video" ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              ) : (
                <Image
                  src={item.url}
                  alt={`معاينة ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                  loading="lazy"
                  quality={60}
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Color Selector */}
      {Object.keys(colorGroups).length > 1 && (
        <div className="space-y-2" dir="rtl">
          <p className="text-sm font-medium text-foreground">الألوان المتاحة:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(colorGroups).map(([key, data]) => (
              <button
                key={key}
                onClick={() => handleColorClick(key, data)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  currentIndex === data.index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary"
                }`}
                title={data.colorType === "tiger" ? data.tigerType || data.name : data.name}
              >
                <div className="w-7 h-7 rounded-full border-2 border-white shadow-sm overflow-hidden">
                  {data.colorType === "tiger" ? (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${TIGER_BADGE_COLORS.base}, ${TIGER_BADGE_COLORS.highlight})`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: data.hex || "#000000" }}
                    />
                  )}
                </div>
                <div className="flex flex-col text-right leading-tight">
                  <span className="text-sm font-medium">
                    {data.colorType === "tiger" ? data.tigerType || data.name : data.name}
                  </span>
                  {data.colorType === "tiger" && (
                    <span className="text-[11px] text-muted-foreground">تايجر • {data.name}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {totalItems > 0 && fullscreenItem && (
        <Dialog open={isFullscreenOpen} onOpenChange={setIsFullscreenOpen}>
          <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden border-none bg-black text-white">
            <div className="relative w-full h-full bg-black">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-30 bg-white/20 hover:bg-white/30"
                onClick={() => setIsFullscreenOpen(false)}
                aria-label="إغلاق العرض الكامل"
              >
                <X className="w-5 h-5" />
              </Button>

              {fullscreenItem.type === "video" ? (
                <video
                  ref={fullscreenVideoRef}
                  src={fullscreenItem.url}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={fullscreenItem.url}
                  alt={`${productName} - preview`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                  loading="eager"
                  quality={95}
                />
              )}

              {totalItems > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30"
                    onClick={fullscreenPrev}
                    aria-label="السابق"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30"
                    onClick={fullscreenNext}
                    aria-label="التالي"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-1 rounded-full text-sm">
                {fullscreenIndex + 1} / {totalItems}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
