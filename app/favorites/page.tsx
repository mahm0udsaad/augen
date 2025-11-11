"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { useFavorites } from "@/lib/favorites-context"
import Link from "next/link"
import { Heart } from "lucide-react"

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  return (
    <main className="min-h-screen bg-background" dir="ltr">
      <Header language="en" />

      <section className="px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 text-accent">
              <Heart className="w-7 h-7" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Favorites</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Save your favorite frames and return to them anytime to complete your order or share with friends.
            </p>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border rounded-3xl space-y-4">
              <p className="text-lg font-semibold">No items in favorites yet</p>
              <p className="text-sm text-muted-foreground">
                Browse our collection and add frames you like with one click.
              </p>
              <Link
                href="/categories"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-accent text-accent-foreground font-semibold hover:bg-accent/90 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {favorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer language="en" />
    </main>
  )
}
