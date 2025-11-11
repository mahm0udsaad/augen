import { getProductById } from "@/lib/product-service"
import { notFound } from "next/navigation"
import ProductDetail from "@/components/product-detail"
import Header from "@/components/header"
import Footer from "@/components/footer"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Product Not Found - Augen",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const productImage = product.images?.[0]?.image_url

  return {
    title: `${product.name} - ${product.price} EGP | Augen`,
    description: `${product.description} Available in ${product.color}. Price: ${product.price} EGP. Contact us at +2010 35212724.`,
    keywords: [product.name, product.style, product?.category, "eyewear", "Augen", "Egypt"],
    openGraph: {
      title: `${product.name} - Augen`,
      description: `${product.description} Price: ${product.price} EGP`,
      type: "website",
      images: [
        {
          url: productImage,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
      ],
      siteName: "Augen",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - Augen`,
      description: `${product.description} Price: ${product.price} EGP`,
      images: [productImage],
    },
    alternates: {
      canonical: `/product/${id}`,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background" style={{ viewTransitionName: `product-page-${id}` }}>
      <Header language="en" />
      <ProductDetail product={product} />
      <Footer language="en" />
    </main>
  )
}
