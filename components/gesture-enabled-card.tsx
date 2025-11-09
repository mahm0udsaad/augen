"use client"

import type React from "react"

import { useState } from "react"
import { useMobileGestures } from "@/hooks/use-mobile-gestures"

interface GestureEnabledCardProps {
  children: React.ReactNode
  onLongPress?: () => void
  className?: string
}

export default function GestureEnabledCard({ children, onLongPress, className = "" }: GestureEnabledCardProps) {
  const [scale, setScale] = useState(1)
  const { handleTouchStart, handleTouchEnd, isPressed } = useMobileGestures({
    onLongPress: () => {
      setScale(0.95)
      onLongPress?.()
    },
  })

  return (
    <div
      onTouchStart={(e) => handleTouchStart(e as any)}
      onTouchEnd={(e) => handleTouchEnd(e as any)}
      className={`transition-all duration-200 ${className} ${isPressed ? "opacity-75" : "opacity-100"}`}
      style={{ transform: `scale(${scale})` }}
      onTouchMove={() => setScale(0.98)}
      onTouchCancel={() => setScale(1)}
    >
      {children}
    </div>
  )
}
