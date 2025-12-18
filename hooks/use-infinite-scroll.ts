"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Product } from '@/lib/products'
import type { PaginatedResponse, PaginationOptions } from '@/lib/product-service'
import { getProductsPaginated, getProductsByCategoriesPaginated } from '@/lib/product-service'
import type { ParentCategory, Subcategory } from '@/lib/constants'

interface UseInfiniteScrollOptions {
  parentCategory?: ParentCategory
  subcategory?: Subcategory
  initialLimit?: number
  loadMoreLimit?: number
}

interface UseInfiniteScrollReturn {
  products: Product[]
  loading: boolean
  loadingMore: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
}

export function useInfiniteScroll({
  parentCategory,
  subcategory,
  initialLimit = 12,
  loadMoreLimit = 12,
}: UseInfiniteScrollOptions = {}): UseInfiniteScrollReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const isInitialLoad = useRef(true)

  const fetchProducts = useCallback(async (
    pageNum: number,
    limit: number,
    append: boolean = false
  ): Promise<void> => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      let response: PaginatedResponse<Product>

      if (parentCategory) {
        response = await getProductsByCategoriesPaginated(
          parentCategory,
          subcategory,
          { page: pageNum, limit }
        )
      } else {
        response = await getProductsPaginated({ page: pageNum, limit })
      }

      if (append) {
        setProducts(prev => [...prev, ...response.data])
      } else {
        setProducts(response.data)
      }

      setHasMore(response.hasMore)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [parentCategory, subcategory])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchProducts(nextPage, loadMoreLimit, true)
    }
  }, [page, loadingMore, hasMore, loadMoreLimit, fetchProducts])

  const refresh = useCallback(() => {
    setPage(1)
    setProducts([])
    setError(null)
    setHasMore(true)
    fetchProducts(1, initialLimit, false)
  }, [initialLimit, fetchProducts])

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      fetchProducts(1, initialLimit, false)
      isInitialLoad.current = false
    }
  }, [fetchProducts, initialLimit])

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    setProducts([])
    setError(null)
    setHasMore(true)
    setLoading(true)
    fetchProducts(1, initialLimit, false)
  }, [parentCategory, subcategory, fetchProducts, initialLimit])

  return {
    products,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  }
}
