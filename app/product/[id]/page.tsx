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
      title: "المنتج غير موجود - أوغن",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const productImage = product.image.startsWith("http") ? product.image : `${siteUrl}${product.image}`

  return {
    title: `${product.name} - ${product.price} ج.م | أوغن`,
    description: `${product.description} متوفر بلون ${product.color}. السعر: ${product.price} ج.م. للتواصل ‎+2010 35212724.`,
    keywords: [product.name, product.style, product?.category, "نظارات", "أوغن", "مصر"],
    openGraph: {
      title: `${product.name} - أوغن`,
      description: `${product.description} السعر: ${product.price} ج.م`,
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
      title: `${product.name} - أوغن`,
      description: `${product.description} السعر: ${product.price} ج.م`,
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
      <Header />
      <ProductDetail product={product} />
      <Footer />
    </main>
  )
}
