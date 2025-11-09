"use client"

import { useEffect, useRef, useState } from "react"

interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onLongPress?: () => void
  longPressDuration?: number
  threshold?: number
}

export function useMobileGestures(options: GestureOptions) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onLongPress,
    longPressDuration = 500,
    threshold = 50,
  } = options

  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const [isPressed, setIsPressed] = useState(false)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    setIsPressed(true)

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress()
        setIsPressed(false)
      }, longPressDuration)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY
    const deltaX = touchEndX - touchStartX.current
    const deltaY = touchEndY - touchStartY.current
    const duration = Date.now() - touchStartTime.current

    setIsPressed(false)

    // Only process swipes if they weren't long presses
    if (duration < longPressDuration) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.()
          } else {
            onSwipeLeft?.()
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.()
          } else {
            onSwipeUp?.()
          }
        }
      }
    }
  }

  return { handleTouchStart, handleTouchEnd, isPressed }
}

export function useSwipeNavigation() {
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    setCanGoBack(window.history.length > 1)
  }, [])

  const handleSwipeRight = () => {
    if (canGoBack) {
      window.history.back()
    }
  }

  return { handleSwipeRight, canGoBack }
}

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const touchStartY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!containerRef.current) return

    const touchCurrentY = e.touches[0].clientY
    const delta = touchCurrentY - touchStartY.current

    if (delta > 0 && containerRef.current.scrollTop === 0) {
      const progress = Math.min(delta / 100, 1)
      containerRef.current.style.transform = `translateY(${delta * 0.3}px)`
    }
  }

  const handleTouchEnd = async (e: TouchEvent) => {
    if (!containerRef.current) return

    const touchEndY = e.changedTouches[0].clientY
    const delta = touchEndY - touchStartY.current

    if (delta > 80 && containerRef.current.scrollTop === 0) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    containerRef.current.style.transform = "translateY(0)"
  }

  return { containerRef, handleTouchStart, handleTouchMove, handleTouchEnd, isRefreshing }
}
