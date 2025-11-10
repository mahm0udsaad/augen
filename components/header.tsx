"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ShoppingCart, Heart } from "lucide-react"
import { useCart } from "@/lib/cart-context"

type Language = "en" | "ar"

interface HeaderProps {
  language?: Language
}

export default function Header({ language = "ar" }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  const isEnglish = language === "en"
  const labels = {
    home: isEnglish ? "Home" : "الرئيسية",
    collections: isEnglish ? "Collections" : "المجموعات",
    contact: isEnglish ? "Contact" : "تواصل معنا",
    favorites: isEnglish ? "Favorites" : "المفضلة",
    cart: isEnglish ? "Cart" : "السلة",
    toggleMenu: isEnglish ? "Toggle menu" : "تبديل القائمة",
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm" dir={isEnglish ? "ltr" : "rtl"}>
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-smooth group"
        >
          <Image
            src="/images/icon.png"
            alt="Augen"
            width={48}
            height={48}
            className="w-28"
            priority
          />
        </Link>

        <nav className="hidden md:flex gap-8 items-center" dir={isEnglish ? "ltr" : "rtl"}>
          <Link
            href="/"
            className="text-sm text-foreground hover:text-accent transition-smooth flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4"
              />
            </svg>
            {labels.home}
          </Link>
          <Link
            href="/collections"
            className="text-sm text-foreground hover:text-accent transition-smooth flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            {labels.collections}
          </Link>
          <Link
            href="/contact"
            className="text-sm text-foreground hover:text-accent transition-smooth flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {labels.contact}
          </Link>
          <Link
            href="/favorites"
            className="text-sm text-foreground hover:text-accent transition-smooth flex items-center gap-2"
          >
            <Heart className="w-4 h-4" />
            {labels.favorites}
          </Link>
        </nav>

        <Link
          href="/cart"
          className="hidden md:inline-flex relative p-2 rounded-full border border-border hover:border-accent transition-colors"
          aria-label={labels.cart}
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -left-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>

        <button
          className="md:hidden p-2.5 hover:bg-secondary rounded-lg transition-smooth min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={labels.toggleMenu}
          aria-expanded={mobileMenuOpen}
        >
          <svg
            className={`w-6 h-6 transition-smooth ${mobileMenuOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border px-4 py-4 flex flex-col gap-2 animate-slide-down bg-secondary/30" dir={isEnglish ? "ltr" : "rtl"}>
          <Link
            href="/"
            className="text-foreground hover:text-accent transition-smooth py-3 px-4 rounded-lg hover:bg-secondary flex items-center gap-3 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-4m0 0l4 4m-4-4v4"
              />
            </svg>
            <span>{labels.home}</span>
          </Link>
          <Link
            href="/collections"
            className="text-foreground hover:text-accent transition-smooth py-3 px-4 rounded-lg hover:bg-secondary flex items-center gap-3 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
              />
            </svg>
            <span>{labels.collections}</span>
          </Link>
          <Link
            href="/contact"
            className="text-foreground hover:text-accent transition-smooth py-3 px-4 rounded-lg hover:bg-secondary flex items-center gap-3 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>{labels.contact}</span>
          </Link>
          <Link
            href="/favorites"
            className="text-foreground hover:text-accent transition-smooth py-3 px-4 rounded-lg hover:bg-secondary flex items-center gap-3 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Heart className="w-5 h-5 flex-shrink-0" />
            <span>{labels.favorites}</span>
          </Link>
          <Link
            href="/cart"
            className="text-foreground hover:text-accent transition-smooth py-3 px-4 rounded-lg hover:bg-secondary flex items-center gap-3 min-h-[44px]"
            onClick={() => setMobileMenuOpen(false)}
          >
            <ShoppingCart className="w-5 h-5 flex-shrink-0" />
            <span>
              {labels.cart}
              {totalItems > 0 ? ` (${totalItems})` : ""}
            </span>
          </Link>
        </nav>
      )}
    </header>
  )
}
