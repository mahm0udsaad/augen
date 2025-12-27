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
  const initialLoadDone = useRef(false)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

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
    }
  }, [loading, hasMore, page, pageSize, fetchFn])

  const reset = useCallback(() => {
    setData(initialData)
    setPage(initialData.length > 0 ? 1 : 0)
    setHasMore(true)
    setError(null)
    initialLoadDone.current = false
  }, [initialData])

  // Ensure we load the first page at least once.
  // Without this, consumers that render an "empty state" when data.length === 0 can
  // accidentally prevent the observer target from mounting, causing a deadlock.
  useEffect(() => {
    if (!initialLoadDone.current && data.length === 0 && hasMore && !loading) {
      initialLoadDone.current = true
      loadMore()
    }
  }, [data.length, hasMore, loading, loadMore])

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

