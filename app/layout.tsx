import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import BottomNav from "@/components/bottom-nav"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "Augen – Luxury Eyewear Collections",
  description:
    "Explore Augen's hand-finished eyewear curated for every style. Connect with our concierge team at +2010 35212724.",
  keywords: ["eyewear", "Augen", "sunglasses", "luxury frames", "prescription glasses"],
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
    title: "Augen – Luxury Eyewear Collections",
    description: "Discover meticulously crafted frames that elevate your daily look.",
    url: "/",
    siteName: "Augen",
    images: [
      {
        url: "https://augen.vercel.app/og.png",
        width: 1200,
        height: 630,
        alt: "Augen – Luxury Eyewear Collections",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Augen – Luxury Eyewear Collections",
    description: "Discover meticulously crafted frames that elevate your daily look.",
    images: ["https://augen.vercel.app/og.png"],
  },
  robots: {
    index: true,
    follow: true, // TODO: Change to false when we have a lot of pages
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
    apple: "https://augen.vercel.app/images/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" dir="ltr">
      <body className={`font-sans antialiased`}>
        <Providers>
          {children}
          <BottomNav />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  )
}
