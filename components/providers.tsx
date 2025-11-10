'use client'

import type React from 'react'
import { CartProvider } from '@/lib/cart-context'
import { FavoritesProvider } from '@/lib/favorites-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </FavoritesProvider>
  )
}


