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

  const fetchCities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/shipping-cities")
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
      setError("تعذر تحميل مدن الشحن")
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchCities()
    return () => {
      isMounted.current = false
    }
  }, [])

  return { cities, isLoading, error, refresh: fetchCities }
}
