"use client"

import { useEffect, useRef, useState } from "react"
import type { ShippingCity } from "@/types/shipping"

interface UseShippingCitiesResult {
  cities: ShippingCity[]
  isLoading: boolean
  error: string | null
  refresh: () => void
}

export function useShippingCities(): UseShippingCitiesResult {
  const [cities, setCities] = useState<ShippingCity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const fetchCities = async (attempt = 0) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/shipping-cities", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Failed to load shipping cities")
      }
      const data = await response.json()
      if (!isMounted.current) return
      setCities(data.cities || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching shipping cities:", err)
      if (!isMounted.current) return
      // Retry a couple times to handle transient cold starts / network blips
      if (attempt < 2) {
        const delayMs = 350 * Math.pow(2, attempt)
        await new Promise((resolve) => setTimeout(resolve, delayMs))
        if (!isMounted.current) return
        return fetchCities(attempt + 1)
      }
      setError("تعذر تحميل مدن الشحن")
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    // In React Strict Mode (dev), effects mount/cleanup twice.
    // Ensure we mark as mounted on each effect run.
    isMounted.current = true
    fetchCities()
    return () => {
      isMounted.current = false
    }
  }, [])

  return { cities, isLoading, error, refresh: fetchCities }
}
