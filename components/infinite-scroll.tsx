"use client"

import { useEffect, useRef, useCallback } from 'react'
import { Loader2 } from 'lucide-react'

interface InfiniteScrollProps {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  children: React.ReactNode
  threshold?: number
  className?: string
}

export default function InfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  children,
  threshold = 200,
  className = '',
}: InfiniteScrollProps) {
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore]
  )

  useEffect(() => {
    const element = loadingRef.current
    if (!element) return

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
      rootMargin: `${threshold}px`,
    })

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [handleIntersection, threshold])

  return (
    <div className={className}>
      {children}
      {hasMore && (
        <div
          ref={loadingRef}
          className="flex items-center justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="h-8" /> // Spacer for intersection observer
          )}
        </div>
      )}
      {!hasMore && !loading && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          You've reached the end of the products
        </div>
      )}
    </div>
  )
}
