import type { Metadata } from "next"
import HomeClient from "./home-client"

export const metadata: Metadata = {
  title: "Augen – Luxury Eyewear Collections | Home",
  description:
    "Explore Augen's hand-finished eyewear curated for every style. Connect with our concierge team at ‎+2010 35212724.",
  openGraph: {
    title: "Augen – Luxury Eyewear Collections",
    description: "Discover meticulously crafted frames that elevate your daily look.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Augen Eyewear Collection",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Augen – Luxury Eyewear Collections",
    description: "Discover meticulously crafted frames that elevate your daily look.",
    images: ["/og.png"],
  },
}

export default function Home() {
  return <HomeClient />
}
