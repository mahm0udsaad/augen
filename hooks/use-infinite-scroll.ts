"use client"

import { useState, useEffect, useCallback, useRef } from "react"

interface UseInfiniteScrollOptions<T> {
  initialData?: T[]
  fetchFn: (page: number, pageSize: number) => Promise<T[]>
  pageSize?: number
  threshold?: number
}

interface UseInfiniteScrollReturn<T> {
  data: T[]
  loading: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => void
  reset: () => void
  observerRef: (node: HTMLDivElement | null) => void
}

export function useInfiniteScroll<T>({
  initialData = [],
  fetchFn,
  pageSize = 12,
  threshold = 0.8,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [page, setPage] = useState(initialData.length > 0 ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const observerTarget = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    
    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const nextPage = page + 1
      const newData = await fetchFn(nextPage, pageSize)

      if (newData.length === 0 || newData.length < pageSize) {
        setHasMore(false)
      }

      setData((prev) => [...prev, ...newData])
      setPage(nextPage)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load more"))
      console.error("Error loading more data:", err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, page, pageSize, fetchFn])

  const reset = useCallback(() => {
    setData([])
    setPage(0)
    setHasMore(true)
    setError(null)
    loadingRef.current = false
  }, [])

  // Auto-load first page when page is 0 (initial mount or after reset)
  useEffect(() => {
    if (page === 0 && hasMore && !loadingRef.current) {
      loadMore()
    }
  }, [page, hasMore, loadMore])

  // Intersection Observer for automatic loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold, rootMargin: "100px" }
    )

    const currentTarget = observerTarget.current

    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMore, threshold])

  const observerRef = useCallback((node: HTMLDivElement | null) => {
    observerTarget.current = node
  }, [])

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore,
    reset,
    observerRef,
  }
}

