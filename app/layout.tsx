import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import BottomNav from "@/components/bottom-nav"
import { CartProvider } from "@/lib/cart-context"
import { FavoritesProvider } from "@/lib/favorites-context"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "أوغن – تشكيلة نظارات فاخرة",
  description:
    "اكتشف تشكيلة أوغن المختارة من أرقى إطارات النظارات المصممة يدويًا لكل المناسبات. تواصل معنا على ‎+2010 35212724.",
  keywords: ["نظارات", "أوغن", "نظارات شمسية", "إطارات فاخرة", "نظارات طبية"],
  authors: [{ name: "Augen" }],
  creator: "Augen",
  publisher: "Augen",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "أوغن – تشكيلة نظارات فاخرة",
    description: "تعرّف على أفضل إطارات النظارات المصممة بعناية من أوغن لكل الأذواق.",
    url: "/",
    siteName: "Augen",
    images: [
      {
        url: "/images/icon.png",
        width: 1200,
        height: 630,
        alt: "Augen Logo",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أوغن – تشكيلة نظارات فاخرة",
    description: "تعرّف على أفضل إطارات النظارات المصممة بعناية من أوغن.",
    images: ["/images/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/images/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`font-sans antialiased`}>
        <FavoritesProvider>
          <CartProvider>
            {children}
            <BottomNav />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </FavoritesProvider>
      </body>
    </html>
  )
}
