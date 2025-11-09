"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { Product } from "@/lib/products"
import { toast } from "sonner"

interface FavoritesContextType {
  favorites: Product[]
  toggleFavorite: (product: Product) => void
  removeFavorite: (productId: string) => void
  clearFavorites: () => void
  isFavorite: (productId: string) => boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)
const FAVORITES_STORAGE_KEY = "augen_favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      if (stored) {
        setFavorites(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    }
    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
    }
  }, [favorites, isInitialized])

  const toggleFavorite = (product: Product) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === product.id)
      const updated = exists ? prev.filter((item) => item.id !== product.id) : [product, ...prev]
      toast.success(exists ? "تمت الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة")
      return updated
    })
  }

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId))
    toast.success("تم حذف العنصر من المفضلة")
  }

  const clearFavorites = () => {
    setFavorites([])
    toast.success("تم مسح قائمة المفضلة")
  }

  const isFavorite = (productId: string) => favorites.some((item) => item.id === productId)

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, removeFavorite, clearFavorites, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
