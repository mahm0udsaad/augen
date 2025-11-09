"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProductImage } from "@/lib/products"

interface ProductMediaCarouselProps {
  videoUrl?: string | null
  images: ProductImage[]
  productName: string
  onColorSelect?: (colorHex: string) => void
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

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalItems)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    if (currentItem.type === "video") {
      setIsVideoPlaying(false)
      videoRef.current?.pause()
    }
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

  // Group images by color
  const colorGroups = images.reduce((acc, img, index) => {
    const colorKey = img.color_hex
    if (!acc[colorKey]) {
      acc[colorKey] = {
        name: img.color_name,
        hex: img.color_hex,
        index: videoUrl ? index + 1 : index, // Offset by 1 if video exists
      }
    }
    return acc
  }, {} as Record<string, { name: string; hex: string; index: number }>)

  const handleColorClick = (hex: string, index: number) => {
    goToSlide(index)
    onColorSelect?.(hex)
  }

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden group">
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
            {Object.entries(colorGroups).map(([hex, data]) => (
              <button
                key={hex}
                onClick={() => handleColorClick(hex, data.index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                  currentIndex === data.index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary"
                }`}
                title={data.name}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-sm font-medium">{data.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

